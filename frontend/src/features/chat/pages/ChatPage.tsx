import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, MessageSquare } from 'lucide-react'
import { callLLM } from '../../../lib/api/llm'
import toast from 'react-hot-toast'

interface Message { role: 'user' | 'assistant'; content: string }

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
}

const suggestions = [
  'How do I prepare for a software engineering interview?',
  'Write me a cover letter for a Data Analyst role',
  'What skills should I learn for web development in 2025?',
  'How do I negotiate a higher salary?',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(text?: string) {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const history = messages.slice(-10).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
      const prompt = history ? `${history}\nUser: ${msg}` : msg
      const response = await callLLM(prompt, 'You are CareerPilot AI, a helpful career coach. Give specific, actionable advice. Format responses beautifully with markdown.')
      setMessages(m => [...m, { role: 'assistant', content: response }])
    } catch {
      toast.error('AI unavailable. Check backend.')
      setMessages(m => [...m, { role: 'assistant', content: "I'm having trouble connecting right now. Please check that the backend server is running." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 py-12">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <MessageSquare size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-h)' }}>Career AI Assistant</h3>
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Ask me anything about your career, job search, or skill development</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
              {suggestions.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-left px-4 py-3 rounded-xl border text-sm hover:border-[var(--accent)] transition-colors"
                  style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
            <div className={`max-w-2xl rounded-2xl px-5 py-3.5 text-sm ${m.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
              style={m.role === 'user'
                ? { background: 'var(--accent)', color: '#fff' }
                : { background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' }
              }>
              {m.role === 'assistant'
                ? <div className="llm-prose" dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(m.content)}</p>` }} />
                : <p>{m.content}</p>
              }
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-5 py-4 rounded-2xl rounded-bl-sm border" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)', animation: `pulseDot 1.2s ease ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}>
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about your career, skills, interviews..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-h)' }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            className="px-4 py-3 rounded-xl text-white flex items-center justify-center disabled:opacity-50 transition-all hover:opacity-90"
            style={{ background: 'var(--accent)' }}>
            {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
