export const C = {
  bg:      '#080B11',
  surface: '#0D1117',
  border:  'rgba(255,255,255,0.06)',
  blue:    '#3B82F6',
  blueGlow:'rgba(59,130,246,0.1)',
  text:    '#F0F6FC',
  muted:   '#7D8590',
  faint:   '#1F2937',
}

export const sans = "'Space Grotesk', sans-serif"
export const mono = "'Space Mono', monospace"

export const Section = ({ id, children, style = {} }) => (
  <section
    id={id}
    style={{
      position: 'relative',
      zIndex: 1,
      background: C.bg,
      padding: '9rem 0',
      ...style,
    }}
  >
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 6%' }}>
      {children}
    </div>
  </section>
)

export const SectionLabel = ({ number, label }) => (
  <p
    style={{
      fontFamily: mono,
      fontSize: '0.7rem',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: C.muted,
      marginBottom: '1.25rem',
    }}
  >
    {number} — {label}
  </p>
)

export const SectionHeading = ({ children, style = {} }) => (
  <h2
    style={{
      fontFamily: sans,
      fontWeight: 700,
      fontSize: 'clamp(2.25rem, 5vw, 4rem)',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      color: C.text,
      marginBottom: '4rem',
      ...style,
    }}
  >
    {children}
  </h2>
)
