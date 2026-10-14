<script setup>
defineProps({
  kicker: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  align: { type: String, default: 'left' },
})
</script>

<template>
  <div v-reveal class="max-w-3xl" :class="align === 'center' ? 'mx-auto text-center' : ''">
    <div v-if="kicker" class="mb-4 flex items-center gap-3" :class="align === 'center' ? 'justify-center' : ''">
      <span class="h-px w-10 bg-ink-950"></span>
      <p class="text-xs font-bold uppercase tracking-[0.35em] text-ink-950/60">{{ kicker }}</p>
    </div>

    <h2 v-if="title" class="font-display text-3xl font-black uppercase leading-[0.95] tracking-tight text-ink-950 sm:text-5xl md:text-6xl">
      <slot name="title">{{ title }}</slot>
    </h2>

    <p v-if="description" class="mt-6 text-base leading-relaxed text-ink-950/60 md:text-lg">
      {{ description }}
    </p>
  </div>
</template>
