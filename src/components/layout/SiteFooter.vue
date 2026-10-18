<script setup>
// Footer al estilo Rockstar Games:
// newsletter centrada + wordmark gigante + columnas de enlaces + barra legal.
import { ref, computed, onMounted } from 'vue'
import AppLogo from '../ui/AppLogo.vue'
import { fetchComics } from '../../services/comicsService'
import { useI18n } from '../../i18n'

const { t, locale, setLocale, availableLocales } = useI18n()

const newsletterEmail = ref('')
const subscribed = ref(false)

const currentYear = new Date().getFullYear()

function onSubscribe() {
  if (!newsletterEmail.value) return
  subscribed.value = true
}

const categories = ref([])
onMounted(async () => {
  const comics = await fetchComics()
  categories.value = [...new Set(comics.map((c) => c.title))]
})
const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com' },
  { label: 'X', href: 'https://x.com' },
  { label: 'YouTube', href: 'https://www.youtube.com' },
  { label: 'Instagram', href: 'https://www.instagram.com' },
  { label: 'TikTok', href: 'https://www.tiktok.com' },
]

const legal = computed(() => [
  t('footer.terms'),
  t('footer.privacy'),
  t('footer.cookie'),
  t('footer.accessibility'),
])
</script>

<template>
  <footer class="border-t border-white/10 bg-ink-950">
    <!-- Newsletter -->


    <!-- Columnas de enlaces -->
    <div class="mx-auto max-w-7xl px-5 py-14 md:px-8">
      <div class="grid gap-10 text-center sm:grid-cols-2 lg:grid-cols-3 md:text-left">
        <div>
          <h3 class="text-xs font-bold uppercase tracking-[0.3em] text-white">{{ t('footer.comics') }}</h3>
          <ul class="mt-5 space-y-3">
            <li v-for="category in categories" :key="category">
              <a href="#comics" class="text-sm text-white/50 transition-colors hover:text-white">{{ category }}</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-xs font-bold uppercase tracking-[0.3em] text-white">{{ t('footer.social') }}</h3>
          <ul class="mt-5 space-y-3">
            <li v-for="s in socials" :key="s.label">
              <a
                :href="s.href"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-white/50 transition-colors hover:text-white"
              >
                {{ s.label }}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-xs font-bold uppercase tracking-[0.3em] text-white">{{ t('footer.legal') }}</h3>
          <ul class="mt-5 space-y-3">
            <li v-for="l in legal" :key="l">
              <a href="#" class="text-sm text-white/50 transition-colors hover:text-white">{{ l }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Barra legal inferior -->
    <div class="border-t border-white/10">
      <div class="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-6 text-center md:flex-row md:justify-between md:px-8 md:text-left">
        <div class="flex items-center gap-4">
          <AppLogo size="sm" />
          <p class="text-xs text-white/40">{{ t('footer.rights', { year: currentYear }) }}</p>
        </div>
        <div class="flex items-center gap-3 text-xs text-white/60">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
          </svg>
          <!-- Selector de idioma -->
          <div class="flex items-center gap-2" role="group" :aria-label="t('footer.language')">
            <button
              v-for="l in availableLocales"
              :key="l"
              type="button"
              class="uppercase tracking-[0.2em] transition-colors"
              :class="locale === l ? 'font-bold text-white' : 'text-white/40 hover:text-white'"
              :aria-pressed="locale === l"
              @click="setLocale(l)"
            >
              {{ t(`lang.${l}`) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
