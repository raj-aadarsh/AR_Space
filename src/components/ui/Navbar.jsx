import { useEffect, useState } from 'react'

const mono = "'Space Mono', monospace"
const sans = "'Space Grotesk', sans-serif"

const links = [
  { label: 'Experience', id: 'experience' },
  { label: 'Projects',   id: 'projects' },
  { label: 'Skills',     id: 'skills' },
  { label: 'Education',  id: 'education' },
  { label: 'Hobbies',    id: 'hobbies' },
  { label: 'Connect',    id: 'connect' },
]

function NavLink({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none',
        fontFamily: mono, fontSize: '0.72rem',
        letterSpacing: '0.15em', textTransform: 'uppercase',
        color: active ? '#3B82F6' : '#7D8590',
        padding: '0.5rem 0.875rem',
        cursor: 'none',
        position: 'relative',
        transition: 'color 0.22s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#F0F6FC' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = active ? '#3B82F6' : '#7D8590' }}
    >
      {label}
      <span style={{
        position: 'absolute', bottom: '2px', left: '0.875rem', right: '0.875rem',
        height: '1px', background: '#3B82F6',
        transform: active ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left',
        transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
      }} />
    </button>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active,   setActive]   = useState('')
  const [open,     setOpen]      = useState(false)

  useEffect(() => {
    // Navbar blur + clear active when scrolled back to top
    const onScroll = () => {
      setScrolled(window.scrollY > 50)
      if (window.scrollY < 80) setActive('')
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Section highlighting — fires reliably regardless of scroll engine
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-20% 0px -40% 0px' }
    )
    links.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  const go = (id) => {
    const el = document.getElementById(id)
    if (el) {
      window.lenis ? window.lenis.scrollTo(el, { duration: 1.4 }) : el.scrollIntoView({ behavior: 'smooth' })
    }
    setOpen(false)
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'background 0.4s, border-color 0.4s',
      background: scrolled ? 'rgba(8,11,17,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(18px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
    }}>
      <div style={{
        maxWidth: '1140px', margin: '0 auto',
        padding: '0 6%', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <button
          className="logo-btn"
          onClick={() => window.lenis ? window.lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ background: 'none', border: 'none', cursor: 'none', padding: '2px 0' }}
        >
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
            <span style={{ color: '#3B82F6' }}>&lt;</span>
            <span style={{ color: '#F0F6FC' }}>AR_Space</span>
            <span style={{ color: '#3B82F6' }}>/&gt;</span>
          </span>
        </button>

        {/* Desktop links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden-mobile">
          {links.map(l => (
            <NavLink key={l.id} {...l} active={active === l.id} onClick={() => go(l.id)} />
          ))}
        </nav>

        {/* Mobile burger */}
        <button
          style={{ background: 'none', border: 'none', padding: '0.5rem', display: 'none', cursor: 'none' }}
          className="show-mobile"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#7D8590" strokeWidth="1.5">
            {open
              ? <><line x1="4" y1="4" x2="18" y2="18"/><line x1="18" y1="4" x2="4" y2="18"/></>
              : <><line x1="3" y1="7" x2="19" y2="7"/><line x1="3" y1="11" x2="19" y2="11"/><line x1="3" y1="15" x2="19" y2="15"/></>
            }
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      <div style={{
        maxHeight: open ? '400px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
        background: 'rgba(8,11,17,0.97)',
        borderBottom: open ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}>
        {links.map(l => (
          <button key={l.id} onClick={() => go(l.id)} style={{
            display: 'block', width: '100%', textAlign: 'left',
            padding: '1rem 6%', background: 'none', border: 'none',
            fontFamily: mono, fontSize: '0.75rem',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: active === l.id ? '#3B82F6' : '#7D8590',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            cursor: 'none',
          }}>
            {l.label}
          </button>
        ))}
      </div>

      <style>{`
        @media (max-width: 720px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: block !important; }
        }
      `}</style>
    </header>
  )
}
