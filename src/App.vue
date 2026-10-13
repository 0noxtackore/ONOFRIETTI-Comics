<script setup>
// Rutas en modo history (URLs limpias):
//   /admin           → panel de administración oculto
//   /comics/<slug>   → ficha de detalle del cómic (slug del título)
import { ref, onMounted, onUnmounted } from 'vue'
import SiteHeader from './components/layout/SiteHeader.vue'
import SiteMenu from './components/layout/SiteMenu.vue'
import SiteFooter from './components/layout/SiteFooter.vue'
import HeroSection from './components/sections/HeroSection.vue'
import LatestComicsSection from './components/sections/LatestComicsSection.vue'
import AdminPanel from './components/admin/AdminPanel.vue'
import ComicDetail from './components/comic/ComicDetail.vue'
import { navigate } from './utils/router'

const isAdmin = ref(false)
const comicSlug = ref(null)

function parseRoute() {
  const path = window.location.pathname
  isAdmin.value = path.startsWith('/admin')
  const m = path.match(/^\/comics\/(.+)$/)
  comicSlug.value = m ? decodeURIComponent(m[1]) : null
}

function closeDetail() {
  navigate('/')
}

// Intercepta los enlaces internos (empezando por "/") para navegar sin
// recargar la página. Los anclas de sección ("#comics", etc.) siguen
// funcionando como scroll normal.
function onDocumentClick(e) {
  const anchor = e.target.closest('a')
  if (!anchor) return
  const href = anchor.getAttribute('href')
  if (!href || !href.startsWith('/')) return
  const url = new URL(href, window.location.origin)
  if (url.origin !== window.location.origin) return
  e.preventDefault()
  navigate(url.pathname + url.search)
}

// Protege las imágenes: evita que se puedan arrastrar (se aplica a las que
// carguen después gracias al MutationObserver).
function protectImages() {
  document.querySelectorAll('img').forEach((img) => {
    img.draggable = false
  })
}

let imageObserver = null
onMounted(() => {
  parseRoute()
  window.addEventListener('popstate', parseRoute)
  document.addEventListener('click', onDocumentClick)

  protectImages()
  imageObserver = new MutationObserver(protectImages)
  imageObserver.observe(document.body, { childList: true, subtree: true })
})
onUnmounted(() => {
  window.removeEventListener('popstate', parseRoute)
  document.removeEventListener('click', onDocumentClick)
  if (imageObserver) imageObserver.disconnect()
})
</script>

<template>
  <!-- Panel de administración (solo en /admin) -->
  <AdminPanel v-if="isAdmin" />

  <div v-else class="min-h-screen overflow-x-clip bg-black text-white antialiased selection:bg-white selection:text-black">
    <!-- Grano de película sobre toda la página -->
    <div class="noise-overlay" aria-hidden="true"></div>

    <SiteHeader />
    <SiteMenu />

    <main>
      <!-- Página principal -->
      <HeroSection />
      <!-- Sección de cómics -->
      <LatestComicsSection />
    </main>

    <SiteFooter />
  </div>

  <!-- Ficha de detalle del cómic (solo en /comics/<slug>) -->
  <ComicDetail v-if="!isAdmin && comicSlug" :slug="comicSlug" @close="closeDetail" />
</template>