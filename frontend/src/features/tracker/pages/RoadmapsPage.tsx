import { Trash2 } from 'lucide-react'
import { useRoadmapStore } from '../../../store/roadmapStore'
import LLMResultModal from '../../jobs/components/LLMResultModal'
import { useState } from 'react'

export default function RoadmapsPage() {
  const { roadmaps, remove } = useRoadmapStore()
  const [selected, setSelected] = useState<typeof roadmaps[0] | null>(null)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-h)' }}>Roadmaps</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>AI-generated career roadmaps saved from Job Search</p>
      </div>

      {roadmaps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3" style={{ color: 'var(--text-dim)' }}>
          <span className="text-5xl">🗺️</span>
          <p className="text-sm">No roadmaps yet. Click "Roadmap" on any job card to generate one.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {roadmaps.map((r, i) => (
            <div key={r.id} className="rounded-2xl border p-5 fade-in" style={{ background: 'var(--bg2)', borderColor: 'var(--border)', animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base" style={{ color: 'var(--text-h)', fontFamily: 'var(--font-display)' }}>{r.jobTitle}</h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-dim)' }}>{r.company}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(r)} className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ background: 'var(--accent)' }}>
                    View
                  </button>
                  <button onClick={() => remove(r.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: 'var(--text-dim)' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs line-clamp-3 leading-relaxed" style={{ color: 'var(--text)' }}>{r.content.slice(0, 300)}...</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <LLMResultModal title={`🗺️ Roadmap — ${selected.jobTitle} at ${selected.company}`} content={selected.content} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
