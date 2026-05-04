import OpenAI from 'openai'
import { roastStore } from '@/lib/store'

const FALLBACK_SCORES = {
  recruiterAppeal: {
    value: 42,
    label: 'Needs Help',
    insight: 'Recruiters would scroll past this in 0.3 seconds.'
  },
  keywordDensity: {
    value: 61,
    label: 'Buzzword Bingo',
    insight: 'LinkedIn keywords: yes. Meaning: no.'
  },
  authenticity: {
    value: 28,
    label: 'Fake Detected 🤖',
    insight: 'This reads like ChatGPT wrote your soul.'
  },
  cringeFactor: {
    value: 87,
    label: 'Certified Cringe 💀',
    insight: 'Your mother would be concerned.'
  }
}

const FALLBACK_ROAST = `Your headline reads like a fortune cookie 
had a LinkedIn phase. "Visionary Ninja"? The only thing you're 
disrupting is everyone's ability to take you seriously. You've 
listed buzzwords without explaining what you actually DO with 
any of them. This profile is a masterclass in saying everything 
while communicating nothing.`

const FALLBACK_REWRITE = `Product professional with hands-on 
experience building and shipping real products. Focused on 
measurable outcomes and clear communication over buzzwords. 
Currently seeking roles where execution matters more than 
personal branding.`

export async function POST(request: Request) {
  console.log('[API] POST /api/v1/roasts - request received')

  let headline = ''
  let about = ''
  let experience = ''

  try {
    const formData = await request.formData()
    headline = formData.get('headline')?.toString().trim() ?? ''
    about = formData.get('about')?.toString().trim() ?? ''
    experience = formData.get('experience')?.toString().trim() ?? ''
    console.log('[API] Parsed form data:', {
      headlineLen: headline.length,
      aboutLen: about.length,
      experienceLen: experience.length
    })
  } catch (parseError) {
    console.error('[API] Failed to parse form data:', parseError)
    return Response.json(
      { error: { message: 'Invalid form data', code: 'PARSE_ERROR' }},
      { status: 400 }
    )
  }

  if (!headline) {
    console.log('[API] Validation failed: missing headline')
    return Response.json(
      { error: { message: 'Headline is required', code: 'MISSING_FIELD' }},
      { status: 400 }
    )
  }
  if (!about) {
    console.log('[API] Validation failed: missing about')
    return Response.json(
      { error: { message: 'About is required', code: 'MISSING_FIELD' }},
      { status: 400 }
    )
  }

  if (process.env.NODE_ENV !== 'development') {
    // Add production rate limiting here later
  }

  const roastId = crypto.randomUUID()
  console.log('[API] Generated roast ID:', roastId)

  roastStore.set(roastId, {
    id: roastId,
    headline,
    about,
    experience,
    status: 'processing',
    createdAt: Date.now()
  })

  const apiKey = process.env.OPENAI_API_KEY
  console.log('[API] OpenAI key present:', !!apiKey)
  console.log('[API] Key prefix:', apiKey?.slice(0, 7) ?? 'MISSING')

  if (!apiKey || apiKey.trim() === '') {
    console.warn('[API] No OpenAI key — using fallback data')
    roastStore.set(roastId, {
      id: roastId,
      headline, about, experience,
      status: 'completed',
      scores: FALLBACK_SCORES,
      roast: FALLBACK_ROAST,
      rewrite: FALLBACK_REWRITE,
      createdAt: Date.now()
    })
    return Response.json(
      { data: { roast_id: roastId, status: 'processing' }},
      { status: 202 }
    )
  }

  const openai = new OpenAI({ apiKey })

  let scores = FALLBACK_SCORES
  try {
    console.log('[API] Calling OpenAI for scores...')
    const scoreRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: false,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a LinkedIn profile analyzer. Return ONLY valid JSON, no markdown, no explanation.'
        },
        {
          role: 'user',
          content: `Analyze this LinkedIn profile. Return ONLY this exact JSON structure with no other text:
{
  "recruiterAppeal": { "value": <number 0-100>, "label": "<short label>", "insight": "<one sentence>" },
  "keywordDensity": { "value": <number 0-100>, "label": "<short label>", "insight": "<one sentence>" },
  "authenticity": { "value": <number 0-100>, "label": "<short label>", "insight": "<one sentence>" },
  "cringeFactor": { "value": <number 0-100>, "label": "<short label>", "insight": "<one sentence>" }
}

Use these label tiers:
recruiterAppeal: 0-30="Unemployable" 31-60="Needs Help" 61-80="Recruiter Ready" 81-100="Top Talent"
keywordDensity: 0-30="Ghost Profile" 31-60="Buzzword Bingo" 61-80="Well Optimized" 81-100="Keyword King"
authenticity: 0-30="Fake Detected" 31-60="Corporate Clone" 61-80="Mostly Human" 81-100="Genuinely You"
cringeFactor: 0-30="Humble Legend" 31-60="Mild Cringe" 61-80="Cringe Alert" 81-100="Certified Cringe"

Headline: ${headline}
About: ${about}
Experience: ${experience || 'Not provided'}`
        }
      ]
    })
    const raw = scoreRes.choices[0].message.content ?? '{}'
    console.log('[API] Raw scores response:', raw.slice(0, 200))
    scores = JSON.parse(raw)
    console.log('[API] Scores parsed successfully')
  } catch (scoreError) {
    console.error('[API] Score generation failed, using fallback:', scoreError)
    scores = FALLBACK_SCORES
  }

  let roast = FALLBACK_ROAST
  try {
    console.log('[API] Calling OpenAI for roast...')
    const roastRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: false,
      messages: [
        {
          role: 'system',
          content: 'You are a savage but fair LinkedIn profile roaster. Be funny and specific about the WRITING, never personal. Write 3 short punchy paragraphs.'
        },
        {
          role: 'user',
          content: `Roast this LinkedIn profile. Start with the most damning observation. Reference specific phrases they used.

Headline: ${headline}
About: ${about}
Experience: ${experience || 'Not provided'}`
        }
      ]
    })
    roast = roastRes.choices[0].message.content ?? FALLBACK_ROAST
    console.log('[API] Roast generated, length:', roast.length)
  } catch (roastError) {
    console.error('[API] Roast generation failed, using fallback:', roastError)
    roast = FALLBACK_ROAST
  }

  let rewrite = FALLBACK_REWRITE
  try {
    console.log('[API] Calling OpenAI for rewrite...')
    const rewriteRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: false,
      messages: [
        {
          role: 'system',
          content: 'You are an expert LinkedIn profile writer. No buzzwords. Specific achievements. Clear value proposition.'
        },
        {
          role: 'user',
          content: `Rewrite the About section. Remove buzzwords, add specificity. 3 short paragraphs.

Headline: ${headline}
About: ${about}
Experience: ${experience || 'Not provided'}`
        }
      ]
    })
    rewrite = rewriteRes.choices[0].message.content ?? FALLBACK_REWRITE
    console.log('[API] Rewrite generated, length:', rewrite.length)
  } catch (rewriteError) {
    console.error('[API] Rewrite generation failed, using fallback:', rewriteError)
    rewrite = FALLBACK_REWRITE
  }

  roastStore.set(roastId, {
    id: roastId,
    headline, about, experience,
    status: 'completed',
    scores,
    roast,
    rewrite,
    createdAt: Date.now()
  })
  console.log('[API] Stored completed result for:', roastId)

  return Response.json(
    { data: { roast_id: roastId, status: 'processing' }},
    { status: 202 }
  )
}
