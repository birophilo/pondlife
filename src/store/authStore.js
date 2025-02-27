import { defineStore } from 'pinia'
import { ref } from 'vue'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {

  const user = ref(null)
  const token = ref(authService.getToken())

  const login = async () => {
    const response = await authService.login()
    user.value = response.user
    token.value = response.accessToken
  }

  const logout = () => {
    authService.logout()
    user.value = null
    token.value = null
  }

  const isAuthenticated = ()  => {
    return authService.isAuthenticated()
  }

  return { login, logout, isAuthenticated }

}) 
