import { useCVStore } from '../../../store/cvStore'

export default function CVViewer() {
  const { cvText, cvFileName } = useCVStore()
  if (!cvText) return null

  // Parse CV sections heuristically
  const lines = cvText.split('\n').filter(l => l.trim())

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-h)' }}>
          📄 {cvFileName}
        </h3>
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{lines.length} lines</span>
      </div>
      <div className="p-5 max-h-96 overflow-y-auto">
        <div className="font-mono text-xs leading-relaxed space-y-1">
          {lines.map((line, i) => {
            const isHeader = line.length < 40 && line === line.toUpperCase() && line.length > 3
            const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*')
            return (
              <p key={i}
                className={isHeader ? 'font-bold mt-3 pb-1 border-b' : isBullet ? 'pl-3' : ''}
                style={{
                  color: isHeader ? 'var(--accent2)' : isBullet ? 'var(--text)' : 'var(--text-dim)',
                  borderColor: 'var(--border)',
                }}>
                {line}
              </p>
            )
          })}
        </div>
      </div>
    </div>
  )
}
