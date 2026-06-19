import { createContext } from 'react'
import type { AuthUser } from '@my-blog/shared'

export interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isLoggedIn: boolean
  isDeveloper: boolean
  login: () => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
