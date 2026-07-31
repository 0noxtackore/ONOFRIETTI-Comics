<script setup>
// Rutas por hash:
//   #/admin       → panel de administración oculto
//   #/comic/<id>  → ficha de detalle del cómic (código de producto + enlace)
// El resto de la URL muestra el sitio normal.
import { ref, onMounted, onUnmounted } from 'vue'
import SiteHeader from './components/layout/SiteHeader.vue'
import SiteMenu from './components/layout/SiteMenu.vue'
import SiteFooter from './components/layout/SiteFooter.vue'
import HeroSection from './components/sections/HeroSection.vue'
import LatestComicsSection from './components/sections/LatestComicsSection.vue'
import AdminPanel from './components/admin/AdminPanel.vue'
import ComicDetail from './components/comic/ComicDetail.vue'

const isAdmin = ref(false)
const comicId = ref(null)

function parseHash() {
  const hash = window.location.hash
  isAdmin.value = hash.startsWith('#/admin')
  const m = hash.match(/^#\/comic\/(.+)$/)
  comicId.value = m ? decodeURIComponent(m[1]) : null
}

function closeDetail() {
  window.location.hash = ''
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
  parseHash()
  window.addEventListener('hashchange', parseHash)

  protectImages()
  imageObserver = new MutationObserver(protectImages)
  imageObserver.observe(document.body, { childList: true, subtree: true })
})
onUnmounted(() => {
  window.removeEventListener('hashchange', parseHash)
  if (imageObserver) imageObserver.disconnect()
})
</script>

<template>
  <!-- Panel de administración (solo en #/admin) -->
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

  <!-- Ficha de detalle del cómic (solo en #/comic/<id>) -->
  <ComicDetail v-if="!isAdmin && comicId" :comic-id="comicId" @close="closeDetail" />
</template>
