import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/tailwind.css' // Импортируем глобальный SCSS
import vClickOutside from "click-outside-vue3"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(vClickOutside)
app.use(ElementPlus)
app.use(pinia)

app.mount('#app')
