<script setup>
// Tarjeta de cómic: portada con zoom + borde blanco al hover + botón de compra.
// El botón cambia según el estado: los disponibles llevan texto de venta.
import { computed } from 'vue'
import ComicCover from './ComicCover.vue'

const props = defineProps({
  comic: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

// Estados "comprables"
const isAvailable = computed(() => ['Disponible', 'Edición limitada'].includes(props.comic.status))

const buyLabel = computed(() => {
  switch (props.comic.status) {
    case 'Edición limitada':
      return 'Comprar ya'
    case 'Agotado':
      return 'Agotado'
    case 'Próximamente':
      return 'Próximamente'
    default:
      return 'Comprar ahora'
  }
})
</script>

<template>
  <article v-reveal="{ delay: (index % 3) * 90 }" class="group flex flex-col">
    <a
      :href="`#/comic/${comic.id}`"
      :aria-label="`Ver ficha de ${comic.title}`"
      class="relative block overflow-hidden border border-white/10 transition-colors duration-500 group-hover:border-white"
    >
      <div class="transition-transform duration-700 ease-out group-hover:scale-[1.04]">
        <ComicCover :comic="comic" :poster="comic.poster" />
      </div>
    </a>

    <div class="pt-5 text-center">
      <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
        {{ comic.issue }} — {{ comic.year }}
      </p>
      <h3 class="font-display mt-1 text-lg font-black uppercase leading-tight tracking-tight text-white sm:text-xl">
        {{ comic.title }}
      </h3>
      <p class="mt-1 text-sm text-white/50">{{ comic.subtitle }}</p>
    </div>

    <!-- Botón de compra. TODO: apuntar al futuro checkout / tienda. -->
    <a
      :href="isAvailable ? '#comics' : undefined"
      :aria-disabled="!isAvailable"
      class="mt-5 inline-flex w-full items-center justify-center gap-2 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 sm:gap-3 sm:px-6 sm:py-3.5 sm:text-xs sm:tracking-[0.25em]"
      :class="
        isAvailable
          ? 'bg-white text-black hover:bg-white/80'
          : 'pointer-events-none cursor-not-allowed border border-white/15 text-white/40'
      "
    >
      <span class="hidden sm:inline">{{ buyLabel }}</span>
      <span class="sm:hidden" aria-hidden="true">Comprar</span>
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
