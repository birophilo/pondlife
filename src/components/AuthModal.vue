<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="auth-modal-backdrop"
      @click.self="emitClose"
    >
      <div
        class="auth-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @keydown.esc="emitClose"
      >
        <button
          type="button"
          class="auth-modal__close"
          aria-label="Close"
          @click="emitClose"
        >
          ×
        </button>

        <h2 :id="titleId" class="auth-modal__title">
          {{ heading }}
        </h2>

        <nav
          v-if="view !== 'forgot'"
          class="auth-modal__segmented"
          aria-label="Account"
        >
          <button
            type="button"
            :class="{ 'is-active': view === 'login' }"
            @click="switchView('login')"
          >
            Sign in
          </button>
          <button
            type="button"
            :class="{ 'is-active': view === 'signup' }"
            @click="switchView('signup')"
          >
            Create account
          </button>
        </nav>

        <p v-if="banner" class="auth-modal__banner auth-modal__banner--success">
          {{ banner }}
        </p>
        <p v-if="errorMessage" class="auth-modal__banner auth-modal__banner--error" role="alert">
          {{ errorMessage }}
        </p>

        <!-- Login -->
        <form
          v-show="view === 'login'"
          class="auth-modal__form"
          @submit.prevent="handleLogin"
        >
          <fieldset class="auth-modal__fieldset">
            <legend class="auth-modal__legend">
              Sign in with
            </legend>
            <div class="auth-modal__radios">
              <label class="auth-modal__radio">
                <input
                  v-model="loginIdentifierMode"
                  type="radio"
                  value="username"
                />
                Username
              </label>
              <label class="auth-modal__radio">
                <input
                  v-model="loginIdentifierMode"
                  type="radio"
                  value="email"
                />
                Email
              </label>
            </div>
          </fieldset>
          <label
            v-if="loginIdentifierMode === 'username'"
            class="auth-modal__field"
          >
            <span>Username</span>
            <input
              v-model="loginUsername"
              type="text"
              autocomplete="username"
              required
            />
          </label>
          <label
            v-else
            class="auth-modal__field"
          >
            <span>Email</span>
            <input
              v-model="loginEmail"
              type="email"
              autocomplete="email"
              required
            />
          </label>
          <label class="auth-modal__field">
            <span>Password</span>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
            />
          </label>
          <button type="submit" class="auth-modal__submit">
            Sign in
          </button>
          <p class="auth-modal__footer-links">
            <button type="button" class="auth-modal__link" @click="switchView('forgot')">
              Forgot password?
            </button>
          </p>
        </form>

        <!-- Sign up -->
        <form
          v-show="view === 'signup'"
          class="auth-modal__form"
          @submit.prevent="handleSignup"
        >
          <label class="auth-modal__field">
            <span>Email</span>
            <input
              v-model="signupEmail"
              type="email"
              autocomplete="email"
              required
            />
          </label>
          <label class="auth-modal__field">
            <span>Username</span>
            <input
              v-model="signupUsername"
              type="text"
              autocomplete="username"
              required
            />
          </label>
          <label class="auth-modal__field">
            <span>Password</span>
            <input
              v-model="signupPassword"
              type="password"
              autocomplete="new-password"
              required
            />
          </label>
          <button type="submit" class="auth-modal__submit">
            Create account
          </button>
        </form>

        <!-- Forgot password -->
        <form
          v-show="view === 'forgot'"
          class="auth-modal__form"
          @submit.prevent="handleForgot"
        >
          <p class="auth-modal__hint">
            Enter your account email and a new password. You must have access to that email
            (this flow does not send email yet — server updates the password when the user exists).
          </p>
          <label class="auth-modal__field">
            <span>Email</span>
            <input
              v-model="forgotEmail"
              type="email"
              autocomplete="email"
              required
            />
          </label>
          <label class="auth-modal__field">
            <span>New password</span>
            <input
              v-model="forgotPassword"
              type="password"
              autocomplete="new-password"
              required
            />
          </label>
          <label class="auth-modal__field">
            <span>Confirm new password</span>
            <input
              v-model="forgotPasswordConfirm"
              type="password"
              autocomplete="new-password"
              required
            />
          </label>
          <button type="submit" class="auth-modal__submit">
            Update password
          </button>
          <p class="auth-modal__footer-links">
            <button type="button" class="auth-modal__link" @click="switchView('login')">
              Back to sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/store/authStore'
import authService from '@/services/authService'

