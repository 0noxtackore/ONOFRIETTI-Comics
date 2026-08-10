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
import { useCatalog } from '../../composables/useCatalog'

const comics = ref([])
const loading = ref(true)
const isAdmin = ref(false)

// Búsqueda y filtros compartidos con el header (estilo DeviantArt).
const { query, selectedProtagonist, reset } = useCatalog()

const baseList = computed(() => {
  if (isAdmin.value) return comics.value
  return comics.value.filter((c) => ['Available', 'Limited Edition'].includes(c.status))
})

// Categorías visibles: solo las que tienen cómics en la lista base.
const protagonists = computed(() => [...new Set(baseList.value.map((c) => c.protagonist))])

const visibleComics = computed(() => {
  const q = query.value.trim().toLowerCase()
  let list = baseList.value

  if (selectedProtagonist.value) {
    list = list.filter((c) => c.protagonist === selectedProtagonist.value)
  }

  if (q) {
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.protagonist || '').toLowerCase().includes(q) ||
        (c.author || '').toLowerCase().includes(q) ||
        String(c.issue) === q ||
        String(c.year) === q
    )
  }

  return list
})

function pill(active) {
  return active
    ? 'border-da-400 bg-white text-black'
    : 'border-white/20 text-white/60 hover:border-da-400 hover:text-da-400'
}

function protagonistCount(p) {
  return baseList.value.filter((c) => c.protagonist === p).length
}

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
  <section id="comics" class="relative bg-black py-24 md:py-36">
    <div class="mx-auto max-w-7xl px-5 md:px-8">
      <div class="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          kicker="Latest issues"
          title="New releases and available comics"
          description="Each issue is a collectible. Ink on paper, no rush, just as it should be."
        />
      </div>

      <div class="mt-12 lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
        <!-- Sidebar de filtros -->
        <aside class="self-start border border-white/10 bg-ink-950/40 p-5 lg:sticky lg:top-24">
          <h3 class="border-b border-white/10 pb-4 text-xs font-bold uppercase tracking-[0.3em] text-white">Filters</h3>

          <!-- Búsqueda (compartida con el header) -->
          <div class="relative mt-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
              aria-hidden="true"
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
            <input
              v-model="query"
              type="search"
              placeholder="Search comics…"
              aria-label="Search comics"
              class="w-full border border-white/15 bg-ink-950/60 py-2.5 pl-10 pr-9 text-sm text-white transition-colors duration-300 placeholder:text-white/40 focus:border-da-400 focus:outline-none"
            />
            <button
              v-if="query"
              type="button"
              @click="query = ''"
              aria-label="Clear search"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3.5 w-3.5" aria-hidden="true">
                <path d="M8 6.586 2.707 1.293 1.293 2.707 6.586 8l-5.293 5.293 1.414 1.414L8 9.414l5.293 5.293 1.414-1.414L9.414 8l5.293-5.293-1.414-1.414z"/>
              </svg>
            </button>
          </div>

          <!-- Por protagonista -->
          <div class="mt-5">
            <p class="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">Character</p>
            <div class="mt-3 flex flex-col gap-2">
              <button
                type="button"
                @click="selectedProtagonist = ''"
                class="flex min-h-[2.5rem] w-full items-center justify-between gap-3 border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-200"
                :class="pill(selectedProtagonist === '')"
              >
                <span>All</span>
                <span class="shrink-0 bg-white/10 px-2 py-0.5 text-[10px] opacity-60">{{ baseList.length }}</span>
              </button>
              <button
                v-for="p in protagonists"
                :key="p"
                type="button"
                @click="selectedProtagonist = p"
                class="flex min-h-[2.5rem] w-full items-center justify-between gap-3 border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-200"
                :class="pill(selectedProtagonist === p)"
              >
                <span class="truncate">{{ p }}</span>
                <span class="shrink-0 bg-white/10 px-2 py-0.5 text-[10px] opacity-60">{{ protagonistCount(p) }}</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- Catálogo -->
        <div class="mt-10 lg:mt-0">
          <!-- Aviso solo para admin -->
          <div
            v-if="isAdmin"
            class="mb-6 flex items-center gap-3 border border-white/20 bg-ink-950/60 px-4 py-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4 shrink-0 text-white/70" aria-hidden="true">
              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
            </svg>
            <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
              You are viewing Coming Soon comics because you are the admin. Other visitors won't see them.
            </p>
          </div>

          <p class="text-xs uppercase tracking-[0.25em] text-white/40">
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

          <!-- Sin resultados -->
          <div v-else-if="visibleComics.length === 0" class="mt-6 border border-white/10 p-10 text-center">
            <p class="text-sm uppercase tracking-[0.25em] text-white/40">No comics match your search.</p>
            <button
              type="button"
              @click="reset()"
              class="link-line mt-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-da-400"
            >
              Clear search and filters
            </button>
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
