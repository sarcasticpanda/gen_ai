import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import api from '../lib/api'
import useStore from '../store/useStore'
import toast from 'react-hot-toast'

export function useAuth() {
  const { setUser, setProfile, logout: storeLogout } = useStore()
  const [loading, setLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setProfile(data.user)
      return data
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Login failed'
      toast.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email: string, password: string, full_name: string) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup', { email, password, full_name })
      toast.success('Account created! Pending admin approval.')
      return data
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Signup failed'
      toast.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    storeLogout()
    toast.success('Logged out')
  }

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/me')
      setProfile(data.user)
      return data.user
    } catch {
      return null
    }
  }

  const loginWithSupabase = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setUser(authData.user)
      const profile = await fetchProfile()
      return { user: authData.user, profile, session: authData.session }
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { login, loginWithSupabase, signup, logout, fetchProfile, loading }
}
