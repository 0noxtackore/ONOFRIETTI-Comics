<script setup>
// Ficha de detalle del cómic (se abre en /comic/<slug>).
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { fetchComicBySlug, fetchComics } from '../../services/comicsService'
import { getSeriesById } from '../../services/seriesService'
import { onAdminAuth } from '../../firebase/auth'

const props = defineProps({
  slug: { type: String, required: true },
})
const emit = defineEmits(['close'])

const comic = ref(null)
const loading = ref(true)
const copied = ref(false)
const added = ref(false)
const related = ref([])
const series = ref(null)
const isAdmin = ref(false)

const isAvailable = computed(() => ['Available', 'Limited Edition'].includes(comic.value?.status))

async function load() {
  loading.value = true
  added.value = false
  comic.value = await fetchComicBySlug(props.slug)
  related.value = []
  series.value = null
  if (comic.value) {
    console.log('Comic seriesId:', comic.value.seriesId)
    // Fetch series if comic has a seriesId
    if (comic.value.seriesId) {
      series.value = await getSeriesById(comic.value.seriesId)
      console.log('Series loaded:', series.value)
    }
    const list = await fetchComics()
    const base = isAdmin.value
      ? list
      : list.filter((c) => ['Available', 'Limited Edition'].includes(c.status))
    related.value = base
      .filter((c) => c.protagonist === comic.value.protagonist && c.id !== comic.value.id)
      .sort((a, b) => a.issue - b.issue)
      .filter((c) => c.issue > comic.value.issue)
      .slice(0, 4)
  }
  loading.value = false
}

function buy() {
  if (!isAvailable.value) return
  added.value = true
  emit('close')
}

function onKey(e) {
  if (e.key === 'Escape') emit('close')
}

function productUrl() {
  return window.location.origin + window.location.pathname.replace(/\/comics\/.*$/, '') + '/comics/' + props.slug
}

function shareText() {
  return `${comic.value?.title || 'Onofrietti Comics'} — Onofrietti Comics`
}

function shareUrl(platform) {
  const url = encodeURIComponent(productUrl())
  const text = encodeURIComponent(shareText())
  if (platform === 'whatsapp') return `https://wa.me/?text=${text}%20${url}`
  if (platform === 'x') return `https://twitter.com/intent/tweet?text=${text}&url=${url}`
  if (platform === 'facebook') return `https://www.facebook.com/sharer/sharer.php?u=${url}`
  if (platform === 'reddit') return `https://www.reddit.com/submit?url=${url}&title=${text}`
  return productUrl()
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(productUrl())
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Clipboard no disponible
  }
}

let unsubscribeAuth = null
onMounted(async () => {
  window.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
  unsubscribeAuth = await onAdminAuth((u) => {
    isAdmin.value = Boolean(u)
    if (comic.value) load()
  })
  load()
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
  if (unsubscribeAuth) unsubscribeAuth()
})

watch(() => props.slug, load)
</script>

