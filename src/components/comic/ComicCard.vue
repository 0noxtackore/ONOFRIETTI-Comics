<script setup>
// Tarjeta de cómic: portada con zoom + borde blanco al hover + botón de compra.
// El botón cambia según el estado: los disponibles llevan texto de venta.
import { computed } from 'vue'
import ComicCover from './ComicCover.vue'

const props = defineProps({
  comic: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

// Buyable statuses
const isAvailable = computed(() => ['Available', 'Limited Edition'].includes(props.comic.status))

const buyLabel = computed(() => {
  switch (props.comic.status) {
    case 'Limited Edition':
      return 'Buy now'
    case 'Sold Out':
      return 'Sold out'
    case 'Coming Soon':
      return 'Coming soon'
    default:
      return 'Buy now'
  }
})

// Ajusta el tamaño del título según su longitud: títulos largos, fuente menor.
const titleFontSize = computed(() => {
  const len = props.comic.title.length
  if (len >= 30) return '0.75rem'
  if (len >= 24) return '0.85rem'
  if (len >= 18) return '0.95rem'
  return '1.05rem'
})
</script>

<template>
  <article v-reveal="{ delay: (index % 3) * 90 }" class="group flex flex-col">
    <a
      :href="`/comics/${comic.slug}`"
      :aria-label="`View ${comic.title} details`"
      class="group/cover relative block overflow-hidden border border-white/10 transition-colors duration-500 group-hover:border-white/60"
    >
      <div class="transition-transform duration-700 ease-out group-hover:scale-[1.04]">
        <ComicCover :comic="comic" :poster="comic.poster" />
      </div>

      <!-- Overlay suave al hover de la imagen -->
      <span
        class="pointer-events-none absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover/cover:opacity-[0.08]"
        aria-hidden="true"
      ></span>
    </a>

    <div class="flex flex-1 flex-col justify-center pt-5 text-center">
      <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
        {{ comic.year }}
      </p>
      <div class="mt-1 flex min-h-[2.5em] items-center justify-center">
        <h3 class="font-display line-clamp-2 font-black uppercase leading-tight tracking-tight text-white"
          :style="{ fontSize: titleFontSize }">
          {{ comic.title }}
        </h3>
      </div>
      <p class="mt-1 text-sm text-white/50">Issue {{ comic.issue }}</p>
    </div>

    <!-- Botón de compra. TODO: apuntar al futuro checkout / tienda. -->
    <a
      :href="isAvailable ? '#comics' : undefined"
      :aria-disabled="!isAvailable"
      class="mt-auto inline-flex w-full items-center justify-center gap-2 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 sm:gap-3 sm:px-6 sm:py-3.5 sm:text-xs sm:tracking-[0.25em]"
      :class="
        isAvailable
          ? 'bg-white text-black hover:bg-ink-200 group-hover:bg-ink-200'
          : 'pointer-events-none cursor-not-allowed border border-white/15 text-white/40'
      "
    >
      <span class="hidden sm:inline">{{ buyLabel }}</span>
      <span class="sm:hidden" aria-hidden="true">Buy</span>
      <span
        v-if="isAvailable"
        class="inline-block h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="block h-full w-full"
        >
          <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
        </svg>
      </span>
    </a>
  </article>
</template>
