import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { C, sans, mono, Section } from '../../utils/theme.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const topRef = useRef(null)
  const botRef = useRef(null)

  useEffect(() => {
    gsap.set([topRef.current, botRef.current], { autoAlpha: 0, y: 36 })
    gsap.to(topRef.current, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: topRef.current, start: 'top 78%' } })
    gsap.to(botRef.current, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15, scrollTrigger: { trigger: botRef.current, start: 'top 80%' } })
  }, [])

  return (
    <Section id="contact" style={{ borderTop: `1px solid ${C.border}` }}>

      {/* Top — headline */}
      <div ref={topRef} style={{ visibility: 'hidden', marginBottom: '5rem' }}>
        <p style={{ fontFamily: mono, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.muted, marginBottom: '1.25rem' }}>
          06 — Contact
        </p>
        <h2 style={{
          fontFamily: sans, fontWeight: 800,
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          lineHeight: 1.0, letterSpacing: '-0.03em',
          color: C.text, marginBottom: '1.5rem',
        }}>
          Got something<br />
          <span style={{ color: C.blue }}>interesting?</span>
        </h2>
        <p style={{ fontFamily: sans, fontSize: '1.0625rem', color: C.muted, lineHeight: 1.8, maxWidth: '480px' }}>
          I'm a Software Engineer who builds deep in the Android stack and ships full products end-to-end. If you're working on something hard and need someone who can move fast across layers — let's talk.
        </p>
      </div>

      {/* Bottom — two columns */}
      <div ref={botRef} className="about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', visibility: 'hidden' }}>

        {/* Left — reach out */}
        <div>
          <p style={{ fontFamily: mono, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: '1.25rem' }}>
            Reach out
          </p>

          <a
            href="mailto:aadarshraj125@outlook.com"
            style={{
              display: 'block',
              fontFamily: sans, fontWeight: 700,
              fontSize: 'clamp(1rem, 2.5vw, 1.375rem)',
              color: C.text, textDecoration: 'none',
              letterSpacing: '-0.01em', marginBottom: '0.5rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.blue}
            onMouseLeave={e => e.currentTarget.style.color = C.text}
          >
            aadarshraj125@outlook.com ↗
          </a>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'LinkedIn', href: 'https://linkedin.com/in/aadarsh-raj' },
              { label: 'GitHub',   href: 'https://github.com/raj-aadarsh' },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: mono, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '0.625rem 1.125rem',
                border: `1px solid ${C.border}`,
                color: C.muted, textDecoration: 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.blue}50`; e.currentTarget.style.color = C.blue }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}
              >
                {label} ↗
              </a>
            ))}
            <a href="/AR_Space/resume.pdf" download="Aadarsh_Raj_Resume.pdf" className="resume-btn" style={{
              fontFamily: mono, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '0.625rem 1.125rem',
              border: `1px solid ${C.border}`,
              color: C.muted, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.blue}50`; e.currentTarget.style.color = C.blue }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}
            >
              <span className="dl-arrow">↓</span> Resume
            </a>
          </div>
        </div>

        {/* Right — quick facts + availability */}
        <div>
          <p style={{ fontFamily: mono, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: '1.25rem' }}>
            At a glance
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              ['Role',       'Software Engineer I, Zebra Technologies'],
              ['Based in',   'Bengaluru, India'],
              ['Open to',    'Full-time · Contract · Consulting'],
              ['Strongest',  'Android Framework · Python · Full-Stack'],
              ['Published',  'TIJER 2023 — Blockchain + ML research'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                <span style={{ fontFamily: mono, fontSize: '0.68rem', color: C.muted, width: '68px', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</span>
                <span style={{ fontFamily: sans, fontSize: '0.9rem', color: C.text }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '2rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s infinite', flexShrink: 0 }} />
            <span style={{ fontFamily: mono, fontSize: '0.72rem', color: C.muted }}>Available for select opportunities</span>
          </div>
        </div>

      </div>

      {/* Footer line */}
      <div style={{ marginTop: '6rem', paddingTop: '1.5rem', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <p style={{ fontFamily: mono, fontSize: '0.68rem', color: C.faint }}>
          Designed &amp; built by <span style={{ color: C.blue }}>Aadarsh Raj</span>
        </p>
        <p style={{ fontFamily: mono, fontSize: '0.68rem', color: C.faint }}>
          React · Three.js · GSAP · Lenis
        </p>
      </div>
    </Section>
  )
}
