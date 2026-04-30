import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  is_approved: boolean
  created_at: string | null
}

interface AppState {
  user: any | null
  profile: UserProfile | null
  isLoading: boolean
  sidebarOpen: boolean

  setUser: (user: any) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  toggleSidebar: () => void
  logout: () => void
}

const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      sidebarOpen: true,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      logout: () => set({ user: null, profile: null }),
    }),
    {
      name: 'reportmaster-store',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
)

export default useStore
