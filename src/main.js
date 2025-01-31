import { createApp } from 'vue'
import router from './router'
import HomeMenu from './HomeMenu.vue'
import { createPinia } from 'pinia'

createApp(HomeMenu)
  .use(router)
  .use(createPinia())
  .mount('#app')
