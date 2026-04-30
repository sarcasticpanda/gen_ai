import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AuthUI } from '../components/ui/auth-fuse'
import { toast } from 'react-hot-toast'

export default function SignupPage() {
  const { signup, loginWithSupabase, loading } = useAuth()
  const navigate = useNavigate()

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await signup(email, password, fullName)
      // Automatically login to get session for status checking
      await loginWithSupabase(email, password)
      toast.success('Account request submitted! Please wait for admin approval.')
      navigate('/pending')
    } catch (error: any) {
      console.error('Signup/Login error:', error)
      toast.error(error.message || 'Failed to create account')
    }
  }

  return (
    <AuthUI 
      initialMode="signup"
      onSignUpSubmit={handleSignUp}
      onToggle={(mode) => {
        if (mode === 'signin') navigate('/login')
      }}
      loading={loading}
      signUpContent={{
        quote: {
          text: "Join the elite network of financial analysts powered by AI.",
          author: "RM Onboarding"
        }
      }}
    />
  )
}

