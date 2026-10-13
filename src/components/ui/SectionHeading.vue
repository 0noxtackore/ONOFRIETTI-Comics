<script setup>
// Encabezado de sección reutilizable: kicker + título display + descripción.
defineProps({
  kicker: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  align: { type: String, default: 'left' }, // 'left' | 'center'
})
</script>

<template>
  <div v-reveal class="max-w-3xl" :class="align === 'center' ? 'mx-auto text-center' : ''">
    <div class="mb-4 flex items-center gap-3" :class="align === 'center' ? 'justify-center' : ''">
      <span class="h-px w-10 bg-marvel-500"></span>
      <p class="text-xs font-bold uppercase tracking-[0.45em] text-marvel-400">{{ kicker }}</p>
    </div>

    <h2
      class="font-display text-3xl font-black uppercase leading-[0.9] tracking-[-0.02em] text-white drop-shadow-[0_20px_80px_rgba(0,0,0,0.6)] sm:text-5xl md:text-6xl lg:text-7xl"
    >
      <slot name="title">{{ title }}</slot>
    </h2>

    <p v-if="description" class="editorial-text mt-6 max-w-2xl text-base text-white/80 md:text-lg">
      {{ description }}
    </p>
  </div>
</template>
