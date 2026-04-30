import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import useStore from '../store/useStore'
import api from '../lib/api'

interface Props {
  children: React.ReactNode
  requireAdmin?: boolean
  requireApproved?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false, requireApproved = true }: Props) {
  const { profile, setProfile, setUser } = useStore()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const location = useLocation()

  useEffect(() => {
    checkAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setAuthenticated(false); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }
      setUser(session.user)
      setAuthenticated(true)
      if (!profile) {
        const { data } = await api.get('/users/me')
        setProfile(data.user)
      }
    } catch {
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold animate-pulse">RM</div>
          <span className="text-on-surface-variant text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  if (!authenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (requireApproved && profile && !profile.is_approved) return <Navigate to="/pending" replace />
  if (requireAdmin && profile && profile.role !== 'admin') return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
