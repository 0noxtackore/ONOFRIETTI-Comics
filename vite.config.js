import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Configuración base de Vite para Vue 3.
export default defineConfig({
  plugins: [vue()],
  server: {
    // SPA fallback en desarrollo: sirven index.html para rutas que no son assets
    setupMiddlewares(middlewares) {
      middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || ''
        // Si es un asset conocido, dejar pasar
        if (/\.(js|css|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot)$/i.test(url)) {
          return next()
        }
        // Rutas de la app: reescribir a index.html
        req.url = '/index.html'
        next()
      })
    },
  },
})
