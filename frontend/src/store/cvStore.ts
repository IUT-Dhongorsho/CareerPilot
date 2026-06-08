import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CVStore {
  cvText: string | null
  cvFileName: string | null
  cvDataUrl: string | null
  setCv: (text: string, fileName: string, dataUrl: string) => void
  clearCv: () => void
}

export const useCVStore = create<CVStore>()(
  persist(
    (set) => ({
      cvText: null,
      cvFileName: null,
      cvDataUrl: null,
      setCv: (cvText, cvFileName, cvDataUrl) => set({ cvText, cvFileName, cvDataUrl }),
      clearCv: () => set({ cvText: null, cvFileName: null, cvDataUrl: null }),
    }),
    { name: 'cp-cv', partialize: (s) => ({ cvText: s.cvText, cvFileName: s.cvFileName }) }
  )
)
