import { createApp } from 'vue'
import UtilityChart from './UtilityChart2.vue'
// import UiMockups from './UiMockups.vue'
import { createPinia } from 'pinia'

createApp(UtilityChart)
  .use(createPinia())
  .mount('#app')
