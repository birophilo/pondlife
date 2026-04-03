import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SimView from '@/views/SimView.vue'
import SimulationsView from '@/views/SimulationsView.vue'

/**
 * Plan 3 Phase C + G
 * • No :key on <router-view> unless you intend a full sim remount.
 * • SimView: `/sim` (blank slate) or `/simulation/:sceneId` (load scene from URL / refresh).
 * • SimView onBeforeUnmount calls stopSimRuntime (sim.destroy) so rAF and listeners stop when
 *   navigating away (Phase I: leave and return = no duplicate loops).
 */
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/simulation/:sceneId',
    name: 'simulationDetail',
    component: SimView
  },
  {
    path: '/sim',
    name: 'sim',
    component: SimView
  },
  {
    path: '/simulations',
    name: 'simulations',
    component: SimulationsView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
