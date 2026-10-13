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
      <span class="h-px w-10 bg-white"></span>
      <p class="text-xs font-bold uppercase tracking-[0.35em] text-white/60">{{ kicker }}</p>
    </div>

    <h2 class="font-display text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl md:text-6xl">
      <slot name="title">{{ title }}</slot>
    </h2>

    <p v-if="description" class="mt-6 text-base leading-relaxed text-white/60 md:text-lg">
      {{ description }}
    </p>
  </div>
</template>
