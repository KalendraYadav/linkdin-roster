import { ImageResponse } from '@vercel/og'
import { supabaseServer } from '@/lib/supabase'

// -- Worst score logic --
function getWorstScore(scores: Record<string, { value: number; label: string }>) {
  // Cringe Factor is inverted - higher is worse
  // Normalize it so we can compare fairly: worse = lower normalized value
  const normalized = {
    cringeFactor:    { value: 100 - scores.cringeFactor.value,    label: scores.cringeFactor.label,    name: 'Cringe Factor' },
    authenticity:    { value: scores.authenticity.value,           label: scores.authenticity.label,    name: 'Authenticity' },
    recruiterAppeal: { value: scores.recruiterAppeal.value,        label: scores.recruiterAppeal.label, name: 'Recruiter Appeal' },
    keywordDensity:  { value: scores.keywordDensity.value,         label: scores.keywordDensity.label,  name: 'Keyword Density' },
  }

  // Priority order for tie-breaking: Cringe > Authenticity > Recruiter > Keyword
  const priority = ['cringeFactor', 'authenticity', 'recruiterAppeal', 'keywordDensity']

  let worst = { name: 'Cringe Factor', displayValue: scores.cringeFactor.value, label: scores.cringeFactor.label, normalizedValue: normalized.cringeFactor.value }

  for (const key of priority) {
    const entry = normalized[key as keyof typeof normalized]
    if (entry.value < worst.normalizedValue) {
      worst = {
        name: entry.name,
        label: entry.label,
        normalizedValue: entry.value,
        displayValue: key === 'cringeFactor'
          ? scores.cringeFactor.value
          : scores[key as keyof typeof scores].value
      }
    }
  }

  return worst
}

// -- Hook extraction --
function extractHook(roastText: string): string {
  const sentences = roastText
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean)

  const first = sentences[0] ?? ''
  if (first.length <= 120) return first

  const second = sentences[1] ?? ''
  if (second.length <= 120) return second

  return first.slice(0, 117) + '...'
}

// -- Fallback OG image --
function fallbackImage() {
  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        backgroundColor: '#0a0a0a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        border: '8px solid #CCFF00',
        fontFamily: 'monospace',
      }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>💀</div>
        <div style={{ fontSize: '48px', fontWeight: 900,
          color: '#CCFF00', textAlign: 'center', padding: '0 60px' }}>
          Your LinkedIn is Cringe.
        </div>
        <div style={{ fontSize: '28px', color: '#f5f5f5',
          marginTop: '20px' }}>
          {'Let AI Fix It \u2014 LinkedRoast'}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const id = typeof resolvedParams?.id === 'string' ? resolvedParams.id : ''

    if (!id) {
      return fallbackImage()
    }

    const { data, error } = await supabaseServer
      .from('roasts')
      .select('scores, roast')
      .eq('id', id)
      .single()

    if (error || !data) {
      return fallbackImage()
    }

    if (!data.scores || typeof data.roast !== 'string') {
      return fallbackImage()
    }

    const scores = data.scores as Record<string, { value: number; label: string }>
    const worst = getWorstScore(scores)
    const hook = extractHook(data.roast)

    return new ImageResponse(
      (
        <div style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'monospace',
          border: '8px solid #CCFF00',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{
              fontSize: '22px',
              color: '#CCFF00',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '4px',
            }}>
              {'LINKEDROAST'}
            </div>
            <div style={{
              fontSize: '18px',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}>
              {'AI Profile Roaster'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              fontSize: '20px',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '3px',
            }}>
              {worst.name}
            </div>
            <div style={{
              fontSize: '120px',
              fontWeight: 900,
              color: '#CCFF00',
              lineHeight: 1,
            }}>
              {`${worst.displayValue}/100`}
            </div>
            <div style={{
              display: 'flex',
              backgroundColor: '#CCFF00',
              color: '#000',
              fontSize: '24px',
              fontWeight: 700,
              padding: '8px 20px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              width: 'fit-content',
            }}>
              {worst.label}
            </div>
          </div>

          <div style={{
            fontSize: '26px',
            color: '#f5f5f5',
            lineHeight: 1.5,
            borderLeft: '4px solid #CCFF00',
            paddingLeft: '24px',
            maxWidth: '900px',
          }}>
            {`"${hook}"`}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )

  } catch (err) {
    console.error('[OG Image] Crashed:', err)
    return fallbackImage()
  }
}
