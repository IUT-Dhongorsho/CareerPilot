import { create } from 'zustand'
import type { Job } from '../../../types/global'

interface JobsStore {
  jobs: Job[]
  loading: boolean
  query: string
  setJobs: (jobs: Job[]) => void
  setLoading: (v: boolean) => void
  setQuery: (q: string) => void
}

export const useJobsStore = create<JobsStore>((set) => ({
  jobs: [],
  loading: false,
  query: '',
  setJobs: (jobs) => set({ jobs }),
  setLoading: (loading) => set({ loading }),
  setQuery: (query) => set({ query }),
}))
