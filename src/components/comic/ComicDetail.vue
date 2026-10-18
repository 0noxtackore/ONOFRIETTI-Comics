<script setup>
// Ficha de detalle del cómic (se abre en /comic/<slug>).
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { fetchComicBySlug, fetchComics } from '../../services/comicsService'
import { getSeriesById } from '../../services/seriesService'
import { onAdminAuth } from '../../firebase/auth'
import { useI18n } from '../../i18n'

const props = defineProps({
  slug: { type: String, required: true },
})
const emit = defineEmits(['close'])

const { t, tStatus, locale } = useI18n()

const comic = ref(null)
const loading = ref(true)
const copied = ref(false)
const added = ref(false)
const related = ref([])
const series = ref(null)
const isAdmin = ref(false)

// Descripción a mostrar: usa la versión en español si existe y el idioma es 'es'.
const displayDescription = computed(() => {
  const c = comic.value
  if (!c) return ''
  if (locale.value === 'es' && typeof c.description === 'string' && c.descriptionEs) {
    return c.descriptionEs
  }
  return c.description
})

const isAvailable = computed(() => ['Available', 'Limited Edition'].includes(comic.value?.status))
const discountedPrice = computed(() => {
  if (!comic.value?.price) return '0.00'
  if (!comic.value?.discount) return comic.value.price.toFixed(2)
  const final = comic.value.price * (1 - comic.value.discount / 100)
  return final.toFixed(2)
})

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
  unsubscribeAuth = await onAdminAuth((u) => {
    isAdmin.value = Boolean(u)
    if (comic.value) load()
  })
  await load()
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (unsubscribeAuth) unsubscribeAuth()
})

watch(() => props.slug, load)
</script>

