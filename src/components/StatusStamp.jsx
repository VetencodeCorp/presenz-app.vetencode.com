export default function StatusStamp({ label, color, bg }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: "'Caveat', cursive", fontSize: 22, fontWeight: 700, color, background: bg, border: `1.5px solid ${color}`, borderRadius: 4, padding: '2px 12px', transform: 'rotate(-2deg)', letterSpacing: 0.3 }}>
      {label} ✓
    </span>
  )
}
