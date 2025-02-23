import { create } from 'zustand'

interface CreditStore {
  credits: number
  setCredits: (credits: number) => void
}

export const useCreditStore = create<CreditStore>((set) => ({
  credits: 0,
  setCredits: (credits) => set({ credits })
}))