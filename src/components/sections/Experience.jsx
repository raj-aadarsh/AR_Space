import { useRef, useEffect } from 'react'
import { useViewport } from '../../utils/viewport.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sans, mono, C } from '../../utils/theme.jsx'

gsap.registerPlugin(ScrollTrigger)

const JOBS = [
  {
    role:    'Software Engineer I',
    company: 'Zebra Technologies',
    period:  'Jun 2024 – Present',
    para: 'Deep in the Android OS stack — AOSP builds, BSP layers, HAL implementations, and AIDL platform services on enterprise mobile hardware. Authoring Java platform services that run on millions of devices across warehouses and healthcare, where stability is the only metric that matters.',
  },
  {
    role:    'Associate Software Engineer',
    company: 'Tech Mahindra → Zebra Technologies',
    period:  'Aug 2023 – May 2024',
    para: 'Shipped a Gen-AI log analyzer (LangChain + OpenAI) from scratch within months of going full-time. Led full-stack development of a Django + React + MongoDB application, scaling an intern prototype into a production tool used daily by the engineering org.',
  },
  {
    role:    'Software Engineering Intern',
    company: 'Zebra Technologies',
    period:  'Jan 2023 – Jun 2023',
    para: 'Developed backend Django services and internal tooling that shipped into the broader product. Built a Jenkins CI/CD dashboard to visualize pipeline health across Zebra\'s build infrastructure — still in daily use by the team.',
  },
]

function JobCard({ job, isLast }) {
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
        paddingBottom: isLast ? 0 : '2.75rem',
        marginBottom:  isLast ? 0 : '2.75rem',
        borderBottom:  isLast ? 'none' : `1px solid ${C.border}`,
        visibility: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', flexWrap: 'wrap', gap: '0.4rem',
        marginBottom: '0.4rem',
      }}>
        <span style={{ fontFamily: mono, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue }}>
          {job.company}
        </span>
        <span style={{ fontFamily: mono, fontSize: '0.65rem', color: C.muted }}>
          {job.period}
        </span>
      </div>

      <h3 style={{
        fontFamily: sans, fontWeight: 700, fontSize: '1.15rem',
        letterSpacing: '-0.01em', color: C.text, marginBottom: '0.9rem',
      }}>
        {job.role}
      </h3>

      <p style={{
        fontFamily: sans, fontSize: '0.875rem',
        color: C.muted, lineHeight: 1.8,
      }}>
        {job.para}
      </p>
    </div>
  )
}

export default function Experience() {
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

  // Readability scrim — text sits on the right, object glides left
  const scrim = isMobile
    ? { position: 'absolute', inset: 0, background: 'rgba(8,11,17,0.5)', zIndex: 1, pointerEvents: 'none' }
    : { position: 'absolute', top: 0, right: 0, bottom: 0, width: '62%', zIndex: 1, pointerEvents: 'none',
        background: `linear-gradient(to left, ${C.bg} 55%, transparent 100%)` }

  return (
    <section id="experience" ref={sectionRef} style={{
      position: 'relative', zIndex: 1, background: 'transparent',
      padding: isMobile ? '3rem 0' : '9rem 0', overflow: 'hidden',
    }}>
      <div aria-hidden style={scrim} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1440px', margin: '0 auto', padding: isMobile ? '0 5%' : '0 4%' }}>
        <h2 ref={headingRef} style={{
          fontFamily: sans, fontWeight: 700,
          fontSize: isMobile ? 'clamp(1.4rem, 6.5vw, 2rem)' : 'clamp(2.25rem, 5vw, 4rem)',
          letterSpacing: '-0.02em', color: C.text,
          marginBottom: isMobile ? '1.75rem' : '4rem',
          visibility: 'hidden',
        }}>
          The <span style={{ color: C.blue }}>Work</span>
        </h2>
        <div style={{ marginLeft: isMobile ? 0 : 'auto', maxWidth: isMobile ? '100%' : isNarrowVp ? '60%' : '680px' }}>
          {JOBS.map((job, i) => (
            <JobCard key={job.role} job={job} isLast={i === JOBS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
