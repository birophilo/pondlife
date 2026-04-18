import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import authService, { getUsernameFromAccessToken } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {

  const token = ref(authService.getToken())
  const user = ref(getUsernameFromAccessToken(token.value))

  const login = async (credentialsFormData) => {
    const response = await authService.login(credentialsFormData)
    if (response.error) {
      throw new Error(response.message || 'Login failed')
    }
    user.value = response.user
    token.value = response.accessToken
  }

  const signup = async ({ username, email, password }) => {
    const response = await authService.signup({ username, email, password })
    if (response.error) {
      throw new Error(response.message || 'Sign up failed')
    }
  }

  const logout = async () => {
    await authService.logout()
    user.value = null
    token.value = null
  }

  /** Keep in sync with localStorage when tokens refresh in the background (axios interceptor). */
  function syncTokenFromStorage () {
    token.value = authService.getToken()
    user.value = getUsernameFromAccessToken(token.value)
  }

  /** Must depend on `token` so the UI updates after login/logout (localStorage alone is not reactive). */
  const isAuthenticated = computed(() => !!token.value)

  return { login, signup, logout, user, token, isAuthenticated, syncTokenFromStorage }

})
