import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import reveal from './directives/reveal'

const app = createApp(App)

// Directiva global de revelado por scroll: v-reveal
app.directive('reveal', reveal)

app.mount('#app')
