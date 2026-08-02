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

const selectedProtagonist = ref('')

const protagonists = computed(() => [...new Set(comics.value.map((c) => c.protagonist))])

const baseList = computed(() => {
  if (isAdmin.value) return comics.value
  return comics.value.filter((c) => ['Available', 'Limited Edition'].includes(c.status))
})

const visibleComics = computed(() => {
  if (selectedProtagonist.value) {
    return baseList.value.filter((c) => c.protagonist === selectedProtagonist.value)
  }
  return baseList.value
})

function pill(active) {
  return active
    ? 'border-white bg-white text-black'
    : 'border-white/20 text-white/60 hover:border-white hover:text-white'
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
                <span class="shrink-0 text-[10px] opacity-50">{{ baseList.length }}</span>
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
                <span class="shrink-0 text-[10px] opacity-50">{{ protagonistCount(p) }}</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- Catálogo -->
        <div class="mt-10 lg:mt-0">
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
            <p class="text-sm uppercase tracking-[0.25em] text-white/40">No comics match your filters.</p>
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
