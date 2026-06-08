import CVUploader from '../components/CVUploader'
import CVViewer from '../components/CVViewer'
import CVEnhancer from '../components/CVEnhancer'
import { useCVStore } from '../../../store/cvStore'

export default function ProfilePage() {
  const { cvText, cvFileName } = useCVStore()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-h)' }}>My Profile</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>Upload your CV, view its contents, and get AI-powered enhancement tips</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: CV Upload + Viewer */}
        <div className="flex flex-col gap-6">
          <CVUploader />
          {cvText && cvFileName && <CVViewer />}
        </div>

        {/* Right: CV Enhancer */}
        <div>
          {cvText ? <CVEnhancer /> : (
            <div className="rounded-2xl border h-64 flex flex-col items-center justify-center gap-3" style={{ background: 'var(--bg2)', borderColor: 'var(--border)', borderStyle: 'dashed' }}>
              <span className="text-4xl">🤖</span>
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Upload a CV to enable AI enhancement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
