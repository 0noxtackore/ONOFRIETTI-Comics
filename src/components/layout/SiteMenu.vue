<script setup>
// Menú overlay a pantalla completa, estilo "lanzamiento AAA".
import { useMenu } from '../../composables/useMenu'

const { isOpen, close } = useMenu()

const links = [
  { label: 'Home', href: '#inicio', index: '01' },
  { label: 'Comics', href: '#comics', index: '02' },
]

const socials = ['Instagram', 'X', 'YouTube', 'TikTok']
</script>

<template>
  <Transition name="menu">
    <div
      v-if="isOpen"
      id="site-menu"
      class="fixed inset-0 z-40 flex flex-col bg-ink-950"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <div class="flex flex-1 flex-col justify-between px-5 pb-8 pt-28 md:px-8 md:pt-36">
        <nav aria-label="Menu">
          <ul class="flex flex-col">
            <li v-for="(link, i) in links" :key="link.href">
              <a
                :href="link.href"
                @click="close"
                class="menu-link group flex items-baseline gap-4 border-t border-white/10 py-4 md:gap-6 md:py-5"
                :style="{ transitionDelay: isOpen ? `${200 + i * 60}ms` : '0ms' }"
              >
                <span class="text-xs font-semibold tracking-[0.3em] text-white/40 md:text-sm">
                  {{ link.index }}
                </span>
                <span
                  class="font-display text-4xl font-black uppercase leading-none tracking-tight text-white transition-colors duration-300 group-hover:text-white/50 md:text-6xl"
                >
                  {{ link.label }}
                </span>
                <span
                  class="ml-auto text-white/40 transition-transform duration-300 group-hover:translate-x-2"
                  aria-hidden="true"
                >
                  →
                </span>
              </a>
            </li>
          </ul>
        </nav>

        <div class="flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p class="text-xs uppercase tracking-[0.25em] text-white/50">Founded in 1998 · Ink and coffee</p>
          <div class="flex gap-6">
            <a
              v-for="s in socials"
              :key="s"
              href="#"
              class="link-line text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white"
            >
              {{ s }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Fade del overlay */
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.4s ease;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}

/* Entrada escalonada de los enlaces */
.menu-link {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.menu-enter-active .menu-link {
  opacity: 1;
  transform: none;
}
.menu-leave-active .menu-link {
  opacity: 0;
  transform: translateY(14px);
}
</style>
