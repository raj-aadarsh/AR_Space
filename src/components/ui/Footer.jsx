import { sans, mono, C } from '../../utils/theme.jsx'

export default function Footer() {
  return (
    <footer style={{
      padding: '2.5rem 0',
      background: C.bg,
      borderTop: `1px solid ${C.border}`,
      textAlign: 'center',
    }}>
      <span style={{
        fontFamily: mono,
        fontSize: '0.68rem',
        letterSpacing: '0.10em',
        color: C.muted,
      }}>
        Designed &amp; developed by{' '}
        <span style={{ color: C.blue }}>Aadarsh Raj</span>
      </span>
    </footer>
  )
}
