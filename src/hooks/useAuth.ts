import { useAuthStore } from '@/stores/authStore'
import type { BaseUser } from '@shared/types'

export interface UseAuthReturn {
  user: BaseUser | null
  userId: string | undefined
  isAuthenticated: boolean
  token: string | null
  login: (email: string, password: string, role: BaseUser['role']) => Promise<void>
  logout: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const user = useAuthStore(state => state.user)
  const token = useAuthStore(state => state.token)
  const login = useAuthStore(state => state.login)
  const logout = useAuthStore(state => state.logout)

  return {
    user,
    userId: user?.id,
    isAuthenticated: token !== null,
    token,
    login,
    logout,
  }
}
