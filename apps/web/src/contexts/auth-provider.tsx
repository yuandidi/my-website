'use client'

import {
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext, type AuthContextValue } from '@/contexts/auth-context'
import { useSiteMeta } from '@/hooks/useSiteMeta'
import { api, getGithubLoginUrl } from '@/lib/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useSiteMeta()

  const logoutMutation = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['site-meta'] })
    },
  })

  const login = useCallback(() => {
    window.location.href = getGithubLoginUrl()
  }, [])

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync()
  }, [logoutMutation])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data?.user ?? null,
      isLoading,
      isLoggedIn: Boolean(data?.user),
      isDeveloper:
        data?.user?.role === 'DEVELOPER' || data?.user?.role === 'ADMIN',
      login,
      logout,
    }),
    [data?.user, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
