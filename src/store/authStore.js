import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {

  const user = ref(null)
  const token = ref(authService.getToken())

  const login = async (credentialsFormData) => {
    const response = await authService.login(credentialsFormData)
    user.value = response.user
    token.value = response.accessToken
  }

  const logout = () => {
    authService.logout()
    user.value = null
    token.value = null
  }

  const isAuthenticated = computed(()  => !!token.value)

  return { login, logout, user, isAuthenticated }

}) 
