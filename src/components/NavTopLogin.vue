<template>
  <nav v-if="authStore.isAuthenticated" class="top-nav-bar top-nav-bar--split">
    <span class="top-nav-links">
      <router-link to="/">Home</router-link>
      <router-link :to="{ name: 'sim' }">Simulation</router-link>
      <router-link :to="{ name: 'simulations' }">Simulations</router-link>
    </span>
    <span>
      {{ authStore.user }} - logged in
      <button @click="authStore.logout">log out</button>
    </span>
  </nav>
  <nav v-else-if="isLoggingIn" class="top-nav-bar top-nav-bar--split">
    <span class="top-nav-links">
      <router-link to="/">Home</router-link>
      <router-link :to="{ name: 'sim' }">Simulation</router-link>
      <router-link :to="{ name: 'simulations' }">Simulations</router-link>
    </span>
    <form @submit.prevent="handleLogin" class="login-form-inline">
      <input v-model="username" type="text" placeholder="username" />
      <input v-model="password" type="password" placeholder="password" />
      <button type="submit">Log in</button>
      <span class="login-form-meta">reset password</span>
    </form>
  </nav>
  <nav v-else class="top-nav-bar top-nav-bar--split">
    <span class="top-nav-links">
      <router-link to="/">Home</router-link>
      <router-link :to="{ name: 'sim' }">Simulation</router-link>
      <router-link :to="{ name: 'simulations' }">Simulations</router-link>
    </span>
    <button @click="isLoggingIn = true">log in</button>
  </nav>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/store/authStore'

export default {
  name: 'NavTopLogin',
  setup() {

    const authStore = useAuthStore()

    const isLoggingIn = ref(false)

    const username = ref('')
    const password = ref('')

    const handleLogin = async () => {
      console.log('Logging in')
      const formData = new FormData()
      formData.append("username", username.value)
      formData.append("password", password.value)
      await authStore.login(formData)
      username.value = ''
      password.value = ''
    }

    return {
      authStore,
      isLoggingIn,
      username,
      password,
      handleLogin
    }
  }
}

</script>

<style>

nav {
  height: 30px;
  border-bottom: 1px solid #e8b9ad;
  padding: 3px 20px 10px 20px;
}

.top-nav-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: right;
}

.top-nav-bar--split {
  justify-content: space-between;
}

.top-nav-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.top-nav-links a {
  color: inherit;
  text-decoration: none;
  font-weight: 500;
}

.top-nav-links a.router-link-active {
  text-decoration: underline;
}

.login-form-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.login-form-meta {
  font-size: 0.85rem;
}

</style>