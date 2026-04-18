<template>
  <nav class="top-nav-bar top-nav-bar--split">
    <span class="top-nav-links">
      <router-link to="/">Home</router-link>
      <router-link :to="{ name: 'sim' }">Simulation</router-link>
      <router-link :to="{ name: 'simulations' }">Simulations</router-link>
    </span>

    <span v-if="authStore.isAuthenticated" class="nav-auth-user">
      <span class="nav-auth-user-label">{{ authStore.user }}</span>
      <div ref="userMenuEl" class="user-menu">
        <button
          type="button"
          class="user-menu__trigger"
          aria-haspopup="true"
          :aria-expanded="userMenuOpen"
          aria-label="Account menu"
          @click.stop="userMenuOpen = !userMenuOpen"
        >
          <span class="user-menu__avatar" aria-hidden="true" />
        </button>
        <div
          v-show="userMenuOpen"
          class="user-menu__dropdown"
          role="menu"
        >
          <button
            type="button"
            class="user-menu__item"
            role="menuitem"
            @click="handleLogout"
          >
            Log out
          </button>
        </div>
      </div>
    </span>

    <span v-else class="nav-auth-actions">
      <button type="button" @click="openLogin">
        Log in
      </button>
      <button type="button" @click="openSignup">
        Sign up
      </button>
    </span>
  </nav>

  <AuthModal
    :open="authModalOpen"
    :start-view="authModalStartView"
    @update:open="onAuthModalOpen"
    @logged-in="onLoggedIn"
  />
</template>

<script>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useAuthStore } from '@/store/authStore'
import AuthModal from '@/components/AuthModal.vue'

export default {
  name: 'NavTopLogin',
  components: { AuthModal },
  setup () {
    const authStore = useAuthStore()

    const authModalOpen = ref(false)
    const authModalStartView = ref('login')

    const userMenuOpen = ref(false)
    const userMenuEl = ref(null)

    function onDocumentClick (e) {
      if (!userMenuOpen.value) return
      const el = userMenuEl.value
      if (el && !el.contains(e.target)) {
        userMenuOpen.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', onDocumentClick)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', onDocumentClick)
    })

    function openLogin () {
      authModalStartView.value = 'login'
      authModalOpen.value = true
    }

    function openSignup () {
      authModalStartView.value = 'signup'
      authModalOpen.value = true
    }

    function onAuthModalOpen (v) {
      authModalOpen.value = v
    }

    function onLoggedIn () {
      userMenuOpen.value = false
    }

    async function handleLogout () {
      userMenuOpen.value = false
      await authStore.logout()
    }

    return {
      authStore,
      authModalOpen,
      authModalStartView,
      userMenuOpen,
      userMenuEl,
      openLogin,
      openSignup,
      onAuthModalOpen,
      onLoggedIn,
      handleLogout
    }
  }
}
</script>

<style scoped>
nav {
  min-height: 30px;
  border-bottom: 1px solid #e8b9ad;
  padding: 8px 20px 10px 20px;
  box-sizing: border-box;
}

.top-nav-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
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

.nav-auth-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-auth-actions button {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid #c99a8e;
  background: #fffef9;
  cursor: pointer;
  font-size: 0.95rem;
}

.nav-auth-actions button:hover {
  background: #faf5f0;
}

.nav-auth-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-auth-user-label {
  font-size: 0.95rem;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu {
  position: relative;
}

.user-menu__trigger {
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  line-height: 0;
}

.user-menu__avatar {
  display: block;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(145deg, #dfe9f2 0%, #e8b9ad 55%, #c9d6e0 100%);
  border: 2px solid #c4a89e;
  box-sizing: border-box;
}

.user-menu__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  padding: 6px 0;
  background: #fffef9;
  border: 1px solid #dcc;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 9000;
}

.user-menu__item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  font-size: 0.95rem;
  cursor: pointer;
}

.user-menu__item:hover {
  background: #f5ebe6;
}
</style>
