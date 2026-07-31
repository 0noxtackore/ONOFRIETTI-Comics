<script setup>
// LOGO — usa el archivo /images/logo.png (ubicado en public/).
// Muestra la imagen junto a la palabra ONOFRIETTI / COMICS.
// Si más adelante cambia el logo, basta con reemplazar ese archivo.
defineProps({
  tone: { type: String, default: 'white' }, // 'white' | 'black'
  size: { type: String, default: 'md' }, // 'sm' | 'md' | 'lg'
})
</script>

<template>
  <a href="#inicio" class="group inline-flex items-center gap-3">
    <img
      src="/images/logo.png"
      alt="Onofrietti Comics"
      class="h-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
      :class="size === 'lg' ? 'w-24' : size === 'sm' ? 'w-14' : 'w-20'"
    />

    <!-- Palabra junto al logo -->
    <span class="flex flex-col leading-none">
      <span
        class="font-display font-black uppercase tracking-tight transition-colors duration-300"
        :class="[size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg', tone === 'white' ? 'text-white group-hover:text-white/60' : 'text-black group-hover:text-black/60']"
      >
        Onofrietti
      </span>
      <span
        class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.5em] transition-colors duration-300"
        :class="tone === 'white' ? 'text-white/50' : 'text-black/50'"
      >
        Comics
      </span>
    </span>
  </a>
</template>
