<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useScrollState } from '../../composables/useScrollState'
import { useMenu } from '../../composables/useMenu'
import AppLogo from '../ui/AppLogo.vue'
import { fetchComics } from '../../services/comicsService'
import { navigate } from '../../utils/router'

const { isScrolled } = useScrollState(32)
const { isOpen, toggle } = useMenu()

const searchQuery = ref('')
const searchResults = ref([])
const isSearchOpen = ref(false)
const comics = ref([])

const filteredComics = computed(() => {
  if (!searchQuery.value.trim()) return []
  const q = searchQuery.value.toLowerCase()
  return comics.value
    .filter(c => 
      c.title.toLowerCase().includes(q) ||
      c.author?.toLowerCase().includes(q) ||
      c.protagonist?.toLowerCase().includes(q)
    )
    .slice(0, 6)
})

async function loadComics() {
  comics.value = await fetchComics()
}

function openSearch() {
  isSearchOpen.value = true
}

function closeSearch() {
  isSearchOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
}

function selectComic(slug) {
  closeSearch()
  navigate(`/comics/${slug}`)
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    closeSearch()
  }
}

onMounted(() => {
  loadComics()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-500"
    :class="isScrolled ? 'border-b border-white/10 bg-ink-950/90 backdrop-blur-md' : 'bg-transparent'"
  >
    <div class="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:h-20 md:px-8">
      <AppLogo size="sm" class="mx-auto md:mx-0" />

      <!-- Search Bar (Desktop) -->
      <div class="hidden flex-1 items-center justify-center md:flex">
        <div class="relative w-full max-w-md">
          <input
            v-model="searchQuery"
            @focus="openSearch"
            type="text"
            placeholder="Search comics..."
            class="w-full rounded-full border border-white/20 bg-white/5 px-5 py-2.5 pl-10 text-sm text-white placeholder-ink-400 transition-all duration-300 focus:border-white/50 focus:bg-white/10 focus:outline-none"
          />
          <svg
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <!-- Search Results Dropdown -->
          <div
            v-if="isSearchOpen && searchQuery.trim() && filteredComics.length > 0"
            class="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-ink-950 shadow-2xl shadow-black/50"
          >
            <a
              v-for="comic in filteredComics"
              :key="comic.id"
              @click.prevent="selectComic(comic.slug)"
              href="#"
              class="flex items-center gap-4 border-b border-white/5 p-3 transition-colors duration-200 hover:bg-white/5 last:border-b-0"
            >
              <img
                :src="comic.poster || '/images/no-image.webp'"
                :alt="comic.title"
                class="h-12 w-9 rounded object-cover"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-white">{{ comic.title }}</p>
                <p class="text-xs text-ink-400">Issue {{ comic.issue }} · {{ comic.year }}</p>
              </div>
              <span
                class="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                :class="
                  comic.status === 'Available'
                    ? 'bg-green-500/20 text-green-400'
                    : comic.status === 'Limited Edition'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-ink-700 text-ink-300'
                "
              >
                {{ comic.status }}
              </span>
            </a>
          </div>

          <!-- No Results -->
          <div
            v-else-if="isSearchOpen && searchQuery.trim() && filteredComics.length === 0"
            class="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-white/10 bg-ink-950 p-4 text-center shadow-2xl shadow-black/50"
          >
            <p class="text-sm text-ink-400">No comics found</p>
          </div>
        </div>
      </div>

      <!-- Navegación de escritorio -->
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

      <!-- Mobile Search Button -->
      <button
        @click="openSearch"
        class="flex h-11 w-11 items-center justify-center border border-white/20 transition-colors hover:border-white md:hidden"
        aria-label="Search comics"
      >
        <svg
          class="h-5 w-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <!-- Mobile Menu Button -->
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

    <!-- Mobile Search Overlay -->
    <div
      v-if="isSearchOpen"
      class="fixed inset-0 z-40 bg-black/90 backdrop-blur-sm md:hidden"
      @click="closeSearch"
    >
      <div class="mx-auto max-w-md p-4" @click.stop>
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search comics..."
            autofocus
            class="w-full rounded-full border border-white/20 bg-ink-950 px-5 py-3 pl-10 text-sm text-white placeholder-ink-400 focus:border-white/50 focus:outline-none"
          />
          <svg
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button
            @click="closeSearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-white"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Mobile Results -->
        <div v-if="filteredComics.length > 0" class="mt-4 space-y-2">
          <a
            v-for="comic in filteredComics"
            :key="comic.id"
            @click.prevent="selectComic(comic.slug)"
            href="#"
            class="flex items-center gap-4 rounded-xl border border-white/10 bg-ink-950 p-3 transition-colors duration-200 hover:bg-white/5"
          >
            <img
              :src="comic.poster || '/images/no-image.webp'"
              :alt="comic.title"
              class="h-14 w-10 rounded object-cover"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-white">{{ comic.title }}</p>
              <p class="text-xs text-ink-400">Issue {{ comic.issue }} · {{ comic.year }}</p>
            </div>
          </a>
        </div>

        <div v-else-if="searchQuery.trim()" class="mt-8 text-center">
          <p class="text-sm text-ink-400">No comics found</p>
        </div>
      </div>
    </div>
  </header>
</template>
