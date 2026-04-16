import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {

  const user = ref(null)
  const token = ref(authService.getToken())

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

  /** Token may be renewed via refresh interceptor without touching this ref. */
  const isAuthenticated = computed(() => !!authService.getToken())

  return { login, signup, logout, user, isAuthenticated }

})
