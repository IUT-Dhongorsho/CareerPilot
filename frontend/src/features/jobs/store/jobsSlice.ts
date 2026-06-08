import { create } from 'zustand';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  deadline: string;
  fitScore: number;
  description: string;
  matchingSkills?: string[];
  missingSkills?: string[];
}

interface JobsState {
  results: Job[];
  isLoading: boolean;
  setResults: (jobs: Job[]) => void;
  searchJobs: (query: string, location?: string) => Promise<void>;
}

export const useJobsStore = create<JobsState>((set) => ({
  results: [],
  isLoading: false,
  setResults: (jobs) => set({ results: jobs }),
  searchJobs: async (query, location = 'Dhaka') => {
    set({ isLoading: true });
    // Mock implementation – replace with real API later
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockJobs: Job[] = [
      { id: '1', title: 'ML Intern', company: 'Google', location, salary: '$50k', deadline: '2026-06-30', fitScore: 85, description: 'Work on LLMs' },
      { id: '2', title: 'AI Engineer', company: 'Microsoft', location, salary: '$60k', deadline: '2026-07-15', fitScore: 72, description: 'Build AI solutions' },
      { id: '3', title: 'Data Scientist', company: 'Local Startup', location, salary: '$40k', deadline: '2026-06-20', fitScore: 45, description: 'Analyze data' },
    ];
    set({ results: mockJobs, isLoading: false });
  },
}));
