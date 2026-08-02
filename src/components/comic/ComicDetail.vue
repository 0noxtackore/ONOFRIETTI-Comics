<script setup>
// Ficha de detalle del cómic (se abre en /comic/<id>).
// Muestra la portada grande, descripción, metadatos, el código de producto
// y un botón para copiar el enlace directo de la ficha.
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { fetchComicById, fetchComics } from '../../services/comicsService'
import { formatIssue } from '../../utils/format'

const props = defineProps({
  comicId: { type: String, required: true },
})
const emit = defineEmits(['close'])

const comic = ref(null)
const loading = ref(true)
const copied = ref(false)
const added = ref(false)
const related = ref([])

const isAvailable = computed(() => ['Disponible', 'Edición limitada'].includes(comic.value?.status))

async function load() {
  loading.value = true
  added.value = false
  comic.value = await fetchComicById(props.comicId)
  related.value = []
  if (comic.value) {
    // Cómics de la misma categoría (la categoría = título del cómic).
    const list = await fetchComics()
    related.value = list.filter(
      (c) => c.title === comic.value.title && c.id !== comic.value.id
    )
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
  return window.location.origin + window.location.pathname.replace(/\/comic\/.*$/, '') + '/comic/' + props.comicId
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
    // Clipboard no disponible: no pasa nada.
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
  load()
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})

watch(() => props.comicId, load)
</script>

