
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export const useLogout = () => {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const logout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return logout
}
