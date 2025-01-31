import { createWebHashHistory, createRouter } from 'vue-router'

import App from './App.vue'

const routes = [
  { path: '/scene', name: 'SceneView', component: App }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
export default router