<template>
  <div class="fixed inset-0 z-[90] overflow-y-auto bg-black" @click.self="emit('close')">
    <!-- Cargando -->
    <div v-if="loading" class="min-h-screen animate-pulse bg-black">
      <div class="h-screen bg-ink-900"></div>
    </div>

    <!-- No encontrado -->
    <div v-else-if="!comic" class="flex min-h-screen items-center justify-center p-10">
      <div class="text-center">
        <p class="text-sm uppercase tracking-[0.25em] text-ink-400">Comic not found</p>
        <button
          @click="emit('close')"
          class="mt-6 rounded-lg bg-white px-8 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors duration-300 hover:bg-ink-200"
        >
          Back
        </button>
      </div>
    </div>

    <!-- Comic Detail -->
    <div v-else class="min-h-screen">
      <!-- Close Button -->
      <button
        @click="emit('close')"
        aria-label="Close"
        class="fixed right-6 top-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Main Content -->
      <div class="mx-auto max-w-6xl px-8 py-16 md:px-16 md:py-24">
        <!-- Top Section: Series/Issue/Buy + Cover -->
        <div class="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <!-- Left: Series Logo, Issue, Buy Button -->
          <div class="flex flex-col items-center text-center lg:items-start lg:text-left">
            <!-- Series Logo -->
            <div v-if="series && series.logo" class="mb-6">
              <img
                :src="series.logo"
                :alt="`Logo of ${series.name}`"
                class="max-h-32 w-auto object-contain drop-shadow-lg md:max-h-36"
              />
            </div>

            <!-- Issue + Rating Row -->
            <div class="flex items-center gap-6">
              <!-- Menubar Logo -->
              <img src="/images/logo-menubar.png" alt="Logo" class="h-24 w-auto object-contain md:h-32" />

              <div class="flex flex-col items-center gap-4 lg:items-start">
                <!-- Issue Number -->
                <p class="font-display text-xl font-black uppercase text-white md:text-2xl">
                  ISSUE {{ comic.issue }}
                </p>

                <!-- Comic Info -->
                <div class="flex flex-wrap gap-x-6 gap-y-1 text-[11px] uppercase tracking-[0.15em] text-ink-400">
                  <span>Author: {{ comic.author }}</span>
                  <span>Year: {{ comic.year }}</span>
                  <span>Pages: {{ comic.pages || '—' }}</span>
                </div>
              </div>

              <!-- Rating Circle -->
              <div v-if="comic.rating != null" class="flex flex-col items-center gap-2">
                <div class="relative h-32 w-32 md:h-40 md:w-40">
                  <svg class="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" stroke-width="4" class="text-ink-700" />
                    <circle
                      cx="50" cy="50" r="44"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="4"
                      stroke-linecap="round"
                      :stroke-dasharray="276.46"
                      :stroke-dashoffset="276.46 - (276.46 * comic.rating) / 100"
                      class="text-white transition-all duration-700"
                    />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="font-display text-3xl font-black text-white md:text-4xl">{{ comic.rating }}</span>
                    <span class="text-[10px] uppercase tracking-wider text-ink-500">%</span>
                  </div>
                </div>
                <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-500">Rating</span>
              </div>
            </div>

            <!-- Buy Button -->
            <a
              :href="isAvailable ? '#comics' : undefined"
              :aria-disabled="!isAvailable"
              @click="buy"
              class="mt-8 flex w-full items-center justify-center gap-3 rounded-xl px-8 py-5 text-sm font-bold uppercase tracking-[0.25em] transition-all duration-300 lg:w-auto"
              :class="
                isAvailable
                  ? 'bg-white text-black hover:bg-ink-200 hover:shadow-lg hover:shadow-white/10'
                  : 'pointer-events-none cursor-not-allowed border border-ink-700 text-ink-500'
              "
            >
              <svg v-if="isAvailable && added" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
              </svg>
              <svg v-else viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
              </svg>
              {{ isAvailable ? (added ? 'Added!' : 'Add to Cart') : comic.status }}
            </a>
          </div>

          <!-- Right: Comic Cover -->
          <div class="flex justify-center lg:justify-end">
            <div class="overflow-hidden shadow-2xl shadow-black/50">
              <img
                :src="comic.poster || '/images/no-image.webp'"
                :alt="`Cover of ${comic.title}`"
                class="w-96 object-cover md:w-[28rem]"
              />
            </div>
          </div>
        </div>

        <!-- Comic Details Section -->
        <section class="mt-16 border-t border-ink-800 pt-16 md:mt-24">
          <h2 class="text-[10px] font-bold uppercase tracking-[0.4em] text-ink-500">Comic Details</h2>

          <div class="mt-6">
            <!-- Description -->
            <div v-if="comic.description">
              <p class="max-w-3xl text-lg leading-relaxed text-ink-200 md:text-xl">
                {{ comic.description }}
              </p>
            </div>
          </div>
        </section>

        <!-- More from this series -->
        <section v-if="related.length" class="mt-16 border-t border-ink-800 pt-16 md:mt-24">
          <h2 class="text-[10px] font-bold uppercase tracking-[0.4em] text-ink-500">More from this series</h2>
          <h3 class="font-display mt-2 text-3xl font-black uppercase tracking-tight text-white">{{ comic.title }}</h3>

          <div class="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            <a v-for="r in related" :key="r.id" :href="`/comics/${r.slug}`" class="group block">
              <div class="overflow-hidden rounded-xl border border-ink-800 bg-ink-900 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/5">
                <img
                  :src="r.poster || '/images/no-image.webp'"
                  :alt="`Cover of ${r.title}`"
                  class="aspect-[1920/2951] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <p class="mt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-ink-500">{{ r.year }}</p>
              <h4 class="font-display mt-1 text-sm font-black uppercase tracking-tight text-white">{{ r.title }}</h4>
              <p class="mt-0.5 text-xs text-ink-400">Issue {{ r.issue }}</p>
            </a>
          </div>
        </section>
      </div>

      <!-- Footer Spacer -->
      <div class="h-16 bg-black"></div>
    </div>
  </div>
</template>
