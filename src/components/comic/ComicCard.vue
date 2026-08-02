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
        class="relative block overflow-hidden border border-white/10 transition-colors duration-500 group-hover:border-white"
      >
      <div class="transition-transform duration-700 ease-out group-hover:scale-[1.04]">
        <ComicCover :comic="comic" :poster="comic.poster" />
      </div>
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
          ? 'bg-white text-black hover:bg-white/80'
          : 'pointer-events-none cursor-not-allowed border border-white/15 text-white/40'
      "
    >
      <span class="hidden sm:inline">{{ buyLabel }}</span>
      <span class="sm:hidden" aria-hidden="true">Buy</span>
      <span
        v-if="isAvailable"
        class="relative inline-block h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="absolute inset-0 h-4 w-4 transition-opacity duration-300 group-hover:opacity-0"
        >
          <path fill-rule="evenodd" d="M10.5 3.5a2.5 2.5 0 0 0-5 0V4h5zm1 0V4H15v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4h3.5v-.5a3.5 3.5 0 1 1 7 0M14 14V5H2v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1M8 7.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132"/>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="absolute inset-0 h-4 w-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <path d="M11.5 4v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4zM8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m0 6.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132"/>
        </svg>
      </span>
    </a>
  </article>
</template>
