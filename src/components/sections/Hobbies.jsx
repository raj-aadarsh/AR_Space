import { useRef, useEffect } from 'react'
import { useViewport } from '../../utils/viewport.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sans, mono, C } from '../../utils/theme.jsx'

gsap.registerPlugin(ScrollTrigger)

const GROUPS = [
  {
    category: 'Sports & Gaming',
    items:    ['Skating', 'Console Games', 'Pickleball'],
  },
  {
    category: 'Creativity',
    items:    ['Canva', 'Drawing', 'Blender'],
  },
  {
    category: 'Organisation',
    items:    ['Event Management'],
  },
]

function HobbyGroup({ group, isLast }) {
  const ref = useRef()

  useEffect(() => {
    gsap.set(ref.current, { autoAlpha: 0, y: 24 })
    gsap.to(ref.current, {
      autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 83%' },
    })
  }, [])

  return (
    <div
      ref={ref}
      style={{
        paddingBottom: isLast ? 0 : '1.25rem',
        marginBottom:  isLast ? 0 : '1.25rem',
        borderBottom:  isLast ? 'none' : `1px solid ${C.border}`,
        visibility: 'hidden',
      }}
    >
      <span style={{
        display: 'block',
        fontFamily: mono, fontSize: '0.65rem',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: C.blue, marginBottom: '0.875rem',
      }}>
        {group.category}
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {group.items.map(item => (
          <span key={item} style={{
            fontFamily: mono, fontSize: '0.78rem',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '0.38rem 0.9rem',
            border: `1px solid ${C.border}`,
            color: C.muted,
          }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Hobbies() {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
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

  // Text sits on the right, object glides left
  const scrim = isMobile
    ? { position: 'absolute', inset: 0, background: 'rgba(8,11,17,0.5)', zIndex: 1, pointerEvents: 'none' }
    : { position: 'absolute', top: 0, right: 0, bottom: 0, width: '62%', zIndex: 1, pointerEvents: 'none',
        background: `linear-gradient(to left, ${C.bg} 55%, transparent 100%)` }

  return (
    <section id="hobbies" ref={sectionRef} style={{
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
          Hobbies &amp; <span style={{ color: C.blue }}>Interests</span>
        </h2>
        <div style={{ marginLeft: isMobile ? 0 : 'auto', maxWidth: isMobile ? '100%' : isNarrowVp ? '60%' : '620px' }}>
          {GROUPS.map((group, i) => (
            <HobbyGroup key={group.category} group={group} isLast={i === GROUPS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
