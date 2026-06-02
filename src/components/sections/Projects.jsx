import { useRef, useEffect } from 'react'
import { useViewport } from '../../utils/viewport.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sans, mono, C } from '../../utils/theme.jsx'

gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  {
    title:  'AgriTrace',
    badge:  'Published · TIJER Jul 2023',
    para:   'A blockchain-based supply chain platform built for the agriculture sector, enabling end-to-end traceability from farm to consumer. Integrates ML-based price prediction to give farmers real-time market intelligence. The research was peer-reviewed and published in TIJER.',
    stack:  ['Solidity', 'Truffle', 'Ganache', 'React', 'Web3.js', 'Django', 'Python', 'Node.js'],
    link:   { label: 'Read the paper →', href: 'https://tijer.org/tijer/viewpaperforall.php?paper=TIJERA001016' },
  },
  {
    title:  'Android Build Analyzer',
    para:   'A full-stack platform built to bring visibility into Android build infrastructure. Started as an intern prototype and productised into a tool used daily by the engineering org — featuring real-time build streaming, pipeline health dashboards, security vulnerability detection, and an automated security scoring system to track and improve the security posture of every release build.',
    stack:  ['Python', 'Django', 'React', 'MongoDB Atlas', 'Jenkins', 'Web-Realm'],
  },
  {
    title:  'Stability AI',
    para:   'A Streamlit-based tool for analyzing Android framework crash logs across all crash types. The core analysis logic — pattern recognition, root cause inference, and diagnostic output — is custom-written. Paired with a clean, purpose-built UI covering log input, interactive controls, and structured output, making crash analysis fast and accessible.',
    stack:  ['Python', 'Streamlit', 'GenAI', 'LLM', 'LangChain'],
  },
]

function ProjectCard({ project, isLast }) {
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
        <h3 style={{
          fontFamily: sans, fontWeight: 700, fontSize: '1.15rem',
          letterSpacing: '-0.01em', color: C.text,
        }}>
          {project.title}
        </h3>
        {project.badge && (
          <span style={{ fontFamily: mono, fontSize: '0.65rem', color: C.muted }}>
            {project.badge}
          </span>
        )}
      </div>

      <p style={{
        fontFamily: sans, fontSize: '0.875rem',
        color: C.muted, lineHeight: 1.8, marginBottom: '1rem',
      }}>
        {project.para}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: project.link ? '0.875rem' : 0 }}>
        {project.stack.map(tag => (
          <span key={tag} style={{
            fontFamily: mono, fontSize: '0.6rem', letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '0.22rem 0.6rem',
            border: `1px solid ${C.border}`,
            color: C.muted,
          }}>
            {tag}
          </span>
        ))}
      </div>

      {project.link && (
        <a
          href={project.link.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: mono, fontSize: '0.7rem',
            color: C.blue, textDecoration: 'none',
            letterSpacing: '0.04em', transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          {project.link.label}
        </a>
      )}
    </div>
  )
}

export default function Projects() {
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

  // Text sits on the left, object glides right
  const scrim = isMobile
    ? { position: 'absolute', inset: 0, background: 'rgba(8,11,17,0.5)', zIndex: 1, pointerEvents: 'none' }
    : { position: 'absolute', top: 0, left: 0, bottom: 0, width: '62%', zIndex: 1, pointerEvents: 'none',
        background: `linear-gradient(to right, ${C.bg} 55%, transparent 100%)` }

  return (
    <section id="projects" ref={sectionRef} style={{
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
          Projects
        </h2>
        <div style={{ maxWidth: isMobile ? '100%' : isNarrowVp ? '60%' : '660px' }}>
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.title} project={project} isLast={i === PROJECTS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
