<script setup>
// Footer al estilo Rockstar Games:
// newsletter centrada + wordmark gigante + columnas de enlaces + barra legal.
import { ref } from 'vue'
import AppLogo from '../ui/AppLogo.vue'
import { comics } from '../../data/comics'

const newsletterEmail = ref('')
const subscribed = ref(false)

const currentYear = new Date().getFullYear()

function onSubscribe() {
  if (!newsletterEmail.value) return
  subscribed.value = true
}

const comicLinks = comics.map((c) => c.title)
const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com' },
  { label: 'X', href: 'https://x.com' },
  { label: 'YouTube', href: 'https://www.youtube.com' },
  { label: 'Instagram', href: 'https://www.instagram.com' },
  { label: 'TikTok', href: 'https://www.tiktok.com' },
]

const legal = [
  'Términos de servicio',
  'Política de privacidad',
  'Política de cookies',
  'Accesibilidad',
]
</script>

<template>
  <footer class="border-t border-white/10 bg-ink-950">
    <!-- Newsletter -->
    <div class="border-b border-white/10">
      <div class="mx-auto max-w-7xl px-5 py-16 text-center md:px-8 md:py-20">
        <p class="text-xs font-bold uppercase tracking-[0.35em] text-white/50">Newsletter</p>
        <h2 class="font-display mt-4 text-3xl font-black uppercase leading-none tracking-tight text-white md:text-5xl">
          Suscríbete a la tinta
        </h2>
        <p class="mx-auto mt-4 max-w-md text-sm text-white/60 md:text-base">
          Entérate de cada lanzamiento, reimpresión y edición limitada antes que nadie.
          Sin spam. Solo tinta.
        </p>

        <form
          v-if="!subscribed"
          @submit.prevent="onSubscribe"
          class="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            v-model="newsletterEmail"
            type="email"
            required
            placeholder="tu@correo.com"
            class="w-full border border-white/20 bg-black/40 px-5 py-3.5 text-sm text-white transition-colors placeholder:text-white/30 focus:border-white focus:outline-none"
          />
          <button
            type="submit"
            class="shrink-0 bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors hover:bg-white/80"
          >
            Suscribirse
          </button>
        </form>

        <p v-else class="mx-auto mt-8 max-w-md border border-white/20 px-6 py-4 text-sm text-white/70">
          Listo. Bienvenido al lado de la tinta.
        </p>
      </div>
    </div>

    <!-- Wordmark gigante -->
    <div class="overflow-hidden border-b border-white/10 py-2">
      <p
        class="font-display whitespace-nowrap text-center text-[clamp(2.5rem,10vw,12rem)] font-black uppercase leading-none tracking-tight text-white/10 select-none"
      >
        Onofrietti
      </p>
    </div>

    <!-- Columnas de enlaces -->
    <div class="mx-auto max-w-7xl px-5 py-14 md:px-8">
      <div class="grid gap-10 text-center sm:grid-cols-2 lg:grid-cols-3 md:text-left">
        <div>
          <h3 class="text-xs font-bold uppercase tracking-[0.3em] text-white">Cómics</h3>
          <ul class="mt-5 space-y-3">
            <li v-for="title in comicLinks" :key="title">
              <a href="#comics" class="text-sm text-white/50 transition-colors hover:text-white">{{ title }}</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-xs font-bold uppercase tracking-[0.3em] text-white">Social</h3>
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
          <h3 class="text-xs font-bold uppercase tracking-[0.3em] text-white">Legal</h3>
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
          <p class="text-xs text-white/40">© {{ currentYear }} Onofrietti Comics. Todos los derechos reservados.</p>
        </div>
        <div class="flex items-center gap-2 text-xs text-white/60">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
          </svg>
          <span>Es</span>
        </div>
      </div>
    </div>
  </footer>
</template>
