import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import reveal from './directives/reveal'
import { setupI18n, detectLocaleByIp } from './i18n'

// Idioma: primero preferencia guardada / idioma del navegador (síncrono),
// luego se refina por IP en segundo plano (no bloquea el render).
setupI18n()

const app = createApp(App)

// Directiva global de revelado por scroll: v-reveal
app.directive('reveal', reveal)

app.mount('#app')

detectLocaleByIp()
