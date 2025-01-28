import { createWebHistory, createRouter } from 'vue-router'

// import App from './App.vue'
import SceneMenu from './views/SceneMenu.vue'
import SceneView from './views/SceneView.vue'

const routes = [
  { path: '/scene-menu', name: 'SceneMenu', component: SceneMenu },
  { path: '/scene-view/:id', name: 'SceneView', component: SceneView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router