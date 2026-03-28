import { createRouter, createWebHistory } from 'vue-router'
import SimView from '@/views/SimView.vue'

/**
 * Plan 3 Phase C — single sim route keeps SimView (and its canvas ref) mounted
 * across in-route UI updates. Add :key on <router-view> only when a full remount
 * is intentional; a keyed view would destroy the canvas and sim runtime.
 */
const routes = [
  {
    path: '/',
    name: 'sim',
    component: SimView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
