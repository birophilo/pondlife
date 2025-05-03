import { createApp } from 'vue'
// import App from './App.vue'
import UiMockups from './UiMockups.vue'
import { createPinia } from 'pinia'

createApp(UiMockups)
  .use(createPinia())
  .mount('#app')
