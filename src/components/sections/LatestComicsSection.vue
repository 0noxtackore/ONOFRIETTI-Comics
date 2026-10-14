<script setup>
// Catálogo con filtros estilo tienda (sidebar + píldoras).
// El catálogo se lee desde Firebase (Firestore) si está configurado;
// si no, se usa el catálogo local de prueba.
// Visitantes solo ven cómics disponibles; con sesión de admin se ven
// también los "Coming Soon" (y todos los del catálogo).
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SectionHeading from '../ui/SectionHeading.vue'
import ComicCard from '../comic/ComicCard.vue'
import { fetchComics } from '../../services/comicsService'
import { onAdminAuth } from '../../firebase/auth'

const comics = ref([])
const loading = ref(true)
const isAdmin = ref(false)

const baseList = computed(() => {
  if (isAdmin.value) return comics.value
  return comics.value.filter((c) => ['Available', 'Limited Edition'].includes(c.status))
})

// Categorías visibles: solo las que tienen cómics en la lista base.
const protagonists = computed(() => [...new Set(baseList.value.map((c) => c.protagonist))])

const visibleComics = computed(() => baseList.value)

let unsubscribeAuth = null
onMounted(async () => {
  unsubscribeAuth = await onAdminAuth((u) => {
    isAdmin.value = Boolean(u)
  })
  comics.value = await fetchComics()
  loading.value = false
})
onUnmounted(() => {
  if (unsubscribeAuth) unsubscribeAuth()
})
</script>

<template>
  <section id="comics" class="relative bg-ink-50 py-24 text-ink-950 md:py-36">
    <div class="mx-auto max-w-7xl px-5 md:px-8">
      <div class="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          kicker="Comics"
        />
      </div>

      <div class="mt-12">

        <!-- Catálogo -->
        <div class="mt-10 lg:mt-0">
          <!-- Aviso solo para admin -->
          <div
            v-if="isAdmin"
            class="mb-6 flex items-center gap-3 border border-ink-950/20 bg-ink-950/5 px-4 py-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 shrink-0 text-white/70" aria-hidden="true">
              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
            </svg>
            <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-950/70">
              You are viewing Coming Soon comics because you are the admin. Other visitors won't see them.
            </p>
          </div>

          <p class="text-xs uppercase tracking-[0.25em] text-ink-950/40">
            {{ visibleComics.length }} {{ visibleComics.length === 1 ? 'result' : 'results' }}
          </p>

          <!-- Esqueleto de carga -->
          <div v-if="loading" class="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            <div v-for="i in 6" :key="i" class="animate-pulse">
              <div class="aspect-[1920/2951] bg-ink-800"></div>
              <div class="mt-5 space-y-2">
                <div class="h-3 w-24 bg-ink-800"></div>
                <div class="h-5 w-40 bg-ink-700"></div>
              </div>
            </div>
          </div>

          <!-- Grid de cómics -->
          <div v-else class="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            <ComicCard v-for="(comic, i) in visibleComics" :key="comic.id" :comic="comic" :index="i" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
