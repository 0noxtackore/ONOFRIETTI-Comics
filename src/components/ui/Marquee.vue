<script setup>
// Cinta en movimiento (marquee) con bucle continuo sin costuras.
defineProps({
  items: { type: Array, required: true },
  separator: { type: String, default: '//' },
  duration: { type: Number, default: 40 },
})
</script>

<template>
  <div class="relative overflow-hidden">
    <div class="marquee-track" :style="{ '--marquee-duration': `${duration}s` }">
      <!-- Copia visible -->
      <ul class="flex shrink-0 items-center">
        <li
          v-for="item in items"
          :key="item"
          class="flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-white/70 md:text-sm"
        >
          <span class="whitespace-nowrap px-6">{{ item }}</span>
          <span class="text-white/30" aria-hidden="true">{{ separator }}</span>
        </li>
      </ul>
      <!-- Copia duplicada para el bucle -->
      <ul class="flex shrink-0 items-center" aria-hidden="true">
        <li
          v-for="item in items"
          :key="`dup-${item}`"
          class="flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-white/70 md:text-sm"
        >
          <span class="whitespace-nowrap px-6">{{ item }}</span>
          <span class="text-white/30" aria-hidden="true">{{ separator }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
