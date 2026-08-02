<script setup>
// Portada de cómic.
// Por defecto muestra /images/no-image.webp hasta que la base de datos
// tenga portadas reales. Cuando existan, pasa la prop "poster" (URL o import)
// y el componente mostrará esa imagen en su lugar.
defineProps({
  comic: { type: Object, required: true },
  poster: { type: String, default: '' },
})
</script>

<template>
  <div class="relative aspect-[1920/2951] overflow-hidden bg-ink-900">
    <img
      :src="poster || '/images/no-image.webp'"
      :alt="`Cover of ${comic.title}`"
      class="absolute inset-0 h-full w-full object-cover"
    />
  </div>
</template>
