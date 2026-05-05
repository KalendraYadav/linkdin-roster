'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_DATA = {
  headline:
    'Visionary Ninja | 10x Developer | Ex-FAANG | Disrupting the disruption space 🚀',
  about:
    "I wake up at 4 AM to grind. I don't work for money — I work for impact. Blockchain. AI. Web3. I've shipped 47 MVPs in 6 months. Mentor. Hustler. Thought leader. I once closed a deal from a hot air balloon.",
  experience:
    'CEO & Founder @ StealthStartup (2019–Present): Revolutionizing everything.\n\nGrowth Hacker @ ViralCo (2017–2019): Grew users from 0 to 0.',
}

const LIMITS = { headline: 220, about: 2600, experience: 4000 }

export default function HomePage() {
  const router = useRouter()

  const [headline, setHeadline] = useState('')
  const [about, setAbout] = useState('')
  const [experience, setExperience] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')

  const [touched, setTouched] = useState({ headline: false, about: false })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = {
      headline: localStorage.getItem('lr_headline') ?? '',
      about: localStorage.getItem('lr_about') ?? '',
      experience: localStorage.getItem('lr_experience') ?? '',
    }
    setHeadline(saved.headline)
    setAbout(saved.about)
    setExperience(saved.experience)
  }, [])

  useEffect(() => {
    localStorage.setItem('lr_headline', headline)
  }, [headline])

  useEffect(() => {
    localStorage.setItem('lr_about', about)
  }, [about])

  useEffect(() => {
    localStorage.setItem('lr_experience', experience)
  }, [experience])

  const progress =
    (headline.length > 10 ? 40 : 0) +
    (about.length > 10 ? 40 : 0) +
    (experience.length > 10 ? 10 : 0) +
    (imageFile ? 10 : 0)

  const isOverLimit =
    headline.length > LIMITS.headline ||
    about.length > LIMITS.about ||
    experience.length > LIMITS.experience

  const isSubmitDisabled =
    !headline.trim() || !about.trim() || isOverLimit || isLoading

  const loadDemo = () => {
    setHeadline(DEMO_DATA.headline)
    setAbout(DEMO_DATA.about)
    setExperience(DEMO_DATA.experience)
    localStorage.setItem('lr_headline', DEMO_DATA.headline)
    localStorage.setItem('lr_about', DEMO_DATA.about)
    localStorage.setItem('lr_experience', DEMO_DATA.experience)
    setErrorMessage('')
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageError('')

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setImageError('Images only (JPG, PNG, WEBP).')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('File too large. Keep it under 5MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    setTouched({ headline: true, about: true })
    setErrorMessage('')

    if (!headline.trim() || !about.trim()) return

    if (isOverLimit) {
      setErrorMessage('Fix the fields above before submitting.')
      return
    }

    setIsLoading(true)

    try {
      const fd = new FormData()
      fd.append('headline', headline)
      fd.append('about', about)
      if (experience) fd.append('experience', experience)
      if (imageFile) fd.append('profile_image', imageFile)

      const res = await fetch('/api/v1/roasts', {
        method: 'POST',
        body: fd,
      })

      const json = await res.json()

      if (res.status === 429) {
        setErrorMessage("You've reached today's roast limit 💀")
        setIsLoading(false)
        return
      }

      if (!res.ok) {
        setErrorMessage(
          json?.error?.message ||
            'Our AI is too disgusted to respond right now. Try again.'
        )
        setIsLoading(false)
        return
      }

      localStorage.removeItem('lr_headline')
      localStorage.removeItem('lr_about')
      localStorage.removeItem('lr_experience')

      const roastId = json.data.roast_id
      router.push(`/roast/${roastId}`)
    } catch {
      setErrorMessage('Something went wrong. Check your connection and try again.')
      setIsLoading(false)
    }
  }

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#0a0a0a',
    color: '#f5f5f5',
    border: '2px solid #f5f5f5',
    padding: '1rem',
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: '1rem',
    resize: 'vertical',
    boxSizing: 'border-box',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#f5f5f5',
  }

  const headlinePlaceholder =
    'e.g. "Visionary Product Leader | Ex-Google | Building the future of..." (don\'t be this person)'
  const aboutPlaceholder =
    "Paste your LinkedIn About section here. Be honest — the AI will know if you're not."
  const experiencePlaceholder =
    'Paste your work experience here. Optional but makes the roast way more brutal.'

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#f5f5f5',
        fontFamily: 'Space Grotesk, sans-serif',
        padding: '2rem',
        maxWidth: '720px',
        margin: '0 auto',
      }}
    >
      <section style={{ marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1
          style={{
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            margin: '0 0 1rem',
            color: '#f5f5f5',
          }}
        >
          Your LinkedIn is{' '}
          <span style={{ color: '#CCFF00' }}>Cringe.</span>
          <br />Let AI Fix It.
        </h1>
        <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Paste your profile. Get roasted. Get rewritten. Go viral.
        </p>
        <button
          onClick={loadDemo}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            color: '#CCFF00',
            border: '2px solid #CCFF00',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.875rem',
          }}
          onMouseEnter={(e) => {
            ;(e.target as HTMLButtonElement).style.backgroundColor = '#CCFF00'
            ;(e.target as HTMLButtonElement).style.color = '#000'
          }}
          onMouseLeave={(e) => {
            ;(e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
            ;(e.target as HTMLButtonElement).style.color = '#CCFF00'
          }}
        >
          Try with demo profile
        </button>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <p
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
            color: '#CCFF00',
          }}
        >
          Profile Completion: {progress}%
        </p>
        <div
          style={{
            width: '100%',
            height: '12px',
            border: '2px solid #f5f5f5',
            backgroundColor: '#0a0a0a',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              backgroundColor: '#CCFF00',
              height: '100%',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <div style={labelStyle}>
            <span>Headline *</span>
            <span
              style={{
                color: headline.length > LIMITS.headline ? '#FF2D2D' : '#888',
              }}
            >
              {headline.length} / {LIMITS.headline}
            </span>
          </div>
          <textarea
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, headline: true }))}
            placeholder={headlinePlaceholder}
            rows={3}
            style={{
              ...textareaStyle,
              borderColor:
                headline.length > LIMITS.headline
                  ? '#FF2D2D'
                  : touched.headline && !headline.trim()
                  ? '#FF2D2D'
                  : '#f5f5f5',
            }}
          />
          {touched.headline && !headline.trim() && (
            <p
              style={{
                color: '#FF2D2D',
                fontSize: '0.8rem',
                fontFamily: 'Space Mono, monospace',
                marginTop: '0.25rem',
              }}
            >
              We need something to roast. Fill this out.
            </p>
          )}
        </div>

        <div>
          <div style={labelStyle}>
            <span>About *</span>
            <span style={{ color: about.length > LIMITS.about ? '#FF2D2D' : '#888' }}>
              {about.length} / {LIMITS.about}
            </span>
          </div>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, about: true }))}
            placeholder={aboutPlaceholder}
            rows={6}
            style={{
              ...textareaStyle,
              borderColor:
                about.length > LIMITS.about
                  ? '#FF2D2D'
                  : touched.about && !about.trim()
                  ? '#FF2D2D'
                  : '#f5f5f5',
            }}
          />
          {touched.about && !about.trim() && (
            <p
              style={{
                color: '#FF2D2D',
                fontSize: '0.8rem',
                fontFamily: 'Space Mono, monospace',
                marginTop: '0.25rem',
              }}
            >
              We need something to roast. Fill this out.
            </p>
          )}
        </div>

        <div>
          <div style={labelStyle}>
            <span>Experience (optional)</span>
            <span
              style={{
                color: experience.length > LIMITS.experience ? '#FF2D2D' : '#888',
              }}
            >
              {experience.length} / {LIMITS.experience}
            </span>
          </div>
          <textarea
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder={experiencePlaceholder}
            rows={5}
            style={{
              ...textareaStyle,
              borderColor:
                experience.length > LIMITS.experience ? '#FF2D2D' : '#f5f5f5',
            }}
          />
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #f5f5f5',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: '#0a0a0a',
              }}
            >
              <p style={{ margin: 0, fontSize: '1.1rem' }}>
                📸 Drop profile photo here (optional)
              </p>
              <p
                style={{
                  margin: '0.5rem 0 0',
                  color: '#888',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.75rem',
                }}
              >
                JPG, PNG, WEBP • Max 5MB
              </p>
            </div>
          ) : (
            <div
              style={{
                border: '2px solid #f5f5f5',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  height: '80px',
                  width: '80px',
                  objectFit: 'cover',
                  border: '1px solid #f5f5f5',
                }}
              />
              <button
                onClick={removeImage}
                style={{
                  backgroundColor: 'transparent',
                  color: '#FF2D2D',
                  border: '2px solid #FF2D2D',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.75rem',
                }}
              >
                ✕ Remove
              </button>
            </div>
          )}
          {imageError && (
            <p
              style={{
                color: '#FF2D2D',
                fontSize: '0.8rem',
                fontFamily: 'Space Mono, monospace',
                marginTop: '0.25rem',
              }}
            >
              {imageError}
            </p>
          )}
        </div>

        {errorMessage && (
          <p
            style={{
              color: '#FF2D2D',
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              border: '2px solid #FF2D2D',
              padding: '0.75rem',
            }}
          >
            {errorMessage}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          style={{
            width: '100%',
            padding: '1.25rem',
            backgroundColor: isSubmitDisabled ? '#333' : '#CCFF00',
            color: isSubmitDisabled ? '#666' : '#000',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            textTransform: 'uppercase',
            border: 'none',
            cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
            fontFamily: 'Space Mono, monospace',
            transition: 'background-color 0.1s ease',
          }}
        >
          {isLoading ? 'Submitting... 🔥' : 'Roast My Profile 🔥'}
        </button>

        <p
          style={{
            textAlign: 'center',
            color: '#888',
            fontSize: '0.75rem',
            fontFamily: 'Space Mono, monospace',
            margin: 0,
          }}
        >
          🔒 We do not store your data permanently.
        </p>
      </section>

      <footer
        style={{
          marginTop: '4rem',
          textAlign: 'center',
          color: '#444',
          fontSize: '0.75rem',
          fontFamily: 'Space Mono, monospace',
          paddingBottom: '2rem',
        }}
      >
        LinkedRoast © 2025 • Made with 🔥 and questionable ethics
      </footer>
    </main>
  )
}