export default {
  name: 'AuthModal',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    /** When opening from "Log in" vs "Sign up" in the nav */
    startView: {
      type: String,
      default: 'login',
      validator: (v) => ['login', 'signup', 'forgot'].includes(v)
    }
  },
  emits: ['update:open', 'logged-in'],
  setup (props, { emit }) {
    const authStore = useAuthStore()
    const titleId = 'auth-modal-title'

    const view = ref('login')
    const errorMessage = ref('')
    const banner = ref('')

    const loginIdentifierMode = ref('username')
    const loginUsername = ref('')
    const loginEmail = ref('')
    const password = ref('')

    const signupEmail = ref('')
    const signupUsername = ref('')
    const signupPassword = ref('')

    const forgotEmail = ref('')
    const forgotPassword = ref('')
    const forgotPasswordConfirm = ref('')

    const heading = computed(() => {
      if (view.value === 'signup') return 'Create account'
      if (view.value === 'forgot') return 'Reset password'
      return 'Sign in'
    })

    function clearFeedback () {
      errorMessage.value = ''
      banner.value = ''
    }

    function switchView (next) {
      view.value = next
      clearFeedback()
    }

    function emitClose () {
      emit('update:open', false)
    }

    watch(
      () => props.open,
      (isOpen) => {
        if (isOpen) {
          view.value = props.startView
          clearFeedback()
        }
      }
    )

    async function handleLogin () {
      clearFeedback()
      const ident =
        loginIdentifierMode.value === 'email'
          ? loginEmail.value.trim()
          : loginUsername.value.trim()
      const formData = new FormData()
      formData.append('username', ident)
      formData.append('password', password.value)
      try {
        await authStore.login(formData)
        loginUsername.value = ''
        loginEmail.value = ''
        password.value = ''
        emit('logged-in')
        emit('update:open', false)
      } catch (e) {
        errorMessage.value = e.message || 'Login failed'
      }
    }

    async function handleSignup () {
      clearFeedback()
      try {
        await authStore.signup({
          email: signupEmail.value,
          username: signupUsername.value,
          password: signupPassword.value
        })
        signupEmail.value = ''
        signupUsername.value = ''
        signupPassword.value = ''
        view.value = 'login'
        banner.value = 'Account created. Sign in with your username and password.'
      } catch (e) {
        errorMessage.value = e.message || 'Sign up failed'
      }
    }

    async function handleForgot () {
      clearFeedback()
      if (forgotPassword.value !== forgotPasswordConfirm.value) {
        errorMessage.value = 'New password and confirmation do not match.'
        return
      }
      const res = await authService.resetPassword({
        email: forgotEmail.value,
        newPassword: forgotPassword.value
      })
      if (res.error) {
        errorMessage.value = res.message || 'Could not reset password'
        return
      }
      forgotPassword.value = ''
      forgotPasswordConfirm.value = ''
      banner.value = 'Password updated. You can sign in with the new password.'
      view.value = 'login'
    }

    return {
      titleId,
      heading,
      view,
      errorMessage,
      banner,
      loginIdentifierMode,
      loginUsername,
      loginEmail,
      password,
      signupEmail,
      signupUsername,
      signupPassword,
      forgotEmail,
      forgotPassword,
      forgotPasswordConfirm,
      switchView,
      emitClose,
      handleLogin,
      handleSignup,
      handleForgot
    }
  }
}
</script>

<style scoped>
.auth-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: rgba(0, 0, 0, 0.45);
  box-sizing: border-box;
}

.auth-modal {
  position: relative;
  width: 100%;
  max-width: 420px;
  max-height: min(90vh, 640px);
  overflow: auto;
  padding: 28px 24px 24px;
  border-radius: 12px;
  background: #fffef9;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  border: 1px solid #e8d5cf;
}

.auth-modal__close {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #555;
  border-radius: 6px;
}

.auth-modal__close:hover {
  background: rgba(0, 0, 0, 0.06);
}

.auth-modal__title {
  margin: 0 0 16px;
  font-size: 1.35rem;
  font-weight: 600;
  color: #2a2a2a;
}

.auth-modal__segmented {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcc;
}

.auth-modal__segmented button {
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: #f5f0eb;
  cursor: pointer;
  font-size: 0.95rem;
  color: #444;
}

.auth-modal__segmented button.is-active {
  background: #e8b9ad;
  color: #1a1a1a;
  font-weight: 600;
}

.auth-modal__banner {
  margin: 0 0 14px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.auth-modal__banner--error {
  background: #fde8e8;
  color: #7a1020;
  border: 1px solid #f0b4b4;
}

.auth-modal__banner--success {
  background: #e8f5ec;
  color: #1e4d2a;
  border: 1px solid #a8d4b4;
}

.auth-modal__hint {
  margin: 0 0 14px;
  font-size: 0.85rem;
  line-height: 1.45;
  color: #555;
}

.auth-modal__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.auth-modal__fieldset {
  margin: 0;
  padding: 0;
  border: none;
}

.auth-modal__legend {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  padding: 0;
}

.auth-modal__radios {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.auth-modal__radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  cursor: pointer;
}

.auth-modal__radio input {
  accent-color: #c75b4a;
}

.auth-modal__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  color: #333;
}

.auth-modal__field input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #c9bdb8;
  font-size: 1rem;
  box-sizing: border-box;
}

.auth-modal__field input:focus {
  outline: 2px solid #e8b9ad;
  border-color: #c99a8e;
}

.auth-modal__submit {
  margin-top: 4px;
  padding: 11px 16px;
  border: none;
  border-radius: 8px;
  background: #c75b4a;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.auth-modal__submit:hover {
  background: #b04a3a;
}

.auth-modal__footer-links {
  margin: 0;
  text-align: center;
}

.auth-modal__link {
  background: none;
  border: none;
  padding: 0;
  color: #1a5f7a;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
}

.auth-modal__link:hover {
  color: #0d3d4d;
}
</style>
