<script setup>
// Tarjeta de cómic: portada con zoom + borde blanco al hover + botón de compra.
// El botón cambia según el estado: los disponibles llevan texto de venta.
import { computed } from 'vue'
import ComicCover from './ComicCover.vue'
import { useI18n } from '../../i18n'

const props = defineProps({
  comic: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

const { t } = useI18n()

// Buyable statuses
const isAvailable = computed(() => ['Available', 'Limited Edition'].includes(props.comic.status))

// Cómics nuevos: creados en la última semana
const isNew = computed(() => {
  if (!props.comic.createdAt) return false
  const created = new Date(props.comic.createdAt)
  const now = new Date()
  const diffMs = now - created
  const diffWeeks = diffMs / (1000 * 60 * 60 * 24 * 7)
  return diffWeeks <= 1
})

const buyLabel = computed(() => {
  switch (props.comic.status) {
    case 'Limited Edition':
      return t('card.buyNow')
    case 'Sold Out':
      return t('card.soldOut')
    case 'Coming Soon':
      return t('card.comingSoon')
    default:
      return t('card.buyNow')
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
      :aria-label="t('card.viewDetails', { title: comic.title })"
      class="group/cover relative block overflow-hidden transition-colors duration-500"
    >
      <div class="transition-transform duration-700 ease-out group-hover:scale-[1.04]">
        <ComicCover :comic="comic" :poster="comic.poster" />
      </div>

      <span
        class="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.25)_45%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.25)_55%,transparent_60%)] transition-transform duration-700 ease-out group-hover/cover:translate-x-full"
        aria-hidden="true"
      ></span>

      <span
        class="diagonal-stripes pointer-events-none absolute inset-0 opacity-0"
        aria-hidden="true"
      ></span>

      <img
        v-if="isNew"
        src="/images/new-icon.png"
        :alt="t('card.isNew')"
        loading="lazy"
        class="pointer-events-none absolute right-2 top-2 z-10 h-20 w-20 drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
      />
    </a>

    <div class="flex flex-1 flex-col justify-start pt-3">
      <h3 class="font-condensed text-[0.875rem] font-bold uppercase leading-tight text-[#202020] line-clamp-2 group-hover:text-[#e62429]">
        {{ comic.title }}
      </h3>
      <p class="mt-1 text-[0.75rem] uppercase text-[#4c5067]">({{ comic.year }}) #{{ comic.issue }}</p>
    </div>
  </article>
</template>
