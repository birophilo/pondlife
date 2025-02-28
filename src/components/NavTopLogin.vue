<template>
  <nav v-if="authStore.isAuthenticated">
    {{ authStore.user }} - logged in
    <button @click="authStore.logout">log out</button>
  </nav>
  <nav v-else-if="isLoggingIn">
    <form @submit.prevent="handleLogin" class="top-nav-bar">
      <input v-model="username" type="text" placeholder="username" />
      <input v-model="password" type="password" placeholder="password" />
      <button type="submit">Log in</button>
      <div>reset password</div>
    </form>
  </nav>
  <nav v-else>
    <div class="top-nav-bar">
      <button @click="isLoggingIn = true">log in</button>
    </div>
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

</style>