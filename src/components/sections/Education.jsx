import { useRef, useEffect } from 'react'
import { useViewport } from '../../utils/viewport.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sans, mono, C } from '../../utils/theme.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function Education() {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const cardRef    = useRef(null)
  const vp       = useViewport()
  const isMobile   = vp === 'mobile'
  const isNarrowVp = vp === 'tablet-portrait' || vp === 'phone-landscape'

  useEffect(() => {
    if (!headingRef.current) return
    gsap.set(headingRef.current, { autoAlpha: 0, y: 20 })
    gsap.to(headingRef.current, {
      autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
    })
  }, [])

  useEffect(() => {
    if (!cardRef.current) return
    gsap.set(cardRef.current, { autoAlpha: 0, y: 24 })
    gsap.to(cardRef.current, {
      autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: cardRef.current, start: 'top 83%' },
    })
  }, [])

  // Text sits on the left, object glides right
  const scrim = isMobile
    ? { position: 'absolute', inset: 0, background: 'rgba(8,11,17,0.5)', zIndex: 1, pointerEvents: 'none' }
    : { position: 'absolute', top: 0, left: 0, bottom: 0, width: '62%', zIndex: 1, pointerEvents: 'none',
        background: `linear-gradient(to right, ${C.bg} 55%, transparent 100%)` }

  return (
    <section id="education" ref={sectionRef} style={{
      position: 'relative', zIndex: 1, background: 'transparent',
      padding: isMobile ? '3rem 0' : '9rem 0', overflow: 'hidden',
    }}>
      <div aria-hidden style={scrim} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1440px', margin: '0 auto', padding: isMobile ? '0 5%' : '0 4%' }}>
        <h2 ref={headingRef} style={{
          fontFamily: sans, fontWeight: 700,
          fontSize: isMobile ? 'clamp(1.4rem, 6.5vw, 2rem)' : 'clamp(2.25rem, 5vw, 4rem)',
          letterSpacing: '-0.02em', color: C.text,
          marginBottom: isMobile ? '1.75rem' : '3rem',
          visibility: 'hidden',
        }}>
          Education
        </h2>

        <div ref={cardRef} style={{ maxWidth: isMobile ? '100%' : isNarrowVp ? '60%' : '620px', visibility: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <span style={{ fontFamily: mono, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue }}>
              RV Institute of Technology and Management, Bengaluru
            </span>
            <span style={{ fontFamily: mono, fontSize: '0.65rem', color: C.muted }}>
              Aug 2019 – Jun 2023
            </span>
          </div>

          <h3 style={{ fontFamily: sans, fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.01em', color: C.text, marginBottom: '0.5rem' }}>
            Bachelor of Engineering — Information Science
          </h3>

          <p style={{ fontFamily: mono, fontSize: '0.72rem', color: C.muted, marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
            CGPA 8.23 / 10
          </p>

          <p style={{ fontFamily: sans, fontSize: '0.875rem', color: C.muted, lineHeight: 1.8, marginBottom: '1.25rem' }}>
            Four-year undergraduate programme covering software engineering, data structures, algorithms, computer networks, and systems design. Final year research on blockchain-based agricultural supply chain traceability was peer-reviewed and published in TIJER, July 2023.
          </p>
        </div>
      </div>
    </section>
  )
}
