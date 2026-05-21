import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { C, sans, mono, Section, SectionLabel, SectionHeading } from '../../utils/theme.jsx'

gsap.registerPlugin(ScrollTrigger)

const PROFILE = 'https://github.com/raj-aadarsh'

// Add your repos here — name, one-liner description, primary language, link
const repos = [
  { name: 'AgriTrace',          desc: 'Blockchain agricultural supply chain with ML price prediction.', lang: 'Solidity',   langColor: '#AA6746', link: PROFILE },
  { name: 'Jenkins-Dashboard',  desc: 'Real-time CI/CD monitoring and pipeline control.',               lang: 'Python',     langColor: '#3572A5', link: PROFILE },
  { name: 'AR_Space',           desc: 'This portfolio — React, Three.js, GSAP, Lenis.',                lang: 'JavaScript', langColor: '#F1E05A', link: `${PROFILE}/AR_Space` },
]

function RepoCard({ repo, i }) {
  const ref = useRef(null)
  useEffect(() => {
    gsap.set(ref.current, { autoAlpha: 0, y: 25 })
    gsap.to(ref.current, { autoAlpha: 1, y: 0, duration: 0.65, delay: i * 0.08, ease: 'power3.out', scrollTrigger: { trigger: ref.current, start: 'top 85%' } })
  }, [i])

  return (
    <a
      ref={ref}
      href={repo.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', flexDirection: 'column', gap: '0.875rem',
        padding: '1.5rem',
        border: `1px solid ${C.border}`,
        background: C.bg,
        textDecoration: 'none',
        transition: 'border-color 0.2s, background 0.2s',
        visibility: 'hidden',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.blue}35`; e.currentTarget.style.background = '#0D1117' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill={C.muted}>
          <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z" />
        </svg>
        <span style={{ fontFamily: mono, fontSize: '0.85rem', color: C.blue }}>{repo.name}</span>
      </div>
      <p style={{ fontFamily: sans, fontSize: '0.875rem', color: C.muted, lineHeight: 1.6 }}>{repo.desc}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: repo.langColor, flexShrink: 0 }} />
        <span style={{ fontFamily: mono, fontSize: '0.7rem', color: C.muted }}>{repo.lang}</span>
      </div>
    </a>
  )
}

export default function GitHubSection() {
  const headRef = useRef(null)
  useEffect(() => {
    gsap.set(headRef.current, { autoAlpha: 0, y: 30 })
    gsap.to(headRef.current, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: headRef.current, start: 'top 80%' } })
  }, [])

  return (
    <Section id="github" style={{ borderTop: `1px solid ${C.border}` }}>
      <div ref={headRef} style={{ visibility: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem' }}>
        <div>
          <SectionLabel number="05" label="GitHub" />
          <SectionHeading style={{ marginBottom: 0 }}>On GitHub</SectionHeading>
        </div>
        <a
          href={PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: mono, fontSize: '0.75rem', letterSpacing: '0.1em',
            padding: '0.625rem 1.25rem',
            color: C.muted, border: `1px solid ${C.border}`,
            textDecoration: 'none', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.blue}50`; e.currentTarget.style.color = C.blue }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}
        >
          View all repositories ↗
        </a>
      </div>

      <div className="github-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {repos.map((r, i) => <RepoCard key={r.name} repo={r} i={i} />)}
      </div>
    </Section>
  )
}
