<script setup>
// Ficha de detalle del cómic (se abre en /comics/<slug>).
// Página completa con hero section, secciones de detalles y compra.
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { fetchComicBySlug, fetchComics } from '../../services/comicsService'
import { onAdminAuth } from '../../firebase/auth'
import { navigate } from '../../utils/router'

const props = defineProps({
  slug: { type: String, required: true },
})
const emit = defineEmits(['close'])

const comic = ref(null)
const loading = ref(true)
const copied = ref(false)
const added = ref(false)
const related = ref([])
const isAdmin = ref(false)

const isAvailable = computed(() => ['Available', 'Limited Edition'].includes(comic.value?.status))

async function load() {
  loading.value = true
  added.value = false
  comic.value = await fetchComicBySlug(props.slug)
  related.value = []
  if (comic.value) {
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
  window.scrollTo(0, 0)
}

function buy() {
  if (!isAvailable.value) return
  added.value = true
  setTimeout(() => {
    navigate('/')
  }, 1500)
}

function goBack() {
  navigate('/')
}

function productUrl() {
  return window.location.origin + '/comics/' + props.slug
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
  unsubscribeAuth = await onAdminAuth((u) => {
    isAdmin.value = Boolean(u)
    if (comic.value) load()
  })
  load()
})
onUnmounted(() => {
  if (unsubscribeAuth) unsubscribeAuth()
})

watch(() => props.slug, load)
</script>