<template>
  <div class="bg-ink-50 text-ink-950">
    <!-- Cargando -->
    <div v-if="loading" class="flex min-h-screen items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-ink-950 border-t-transparent"></div>
    </div>

    <!-- No encontrado -->
    <div v-else-if="!comic" class="flex min-h-screen items-center justify-center p-10">
      <div class="text-center">
        <p class="text-sm uppercase tracking-[0.25em] text-ink-400">{{ t('detail.notFound') }}</p>
        <a
          href="/"
          class="mt-6 inline-block rounded-lg bg-ink-950 px-8 py-3 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:bg-ink-800"
        >
          {{ t('detail.backHome') }}
        </a>
      </div>
    </div>

    <!-- Comic Detail -->
    <div v-if="comic">
      <!-- Dark gray section: Issue/Buy/Info + Comic Details -->
      <div class="bg-ink-900 text-white">
        <div class="mx-auto max-w-6xl px-8 py-16 md:px-16 md:py-24">
        <!-- Top Section: Series/Issue/Buy + Cover -->
        <div class="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <!-- Left: Series Logo, Issue, Buy Button -->
          <div class="flex flex-col items-center text-center">
            <!-- Series Logo -->
            <div v-if="series && series.logo" class="mb-6">
              <img
                :src="series.logo"
                :alt="t('detail.logoAlt', { name: series.name })"
                loading="lazy"
                class="h-40 w-auto object-contain drop-shadow-lg md:h-48"
              />
            </div>

            <!-- Issue + Rating Row -->
            <div class="flex items-center gap-4">
              <!-- Menubar Logo -->
              <img src="/images/logo-menubar.png" alt="Logo" class="h-16 w-auto object-contain md:h-20" />

              <!-- Issue Number -->
              <p class="font-display text-xl font-black uppercase text-white md:text-2xl">
                {{ t('detail.issue', { number: comic.issue }) }}
              </p>
            </div>

            <!-- Comic Info -->
              <div class="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-[11px] uppercase tracking-[0.15em] text-white/50 lg:justify-start">
              <span>{{ t('detail.author', { author: comic.author }) }}</span>
              <span>{{ t('detail.year', { year: comic.year }) }}</span>
              <span>{{ t('detail.pages', { pages: comic.pages || '—' }) }}</span>
            </div>

            <!-- Price -->
            <div v-if="comic.price" class="mt-4 w-full text-center">
              <div v-if="comic.discount" class="flex items-center justify-center gap-3">
                <p class="font-display text-2xl font-black text-red-500 line-through md:text-3xl">
                  ${{ comic.price }}
                </p>
                <span class="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600">-{{ comic.discount }}%</span>
              </div>
              <p class="font-display text-5xl font-black text-white md:text-6xl">
                ${{ discountedPrice }}
              </p>
            </div>

            <!-- Buy Button -->
            <button
              :disabled="!isAvailable"
              @click="buy"
              class="mt-8 flex w-full items-center justify-center gap-3 px-8 py-5 text-sm font-bold uppercase tracking-[0.25em] transition-all duration-300"
              :class="
                isAvailable
                  ? 'bg-white text-ink-950 hover:bg-ink-100 hover:shadow-lg hover:shadow-black/20'
                  : 'pointer-events-none cursor-not-allowed border border-white/20 text-white/40'
              "
            >
              <svg v-if="isAvailable && added" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
              </svg>
              <svg v-else viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
              </svg>
              {{ isAvailable ? (added ? t('detail.added') : t('detail.buy')) : tStatus(comic.status) }}
            </button>
          </div>

          <!-- Right: Comic Cover -->
          <div class="flex justify-center lg:justify-end">
            <div class="overflow-hidden shadow-2xl shadow-black/50">
              <img
                :src="comic.poster || '/images/no-image.webp'"
                :alt="t('cover.alt', { title: comic.title })"
                loading="lazy"
                class="w-96 object-cover md:w-[28rem]"
              />
            </div>
          </div>
        </div>

        <!-- Comic Details Section -->
        <section class="mt-16 border-t border-white/10 pt-16 md:mt-24">
          <h2 class="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">{{ t('detail.comicDetails') }}</h2>

          <div class="mt-6 flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
            <!-- Description -->
            <div v-if="displayDescription" class="flex-1">
              <div v-if="Array.isArray(displayDescription)" class="space-y-8">
                <div v-for="(block, index) in displayDescription" :key="index" class="flex flex-col gap-4 md:flex-row md:items-center">
                  <div class="relative w-full md:w-1/2 overflow-hidden border border-white/20 bg-white/5" :class="block.imagePosition === 'left' ? 'order-2' : 'order-1'">
                    <img v-if="block.image" :src="block.image" :alt="t('detail.blockAlt', { number: index + 1 })" :style="{ aspectRatio: block.aspectRatio || '16/9' }" class="w-full object-cover" />
                  </div>
                  <div class="w-full md:w-1/2" :class="block.imagePosition === 'left' ? 'order-1' : 'order-2'">
                    <div class="p-6 md:p-8">
                      <div v-if="block.text" class="text-lg leading-relaxed text-white/80 md:text-xl whitespace-pre-wrap">
                        {{ block.text }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="max-w-3xl text-lg leading-relaxed text-white/70 md:text-xl">
                {{ displayDescription }}
              </p>
            </div>

            <!-- Rating Circle -->
            <div v-if="comic.rating != null" class="flex flex-col items-center gap-2">
              <div class="relative h-32 w-32 md:h-40 md:w-40">
                <svg class="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" stroke-width="4" class="text-white/20" />
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
                  <span class="text-[10px] uppercase tracking-wider text-white/50">%</span>
                </div>
              </div>
              <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">{{ t('detail.rating') }}</span>
            </div>
          </div>
        </section>
        </div>
      </div>

        <!-- More from this series -->
        <section v-if="related.length" class="mx-auto max-w-6xl px-8 py-16 md:px-16 md:py-24">
          <h2 class="text-[10px] font-bold uppercase tracking-[0.4em] text-ink-950/50">{{ t('detail.moreFrom') }}</h2>
          <h3 class="font-display mt-2 text-3xl font-black uppercase tracking-tight text-ink-950">{{ comic.title }}</h3>

          <div class="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            <a v-for="r in related" :key="r.id" :href="`/comics/${r.slug}`" class="group block">
              <div class="overflow-hidden border border-ink-950/10 bg-white transition-all duration-300 group-hover:border-ink-950 group-hover:shadow-lg group-hover:shadow-ink-950/5">
                <img
                  :src="r.poster || '/images/no-image.webp'"
                  :alt="t('cover.alt', { title: r.title })"
                  loading="lazy"
                  class="aspect-[1920/2951] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <p class="mt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-ink-950/50">{{ r.year }}</p>
              <h4 class="font-display mt-1 text-sm font-black uppercase tracking-tight text-ink-950">{{ r.title }}</h4>
              <p class="mt-0.5 text-xs text-ink-950/40">{{ t('detail.issueShort', { number: r.issue }) }}</p>
            </a>
          </div>
        </section>


    </div>
  </div>
</template>
