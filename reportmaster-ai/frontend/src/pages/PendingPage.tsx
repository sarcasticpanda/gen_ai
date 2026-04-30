import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import useStore from '../store/useStore'
import api from '../lib/api'
import { AuthUI } from '../components/ui/auth-fuse'
import { toast } from 'react-hot-toast'

export default function PendingPage() {
  const { profile, setProfile } = useStore()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(false)
  const [isApprovedLocal, setIsApprovedLocal] = useState(false)

  const checkStatus = useCallback(async (manual = false) => {
    if (checking || isApprovedLocal) return;
    
    try {
      if (manual) setChecking(true)
      
      const { data } = await api.get('/users/me')
      console.log('Status check result:', data.user)
      
      if (data.user) {
        setProfile(data.user)
        
        if (data.user.is_approved) {
          setIsApprovedLocal(true)
          toast.success('Account approved! Redirecting to dashboard...')
          
          // Small delay for the user to see the success state
          setTimeout(() => {
            if (data.user.role === 'admin') {
              navigate('/admin/dashboard')
            } else {
              navigate('/dashboard')
            }
          }, 1500)
        } else if (manual) {
          toast.loading('Still pending approval...', { duration: 2000 })
        }
      }
    } catch (e: any) {
      console.error('Status check error:', e)
      if (manual) {
        toast.error('Failed to check status. Please try again.')
      }
    } finally {
      if (manual) setChecking(false)
    }
  }, [checking, isApprovedLocal, navigate, setProfile])

  useEffect(() => {
    // Initial check on mount
    if (profile?.is_approved) {
      navigate(profile.role === 'admin' ? '/admin/dashboard' : '/dashboard')
      return
    }
    
    checkStatus(false)

    // Auto-poll every 10 seconds
    const interval = setInterval(() => checkStatus(false), 10000)
    return () => clearInterval(interval)
  }, [navigate, checkStatus]) // Removed profile?.is_approved to let checkStatus handle the redirect

  return (
    <AuthUI 
      initialMode="pending"
      email={profile?.email}
      onCheckStatus={() => checkStatus(true)}
      onSignOut={async () => { await logout(); navigate('/login') }}
      checking={checking}
      approved={isApprovedLocal}
      pendingContent={{
        quote: {
          text: isApprovedLocal 
            ? "Verification complete. Welcome to ReportMaster AI." 
            : "Verification in progress. We're ensuring the highest security standards for our network.",
          author: "RM Security"
        }
      }}
    />
  )
}
