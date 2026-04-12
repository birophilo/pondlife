<template>
  <nav v-if="authStore.isAuthenticated" class="top-nav-bar top-nav-bar--split">
    <span class="top-nav-links">
      <router-link to="/">Home</router-link>
      <router-link :to="{ name: 'sim' }">Simulation</router-link>
      <router-link :to="{ name: 'simulations' }">Simulations</router-link>
    </span>
    <span>
      {{ authStore.user }} - logged in
      <button type="button" @click="authStore.logout">log out</button>
    </span>
  </nav>
  <nav v-else-if="isLoggingIn" class="top-nav-bar top-nav-bar--split">
    <span class="top-nav-links">
      <router-link to="/">Home</router-link>
      <router-link :to="{ name: 'sim' }">Simulation</router-link>
      <router-link :to="{ name: 'simulations' }">Simulations</router-link>
    </span>
    <form @submit.prevent="handleLogin" class="login-form-inline">
      <span v-if="loginHint" class="nav-auth-hint">{{ loginHint }}</span>
      <span v-if="loginError" class="nav-auth-error">{{ loginError }}</span>
      <input v-model="username" type="text" placeholder="username" autocomplete="username" />
      <input v-model="password" type="password" placeholder="password" autocomplete="current-password" />
      <button type="submit">Log in</button>
      <button type="button" class="nav-auth-secondary" @click="switchToSignup">Create account</button>
    </form>
  </nav>
  <nav v-else-if="isSigningUp" class="top-nav-bar top-nav-bar--split">
    <span class="top-nav-links">
      <router-link to="/">Home</router-link>
      <router-link :to="{ name: 'sim' }">Simulation</router-link>
      <router-link :to="{ name: 'simulations' }">Simulations</router-link>
    </span>
    <form @submit.prevent="handleSignup" class="login-form-inline">
      <span v-if="signupError" class="nav-auth-error">{{ signupError }}</span>
      <input v-model="signupEmail" type="email" placeholder="email" autocomplete="email" />
      <input v-model="signupUsername" type="text" placeholder="username" autocomplete="username" />
      <input v-model="signupPassword" type="password" placeholder="password" autocomplete="new-password" />
      <button type="submit">Sign up</button>
      <button type="button" class="nav-auth-secondary" @click="switchToLogin">Back to log in</button>
    </form>
  </nav>
  <nav v-else class="top-nav-bar top-nav-bar--split">
    <span class="top-nav-links">
      <router-link to="/">Home</router-link>
      <router-link :to="{ name: 'sim' }">Simulation</router-link>
      <router-link :to="{ name: 'simulations' }">Simulations</router-link>
    </span>
    <span class="nav-auth-actions">
      <button type="button" @click="openLogin">log in</button>
      <button type="button" @click="openSignup">sign up</button>
    </span>
  </nav>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/store/authStore'

export default {
  name: 'NavTopLogin',
  setup () {

    const authStore = useAuthStore()

    const isLoggingIn = ref(false)
    const isSigningUp = ref(false)

    const username = ref('')
    const password = ref('')
    const loginError = ref('')
    const loginHint = ref('')

    const signupEmail = ref('')
    const signupUsername = ref('')
    const signupPassword = ref('')
    const signupError = ref('')

    const openLogin = () => {
      isSigningUp.value = false
      isLoggingIn.value = true
      loginError.value = ''
      signupError.value = ''
    }

    const openSignup = () => {
      isLoggingIn.value = false
      isSigningUp.value = true
      loginError.value = ''
      signupError.value = ''
    }

    const switchToSignup = () => {
      loginError.value = ''
      loginHint.value = ''
      isLoggingIn.value = false
      isSigningUp.value = true
    }

    const switchToLogin = () => {
      signupError.value = ''
      isSigningUp.value = false
      isLoggingIn.value = true
    }

    const handleLogin = async () => {
      loginError.value = ''
      loginHint.value = ''
      const formData = new FormData()
      formData.append('username', username.value)
      formData.append('password', password.value)
      try {
        await authStore.login(formData)
        username.value = ''
        password.value = ''
        isLoggingIn.value = false
      } catch (e) {
        loginError.value = e.message || 'Login failed'
      }
    }

    const handleSignup = async () => {
      signupError.value = ''
      try {
        await authStore.signup({
          email: signupEmail.value,
          username: signupUsername.value,
          password: signupPassword.value
        })
        signupEmail.value = ''
        signupUsername.value = ''
        signupPassword.value = ''
        isSigningUp.value = false
        isLoggingIn.value = true
        loginHint.value = 'Account created. Sign in below.'
      } catch (e) {
        signupError.value = e.message || 'Sign up failed'
      }
    }

    return {
      authStore,
      isLoggingIn,
      isSigningUp,
      username,
      password,
      loginError,
      loginHint,
      signupEmail,
      signupUsername,
      signupPassword,
      signupError,
      handleLogin,
      handleSignup,
      openLogin,
      openSignup,
      switchToLogin,
      switchToSignup
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

.nav-auth-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-auth-secondary {
  font-size: 0.9rem;
}

.nav-auth-error {
  color: #b00020;
  font-size: 0.85rem;
  width: 100%;
}

.nav-auth-hint {
  color: #2e6f40;
  font-size: 0.85rem;
  width: 100%;
}

</style>
