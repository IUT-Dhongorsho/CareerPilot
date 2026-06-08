import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'
import { useCVStore } from '../../../store/cvStore'
import { callLLM } from '../../../lib/api/llm'
import toast from 'react-hot-toast'

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/__(.+?)__/g, '<u>$1</u>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr />')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
}

export default function CVEnhancer() {
  const { cvText } = useCVStore()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function enhance() {
    if (!cvText) return
    setLoading(true)
    try {
      const prompt = `You are a senior career coach and ATS expert. Perform a comprehensive CV/Resume audit on the following CV. 

Structure your response as:

## 🔍 Overall Score
Give a score out of 100 with breakdown.

## 💪 Strengths
What's working well.

## ⚠️ Critical Issues
Major problems that will hurt job applications.

## 🎯 Quick Wins
Top 5 changes that will have immediate impact.

## 📝 Section-by-Section Feedback
Detailed feedback on each section.

## 🚀 Skills to Add
Based on current market demand, what skills should they develop?

## 💡 Pro Tips
Expert advice on standing out.

Be specific, honest, and actionable. Use **bold**, *italic*, and bullet lists for clarity.

CV Content:
${cvText.slice(0, 3000)}`

      const response = await callLLM(prompt)
      setResult(response)
      toast.success('CV analysis complete! 🎉')
    } catch {
      toast.error('AI enhancement failed. Check backend connection.')
      // Demo fallback
      setResult(`## 🔍 Overall Score\n\n**Score: 72/100** — Good foundation, but needs optimization.\n\n## ⚠️ Critical Issues\n\n- **Missing quantifiable achievements** — Add numbers (e.g., "Increased sales by 40%")\n- **No action verbs** — Start bullet points with strong verbs like *Engineered, Led, Delivered*\n- **ATS keywords missing** — Add industry-specific keywords from job descriptions\n\n## 🎯 Quick Wins\n\n- Add a **Professional Summary** at the top (3-4 lines)\n- **Quantify every achievement** with metrics\n- Include **LinkedIn URL** and **GitHub** if applicable\n- Tailor the CV for each job application\n- Keep it to **1-2 pages maximum**\n\n## 🚀 Skills to Add\n\nBased on market demand:\n- *Cloud platforms* (AWS, Azure, GCP)\n- *CI/CD pipelines*\n- *Agile/Scrum methodologies*`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-h)' }}>
            ✨ CV Enhancer
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>AI-powered CV audit & improvement tips</p>
        </div>
        <button
          onClick={enhance}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--pink))' }}
        >
          {loading ? <Loader2 size={14} className="spin" /> : result ? <RefreshCw size={14} /> : <Sparkles size={14} />}
          {loading ? 'Analyzing...' : result ? 'Re-analyze' : 'Analyze CV'}
        </button>
      </div>

      {!result && !loading && (
        <div className="flex flex-col items-center gap-3 py-16 px-6">
          <span className="text-4xl">🤖</span>
          <p className="text-sm text-center" style={{ color: 'var(--text-dim)' }}>
            Click "Analyze CV" to get detailed feedback on your CV, ATS score, missing keywords, and personalized improvement suggestions.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent spin" style={{ borderColor: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Analyzing your CV with AI...</p>
        </div>
      )}

      {result && !loading && (
        <div className="p-5 max-h-[600px] overflow-y-auto">
          <div
            className="llm-prose text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(result)}</p>` }}
          />
        </div>
      )}
    </div>
  )
}