<template>
  <div class="min-h-screen bg-black pt-20">
    <!-- Cargando -->
    <div v-if="loading" class="animate-pulse">
      <div class="h-[60vh] bg-ink-900"></div>
      <div class="mx-auto max-w-6xl px-8 py-16">
        <div class="h-8 w-64 bg-ink-800"></div>
        <div class="mt-4 h-16 w-3/4 bg-ink-700"></div>
        <div class="mt-8 h-4 w-1/2 bg-ink-800"></div>
      </div>
    </div>

    <!-- No encontrado -->
    <div v-else-if="!comic" class="flex min-h-[60vh] items-center justify-center p-10">
      <div class="text-center">
        <p class="text-sm uppercase tracking-[0.25em] text-ink-400">Comic not found</p>
        <button
          @click="goBack"
          class="mt-6 rounded-lg bg-white px-8 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors duration-300 hover:bg-ink-200"
        >
          Back to Home
        </button>
      </div>
    </div>

    <!-- Comic Detail -->
    <div v-else>
      <!-- Hero Section -->
      <section class="relative h-[70vh] min-h-[500px] overflow-hidden">
        <!-- Background Image -->
        <div class="absolute inset-0">
          <img
            :src="comic.poster || '/images/no-image.webp'"
            :alt="`Cover of ${comic.title}`"
            class="h-full w-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        </div>

        <!-- Hero Content -->
        <div class="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div class="mx-auto max-w-6xl">
            <!-- Back Button -->
            <button
              @click="goBack"
              class="mb-6 inline-flex items-center gap-2 text-sm text-ink-300 transition-colors hover:text-white"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Catalog
            </button>

            <!-- Status Badge -->
            <span
              v-if="comic.status"
              class="mb-4 inline-block rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em]"
              :class="
                comic.status === 'Available'
                  ? 'bg-green-500/20 text-green-400'
                  : comic.status === 'Limited Edition'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : comic.status === 'Sold Out'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-ink-600/50 text-ink-300'
              "
            >
              {{ comic.status }}
            </span>

            <!-- Title -->
            <h1 class="font-display text-5xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-7xl md:text-8xl">
              {{ comic.title }}
            </h1>

            <!-- Meta -->
            <div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-300">
              <span class="font-semibold uppercase tracking-wider">Issue {{ comic.issue }}</span>
              <span class="text-ink-600">|</span>
              <span class="uppercase tracking-wider">{{ comic.year }}</span>
              <span class="text-ink-600">|</span>
              <span class="uppercase tracking-wider">{{ comic.author }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Content Sections -->
      <div class="mx-auto max-w-6xl px-8 py-16 md:px-16 md:py-24">
        <div class="flex flex-col gap-16 lg:flex-row lg:gap-24">
          <!-- Main Content -->
          <div class="flex-1">
            <!-- Synopsis -->
            <section>
              <h2 class="text-[10px] font-bold uppercase tracking-[0.4em] text-ink-500">Synopsis</h2>
              <p
                v-if="comic.description"
                class="mt-6 text-lg leading-relaxed text-ink-200"
              >
                {{ comic.description }}
              </p>
              <p v-else class="mt-6 text-ink-500">No description available.</p>
            </section>

            <!-- Details Grid -->
            <section class="mt-16">
              <h2 class="text-[10px] font-bold uppercase tracking-[0.4em] text-ink-500">Details</h2>
              <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div class="rounded-xl border border-ink-800 bg-ink-900/50 p-4">
                  <dt class="text-[10px] font-bold uppercase tracking-[0.25em] text-ink-500">Author</dt>
                  <dd class="mt-2 font-display text-lg font-black text-white">{{ comic.author }}</dd>
                </div>
                <div class="rounded-xl border border-ink-800 bg-ink-900/50 p-4">
                  <dt class="text-[10px] font-bold uppercase tracking-[0.25em] text-ink-500">Issue</dt>
                  <dd class="mt-2 font-display text-lg font-black text-white">#{{ comic.issue }}</dd>
                </div>
                <div class="rounded-xl border border-ink-800 bg-ink-900/50 p-4">
                  <dt class="text-[10px] font-bold uppercase tracking-[0.25em] text-ink-500">Year</dt>
                  <dd class="mt-2 font-display text-lg font-black text-white">{{ comic.year }}</dd>
                </div>
                <div class="rounded-xl border border-ink-800 bg-ink-900/50 p-4">
                  <dt class="text-[10px] font-bold uppercase tracking-[0.25em] text-ink-500">Pages</dt>
                  <dd class="mt-2 font-display text-lg font-black text-white">{{ comic.pages || '—' }}</dd>
                </div>
              </div>
            </section>

            <!-- Related Comics -->
            <section v-if="related.length" class="mt-16">
              <h2 class="text-[10px] font-bold uppercase tracking-[0.4em] text-ink-500">More from this series</h2>
              <h3 class="font-display mt-2 text-2xl font-black uppercase tracking-tight text-white">{{ comic.title }}</h3>
              <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <a v-for="r in related" :key="r.id" :href="`/comics/${r.slug}`" class="group block">
                  <div class="overflow-hidden rounded-xl border border-ink-800 bg-ink-900 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:shadow-white/5">
                    <img
                      :src="r.poster || '/images/no-image.webp'"
                      :alt="`Cover of ${r.title}`"
                      class="aspect-[1920/2951] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <p class="mt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-ink-500">{{ r.year }}</p>
                  <h4 class="font-display mt-1 text-sm font-black uppercase tracking-tight text-white">{{ r.title }}</h4>
                  <p class="mt-0.5 text-xs text-ink-400">Issue {{ r.issue }}</p>
                </a>
              </div>
            </section>
          </div>

          <!-- Sidebar: Buy Box -->
          <div class="w-full lg:w-80 lg:shrink-0">
            <div class="sticky top-24">
              <!-- Cover Image -->
              <div class="overflow-hidden rounded-2xl border border-ink-800 shadow-2xl shadow-black/50">
                <img
                  :src="comic.poster || '/images/no-image.webp'"
                  :alt="`Cover of ${comic.title}`"
                  class="w-full object-cover"
                />
              </div>

              <!-- Buy Box -->
              <div class="mt-6 rounded-xl border border-ink-800 bg-ink-900/50 p-6">
                <!-- Status -->
                <div class="text-center">
                  <p v-if="isAvailable" class="font-display text-3xl font-black text-white">
                    Buy Now
                  </p>
                  <p v-else class="font-display text-xl font-black uppercase text-ink-400">
                    {{ comic.status }}
                  </p>
                </div>

                <!-- Buy Button -->
                <a
                  :href="isAvailable ? '#comics' : undefined"
                  :aria-disabled="!isAvailable"
                  @click="buy"
                  class="mt-6 flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] transition-all duration-300"
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

                <!-- Share -->
                <div class="mt-6 border-t border-ink-800 pt-6">
                  <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-500">Share</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <a
                      :href="shareUrl('whatsapp')"
                      target="_blank"
                      rel="noopener"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-300 transition-colors duration-300 hover:border-white hover:text-white"
                    >
                      <svg viewBox="0 0 448 512" width="10" height="10" fill="currentColor" aria-hidden="true">
                        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                      </svg>
                      WA
                    </a>
                    <a
                      :href="shareUrl('x')"
                      target="_blank"
                      rel="noopener"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-300 transition-colors duration-300 hover:border-white hover:text-white"
                    >
                      <svg viewBox="0 0 448 512" width="10" height="10" fill="currentColor" aria-hidden="true">
                        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
                      </svg>
                      X
                    </a>
                    <a
                      :href="shareUrl('facebook')"
                      target="_blank"
                      rel="noopener"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-300 transition-colors duration-300 hover:border-white hover:text-white"
                    >
                      <svg viewBox="0 0 448 512" width="10" height="10" fill="currentColor" aria-hidden="true">
                        <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                      </svg>
                      FB
                    </a>
                    <button
                      @click="copyLink"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-300 transition-colors duration-300 hover:border-white hover:text-white"
                    >
                      <svg v-if="!copied" viewBox="0 0 16 16" width="10" height="10" fill="currentColor" aria-hidden="true">
                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
                      </svg>
                      <svg v-else viewBox="0 0 16 16" width="10" height="10" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
                      </svg>
                      {{ copied ? 'Copied!' : 'Link' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