<template>
  <div class="fixed inset-0 z-[90] overflow-y-auto bg-black/95 backdrop-blur-sm" @click.self="emit('close')">
    <div class="mx-auto flex min-h-full max-w-5xl items-center justify-center p-4 md:p-8">
      <!-- Cargando -->
      <div v-if="loading" class="w-full animate-pulse border border-white/10">
        <div class="grid md:grid-cols-[320px_1fr]">
          <div class="aspect-[1920/2951] bg-ink-800"></div>
          <div class="space-y-4 p-8">
            <div class="h-3 w-24 bg-ink-800"></div>
            <div class="h-10 w-3/4 bg-ink-700"></div>
            <div class="h-4 w-1/2 bg-ink-800"></div>
            <div class="h-24 w-full bg-ink-800"></div>
          </div>
        </div>
      </div>

      <!-- No encontrado -->
      <div v-else-if="!comic" class="w-full max-w-md border border-white/15 p-10 text-center">
        <p class="text-sm uppercase tracking-[0.25em] text-white/50">Cómic no encontrado</p>
        <button
          @click="emit('close')"
          class="mt-6 bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors duration-300 hover:bg-white/80"
        >
          Volver
        </button>
      </div>

      <!-- Ficha del cómic -->
      <div v-else class="relative w-full border border-white/15 bg-black">
        <button
          @click="emit('close')"
          aria-label="Cerrar ficha"
          class="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-white/20 text-white transition-colors duration-300 hover:border-white"
        >
          ×
        </button>

        <div class="grid md:grid-cols-[minmax(280px,380px)_1fr]">
          <!-- Portada -->
          <div class="relative overflow-hidden border-b border-white/15 md:border-b-0 md:border-r">
            <img
              :src="comic.poster || '/images/no-image.webp'"
              :alt="`Portada de ${comic.title}`"
              class="aspect-[1920/2951] w-full object-cover"
            />
          </div>

          <!-- Información -->
          <div class="flex flex-col p-6 md:p-10">
            <p class="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">
              {{ formatIssue(comic.issue) }} — {{ comic.year }}
            </p>
            <h2 class="font-display mt-2 text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-4xl">
              {{ comic.title }}
            </h2>
            <p class="mt-2 text-base font-semibold uppercase tracking-[0.2em] text-white/60">{{ comic.subtitle }}</p>

            <!-- Metadatos -->
            <dl class="mt-8 grid grid-cols-3 gap-px border border-white/15 bg-white/15">
              <div class="bg-black p-3 md:p-4">
                <dt class="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Páginas</dt>
                <dd class="font-display mt-1 text-lg font-black text-white">{{ comic.pages || '—' }}</dd>
              </div>
              <div class="bg-black p-3 md:p-4">
                <dt class="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Año</dt>
                <dd class="font-display mt-1 text-lg font-black text-white">{{ comic.year || '—' }}</dd>
              </div>
              <div class="bg-black p-3 md:p-4">
                <dt class="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Autor</dt>
                <dd class="font-display mt-1 min-w-0 break-words text-lg font-black text-white">{{ comic.author }}</dd>
              </div>
            </dl>

            <!-- Compartir -->
            <div class="mt-6 border border-white/15 p-4">
              <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Compartir</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <a
                  :href="shareUrl('whatsapp')"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-2 border border-white/20 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:border-white"
                >
                  <svg viewBox="0 0 448 512" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  :href="shareUrl('x')"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-2 border border-white/20 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:border-white"
                >
                  <svg viewBox="0 0 448 512" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
                  </svg>
                  X
                </a>
                <a
                  :href="shareUrl('facebook')"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-2 border border-white/20 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:border-white"
                >
                  <svg viewBox="0 0 448 512" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                  </svg>
                  Facebook
                </a>
                <a
                  :href="shareUrl('reddit')"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-2 border border-white/20 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:border-white"
                >
                  <svg viewBox="0 0 30 30" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M 17.662109 2 C 15.565005 2 14 3.7131367 14 5.6621094 L 14 9.0351562 C 11.24971 9.1810926 8.7344872 9.9143634 6.7265625 11.064453 C 5.9527826 10.321405 4.9166871 9.991448 3.9121094 9.9921875 C 2.8229214 9.9929893 1.7094525 10.370413 0.94140625 11.234375 L 0.92382812 11.253906 L 0.90625 11.273438 C 0.16947928 12.194228 -0.12225605 13.427747 0.07421875 14.652344 C 0.25365009 15.770711 0.90137168 16.893419 2.0273438 17.628906 C 2.0199689 17.753058 2 17.874618 2 18 C 2 22.962 7.832 27 15 27 C 22.168 27 28 22.962 28 18 C 28 17.874618 27.980031 17.753058 27.972656 17.628906 C 29.098628 16.893419 29.74635 15.770711 29.925781 14.652344 C 30.122256 13.427747 29.830521 12.194228 29.09375 11.273438 L 29.076172 11.253906 L 29.058594 11.234375 C 28.290448 10.370294 27.177168 9.9929893 26.087891 9.9921875 C 25.08323 9.991448 24.046988 10.321133 23.273438 11.064453 C 21.265513 9.9143634 18.75029 9.1810926 16 9.0351562 L 16 5.6621094 C 16 4.6830821 16.565214 4 17.662109 4 C 18.182797 4 18.817104 4.2609042 19.810547 4.609375 C 20.650361 4.9039572 21.743308 5.2016984 23.140625 5.2910156 C 23.474875 6.2790874 24.402814 7 25.5 7 C 26.875 7 28 5.875 28 4.5 C 28 3.125 26.875 2 25.5 2 C 24.561213 2 23.747538 2.5304211 23.320312 3.3007812 C 22.125831 3.2346294 21.248238 2.9947078 20.472656 2.7226562 C 19.568849 2.4056271 18.738422 2 17.662109 2 z M 3.9121094 11.992188 C 4.3072494 11.991896 4.6826692 12.095595 4.9921875 12.263672 C 3.8881963 13.18517 3.0505713 14.261821 2.5449219 15.4375 C 2.2764358 15.106087 2.114647 14.734002 2.0507812 14.335938 C 1.9430146 13.664243 2.1440212 12.966045 2.4628906 12.552734 C 2.7642172 12.228395 3.3144613 11.992626 3.9121094 11.992188 z M 26.085938 11.992188 C 26.683756 11.992627 27.235874 12.22849 27.537109 12.552734 C 27.855979 12.966045 28.056985 13.664243 27.949219 14.335938 C 27.885353 14.734002 27.723564 15.106087 27.455078 15.4375 C 26.949429 14.261821 26.111804 13.18517 25.007812 12.263672 C 25.316626 12.095792 25.690955 11.991896 26.085938 11.992188 z M 10 14 C 11.105 14 12 14.895 12 16 C 12 17.105 11.105 18 10 18 C 8.895 18 8 17.105 8 16 C 8 14.895 8.895 14 10 14 z M 20 14 C 21.105 14 22 14.895 22 16 C 22 17.105 21.105 18 20 18 C 18.895 18 18 17.105 18 16 C 18 14.895 18.895 14 20 14 z M 20.238281 19.533203 C 19.599281 21.400203 17.556 23 15 23 C 12.444 23 10.400719 21.400969 9.7617188 19.667969 C 10.911719 20.600969 12.828 21.267578 15 21.267578 C 17.172 21.267578 19.088281 20.600203 20.238281 19.533203 z"/>
                  </svg>
                  Reddit
                </a>
                <button
                  @click="copyLink"
                  class="inline-flex items-center gap-2 border border-white/20 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:border-white"
                >
                  <svg v-if="!copied" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
                  </svg>
                  <svg v-else viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
                  </svg>
                  {{ copied ? 'Copiado' : 'Copiar enlace' }}
                </button>
              </div>
            </div>

            <!-- Compra -->
            <a
              :href="isAvailable ? '#comics' : undefined"
              :aria-disabled="!isAvailable"
              @click="buy"
              class="mt-8 flex w-full items-center justify-center gap-3 px-6 py-4 text-xs font-bold uppercase tracking-[0.25em] transition-colors duration-300 sm:inline-flex sm:w-auto"
              :class="
                isAvailable
                  ? 'bg-white text-black hover:bg-white/80'
                  : 'pointer-events-none cursor-not-allowed border border-white/15 text-white/40'
              "
            >
              <svg v-if="isAvailable && added" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-1.646-7.646-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708"/>
              </svg>
              <svg v-else viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
              </svg>
              {{ isAvailable ? 'Comprar' : comic.status }}
            </a>
          </div>
        </div>

        <!-- Cómics de la misma categoría (la categoría es el título) -->
        <div v-if="related.length" class="border-t border-white/15 px-6 py-8 md:px-10">
          <p class="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">Más de la categoría</p>
          <h3 class="font-display mt-1 text-2xl font-black uppercase tracking-tight text-white">{{ comic.title }}</h3>
          <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            <a v-for="r in related" :key="r.id" :href="`/comic/${r.id}`" class="group block">
              <div class="overflow-hidden border border-white/10 transition-colors duration-300 group-hover:border-white">
                <img
                  :src="r.poster || '/images/no-image.webp'"
                  :alt="`Portada de ${r.title}`"
                  class="aspect-[1920/2951] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <p class="mt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">{{ formatIssue(r.issue) }} — {{ r.year }}</p>
              <h4 class="font-display mt-1 text-sm font-black uppercase tracking-tight text-white">{{ r.title }}</h4>
            </a>
          </div>
        </div>

        <!-- Descripción -->
        <p
          v-if="comic.description"
          class="border-t border-white/15 px-6 py-8 text-sm leading-relaxed text-white/70 md:px-10"
        >
          {{ comic.description }}
        </p>
      </div>
    </div>
  </div>
</template>
