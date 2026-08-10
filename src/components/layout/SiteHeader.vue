<script setup>
import { useScrollState } from '../../composables/useScrollState'
import { useMenu } from '../../composables/useMenu'
import { useCatalog } from '../../composables/useCatalog'
import AppLogo from '../ui/AppLogo.vue'

// El header pasa de transparente a negro sólido al hacer scroll.
const { isScrolled } = useScrollState(32)
const { isOpen, toggle } = useMenu()
const { query } = useCatalog()

// Si escribes desde el hero, baja suavemente hasta los resultados.
function ensureResultsVisible() {
  if (!query.value) return
  const el = document.getElementById('comics')
  if (!el) return
  const rect = el.getBoundingClientRect()
  if (rect.top > window.innerHeight) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-500"
    :class="isScrolled ? 'border-b border-white/10 bg-ink-950/90 backdrop-blur-md' : 'bg-transparent'"
  >
    <div class="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:h-20 md:px-8">
      <AppLogo size="sm" class="mx-auto md:mx-0" />

      <!-- Búsqueda central estilo DeviantArt -->
      <div class="hidden flex-1 md:block">
        <div class="relative mx-auto max-w-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
            aria-hidden="true"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <input
            v-model="query"
            type="search"
            placeholder="Search comics…"
            aria-label="Search comics"
            @input="ensureResultsVisible"
            class="w-full border border-white/15 bg-ink-950/60 py-2.5 pl-11 pr-10 text-sm text-white transition-colors duration-300 placeholder:text-white/40 focus:border-da-400 focus:outline-none"
          />
          <button
            v-if="query"
            type="button"
            @click="query = ''"
            aria-label="Clear search"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-4 w-4" aria-hidden="true">
              <path d="M8 6.586 2.707 1.293 1.293 2.707 6.586 8l-5.293 5.293 1.414 1.414L8 9.414l5.293 5.293 1.414-1.414L9.414 8l5.293-5.293-1.414-1.414z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Navegación de escritorio, a la derecha -->
      <nav class="hidden shrink-0 items-center gap-10 md:flex" aria-label="Main">
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
        :aria-label="isOpen ? 'Close menu' : 'Open menu'"
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
