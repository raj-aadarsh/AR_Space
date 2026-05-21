import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { C, sans, mono, Section, SectionLabel, SectionHeading } from '../../utils/theme.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const leftRef  = useRef(null)
  const rightRef = useRef(null)

  useEffect(() => {
    gsap.set([leftRef.current, rightRef.current], { autoAlpha: 0, y: 36 })
    gsap.to(leftRef.current,  { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: leftRef.current,  start: 'top 78%' } })
    gsap.to(rightRef.current, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.12, scrollTrigger: { trigger: rightRef.current, start: 'top 78%' } })
  }, [])

  return (
    <Section id="about" style={{ borderTop: `1px solid ${C.border}` }}>
      <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>

        {/* Left — bio */}
        <div ref={leftRef} style={{ visibility: 'hidden' }}>
          <SectionLabel number="01" label="About" />
          <SectionHeading>
            I build at the<br />
            <span style={{ color: C.blue }}>framework layer.</span>
          </SectionHeading>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontFamily: sans, fontSize: '1.0625rem', lineHeight: 1.8, color: C.muted }}>
              Software Engineer at Zebra Technologies, working deep in the Android OS — AOSP, BSP, and the framework layers that power enterprise mobile hardware. My job is Java, reliability, and making sure devices that run warehouses and hospitals don't fail.
            </p>
            <p style={{ fontFamily: sans, fontSize: '1.0625rem', lineHeight: 1.8, color: C.muted }}>
              On top of that, I ship full-stack products — built a Gen-AI log analyzer that's in production, led a Django + React + MongoDB app from internship to full scale, and published research on blockchain supply chains.
            </p>
            <p style={{ fontFamily: sans, fontSize: '1.0625rem', lineHeight: 1.8, color: C.muted }}>
              When I'm not in code I'm into graphic design, skating, and event management — I like things that are well-crafted and move fast.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '2.5rem', paddingTop: '2rem', borderTop: `1px solid ${C.border}` }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', flexShrink: 0, animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: mono, fontSize: '0.75rem', color: C.muted }}>Available for select opportunities · Bengaluru, India</span>
          </div>
        </div>

        {/* Right — quick facts */}
        <div ref={rightRef} style={{ visibility: 'hidden' }}>
          <div style={{ border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {[
              { k: 'Currently',  v: 'Software Engineer I · Zebra Technologies' },
              { k: 'Since',      v: 'June 2024' },
              { k: 'Education',  v: 'BE Information Science, RVITM — 8.23 CGPA' },
              { k: 'Graduated',  v: 'June 2023' },
              { k: 'Location',   v: 'Bengaluru, India' },
              { k: 'Interests',  v: 'Graphic Design · Skating · Event Management' },
            ].map(({ k, v }, i, arr) => (
              <div
                key={k}
                style={{
                  display: 'flex', gap: '1.25rem', padding: '0.9375rem 1.5rem',
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                  transition: 'background 0.2s',
                  alignItems: 'flex-start',
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.blueGlow}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontFamily: mono, fontSize: '0.68rem', letterSpacing: '0.05em', color: C.muted, width: '74px', flexShrink: 0, marginTop: '2px', textTransform: 'uppercase' }}>{k}</span>
                <span style={{ fontFamily: sans, fontSize: '0.9375rem', color: C.text, lineHeight: 1.55 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Publication callout */}
          <div style={{
            marginTop: '1rem', padding: '1rem 1.25rem',
            border: `1px solid ${C.border}`,
            display: 'flex', gap: '1rem', alignItems: 'flex-start',
          }}>
            <span style={{ fontFamily: mono, fontSize: '0.75rem', color: C.blue, flexShrink: 0 }}>📄</span>
            <div>
              <p style={{ fontFamily: mono, fontSize: '0.68rem', color: C.muted, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Published</p>
              <p style={{ fontFamily: sans, fontSize: '0.875rem', color: C.text, lineHeight: 1.5 }}>
                AgriTrace: Blockchain-based Supply Chain with Price Prediction
                <a href="https://tijer.org/tijer/viewpaperforall.php?paper=TIJERA001016" target="_blank" rel="noopener noreferrer" style={{ color: C.blue, textDecoration: 'none', marginLeft: '0.375rem', fontSize: '0.75rem' }}>
                  TIJER Jul 2023 ↗
                </a>
              </p>
            </div>
          </div>
        </div>

      </div>
    </Section>
  )
}
