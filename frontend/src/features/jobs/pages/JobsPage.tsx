import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useJobsStore } from '../store/jobsStore'
import JobList from '../components/JobList'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function JobsPage() {
  const [input, setInput] = useState('')
  const { jobs, loading, setJobs, setLoading, setQuery } = useJobsStore()

  async function search() {
    if (!input.trim()) return
    setLoading(true)
    setQuery(input)
    try {
      const res = await fetch(`${API_BASE}/api/jobs/search?q=${encodeURIComponent(input)}`)
      const data = await res.json()
      setJobs(data.payload || data.jobs || [])
    } catch {
      toast.error('Job search failed. Check backend connection.')
      // Mock data for demo
      setJobs(getMockJobs(input))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-h)' }}>
          Find Your Next Role
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Powered by AI — search, analyze, and track jobs in one place</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search jobs, skills, companies..."
            className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none border focus:border-[var(--accent)] transition-colors"
            style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text-h)' }}
          />
        </div>
        <button
          onClick={search}
          disabled={loading}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {loading ? <Loader2 size={16} className="spin" /> : null}
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <JobList jobs={jobs} loading={loading} />
    </div>
  )
}

function getMockJobs(q: string): import('../../../types/global').Job[] {
  return [
    {
      id: '1', title: `${q} Engineer`, company: 'TechCorp BD', location: 'Dhaka, Bangladesh',
      type: 'Full-time', salary: '৳80,000 - ৳120,000/mo', fitScore: 87,
      description: 'We are looking for a talented engineer to join our fast-growing team. You will work on cutting-edge products.',
      requirements: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      postedAt: '2 days ago',
    },
    {
      id: '2', title: `Senior ${q} Developer`, company: 'StartupXYZ', location: 'Remote',
      type: 'Remote', salary: '$3,000 - $5,000/mo', fitScore: 72,
      description: 'Join our remote-first startup building the next generation of developer tools.',
      requirements: ['Python', 'Docker', 'AWS', 'GraphQL'],
      postedAt: '5 days ago',
    },
    {
      id: '3', title: `Junior ${q} Analyst`, company: 'DataVault Inc', location: 'Dhaka, Bangladesh',
      type: 'Full-time', salary: '৳40,000 - ৳60,000/mo', fitScore: 91,
      description: 'Entry-level position for a motivated analyst to grow in our data team.',
      requirements: ['SQL', 'Excel', 'Power BI', 'Python basics'],
      postedAt: '1 week ago',
    },
  ]
}
