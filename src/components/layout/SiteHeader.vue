<script setup>
import { computed } from 'vue'
import { useScrollState } from '../../composables/useScrollState'
import { useMenu } from '../../composables/useMenu'
import { useI18n } from '../../i18n'
import AppLogo from '../ui/AppLogo.vue'

// El header pasa de transparente a negro sólido al hacer scroll.
const { isScrolled } = useScrollState(32)
const { isOpen, toggle } = useMenu()
const { t } = useI18n()

const navLinks = computed(() => [
  { href: '#hero', label: t('nav.home') },
  { href: '#comics', label: t('nav.comics') },
  { href: '#about', label: t('nav.about') },
])
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-500"
    :class="isScrolled ? 'border-b border-white/10 bg-ink-950/90 backdrop-blur-md' : 'bg-ink-950'"
  >
    <div class="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:h-20 md:px-8">
      <AppLogo size="sm" class="mx-auto" />

      <!-- Navegación de escritorio, a la derecha -->
      <nav class="hidden shrink-0 items-center gap-10 md:flex" :aria-label="t('nav.main')">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          class="link-line text-xs font-semibold uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-white"
        >
          {{ link.label }}
        </a>
      </nav>

      <button
        type="button"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-controls="isOpen ? 'site-menu' : undefined"
        aria-haspopup="dialog"
        :aria-label="isOpen ? t('menu.close') : t('menu.open')"
        @click="toggle"
        class="absolute right-5 inline-flex h-11 w-11 flex-col items-center justify-center gap-1.5 border border-white/20 transition-colors hover:border-white md:hidden"
      >
        <span
          class="h-px w-5 bg-white transition-transform duration-300"
          :class="isOpen ? 'translate-y-[3.5px] rotate-45' : ''"
        ></span>
        <span
          class="h-px w-5 bg-white transition-transform duration-300"
          :class="isOpen ? '-translate-y-[3.5px] -rotate-45' : ''"
        ></span>
      </button>
    </div>
  </header>
</template>
