import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AuthUI } from '../components/ui/auth-fuse'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
  const { loginWithSupabase, loading } = useAuth()
  const navigate = useNavigate()

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await loginWithSupabase(email, password)
      if (result?.profile) {
        if (!result.profile.is_approved) {
          navigate('/pending')
        } else if (result.profile.role === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/dashboard')
        }
      } else {
        // This happens if Supabase login works but Backend profile fetch fails
        toast.error('Login successful, but failed to connect to backend server. Is it running?')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    }
  }

  return (
    <AuthUI 
      initialMode="signin"
      onSignInSubmit={handleSignIn}
      onToggle={(mode) => {
        if (mode === 'signup') navigate('/signup')
      }}
      loading={loading}
      signInContent={{
        quote: {
          text: "ReportMaster AI: Institutional-grade intelligence for financial teams.",
          author: "RM Intelligence"
        }
      }}
    />
  )
}

