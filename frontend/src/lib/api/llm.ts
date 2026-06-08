const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function callLLM(prompt: string, systemPrompt?: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/llm/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemPrompt }),
  })
  if (!res.ok) throw new Error('LLM request failed')
  const data = await res.json()
  return data.payload?.content || data.content || ''
}

export async function callLLMStream(
  prompt: string,
  onChunk: (chunk: string) => void,
  systemPrompt?: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/llm/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemPrompt }),
  })
  if (!res.ok || !res.body) {
    // fallback to non-stream
    const text = await callLLM(prompt, systemPrompt)
    onChunk(text)
    return
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
    for (const line of lines) {
      const data = line.slice(6)
      if (data === '[DONE]') return
      try {
        const json = JSON.parse(data)
        const text = json.choices?.[0]?.delta?.content || json.content || ''
        if (text) onChunk(text)
      } catch { /* ignore */ }
    }
  }
}
