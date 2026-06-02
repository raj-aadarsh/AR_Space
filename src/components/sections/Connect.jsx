import { useState, useRef, useEffect } from 'react'
import { useViewport } from '../../utils/viewport.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sans, mono, C } from '../../utils/theme.jsx'

gsap.registerPlugin(ScrollTrigger)

const CONTACT_LINKS = [
  {
    label:   'Email',
    display: 'aadarshraj125@outlook.com',
    href:    'mailto:aadarshraj125@outlook.com',
  },
  {
    label:   'LinkedIn',
    display: 'linkedin.com/in/aadarsh-raj',
    href:    'https://linkedin.com/in/aadarsh-raj',
  },
  {
    label:   'GitHub',
    display: 'github.com/raj-aadarsh',
    href:    'https://github.com/raj-aadarsh',
  },
]

function ContactLink({ item }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={item.href}
      target={item.href.startsWith('mailto') ? '_self' : '_blank'}
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.1rem 1.25rem',
        border: `1px solid ${hovered ? C.blue + '55' : C.border}`,
        background: hovered ? 'rgba(59,130,246,0.04)' : 'transparent',
        textDecoration: 'none',
        transition: 'border-color 0.22s, background 0.22s',
        cursor: 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <span style={{ fontFamily: mono, fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.blue }}>
          {item.label}
        </span>
        <span style={{ fontFamily: sans, fontSize: '0.9rem', color: hovered ? C.text : C.muted, transition: 'color 0.22s' }}>
          {item.display}
        </span>
      </div>
      <span style={{ fontFamily: mono, fontSize: '0.9rem', color: hovered ? C.blue : C.muted, transition: 'color 0.22s', marginLeft: '1rem' }}>
        →
      </span>
    </a>
  )
}

export default function Connect() {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const contentRef = useRef(null)
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
    if (!contentRef.current) return
    gsap.set(contentRef.current, { autoAlpha: 0, y: 24 })
    gsap.to(contentRef.current, {
      autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: contentRef.current, start: 'top 83%' },
    })
  }, [])

  // Text sits on the left, object glides right
  const scrim = isMobile
    ? { position: 'absolute', inset: 0, background: 'rgba(8,11,17,0.5)', zIndex: 1, pointerEvents: 'none' }
    : { position: 'absolute', top: 0, left: 0, bottom: 0, width: '62%', zIndex: 1, pointerEvents: 'none',
        background: `linear-gradient(to right, ${C.bg} 55%, transparent 100%)` }

  return (
    <section id="connect" ref={sectionRef} style={{
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
          Connect With <span style={{ color: C.blue }}>Me</span>
        </h2>

        <div ref={contentRef} style={{ maxWidth: isMobile ? '100%' : isNarrowVp ? '60%' : '560px', visibility: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {CONTACT_LINKS.map(item => <ContactLink key={item.label} item={item} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
