<script setup>
// LOGO — usa el archivo /images/logo-menubar.png (ubicado en public/).
// La imagen ya incluye el texto ONOFRIETTI / COMICS.
defineProps({
  size: { type: String, default: 'md' }, // 'sm' | 'md' | 'lg'
})
</script>

<template>
  <a href="#inicio" class="group inline-flex items-center">
    <img
      src="/images/logo-menubar.png"
      alt="Onofrietti Comics"
      class="h-auto w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
      :class="size === 'lg' ? 'h-20' : size === 'sm' ? 'h-20' : 'h-14'"
    />
  </a>
</template>
