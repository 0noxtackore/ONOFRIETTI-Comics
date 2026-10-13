<script setup>
// Hero a pantalla completa del home (rediseño Stitch).
// Fondo de arte generativo + titular display Space Grotesk + CTAs + ticker.
import { computed } from 'vue'
import MonoPoster from '../ui/MonoPoster.vue'
import Marquee from '../ui/Marquee.vue'
import { comics } from '../../data/comics'
import { formatIssue } from '../../utils/format'

const featured = comics.find((c) => c.featured) || comics[0]

const meta = computed(() =>
  featured
    ? [formatIssue(featured.issue), featured.year, `${featured.pages} pages`, featured.author]
    : []
)

const tickerItems = [
  'New issues every month',
  '100% hand-drawn',
  'The Origin available now',
  'No superheroes. Just stories',
  'Founded in 1998',
  'Made in ink',
]
</script>

<template>
  <section id="inicio" class="relative flex min-h-screen flex-col overflow-hidden">
    <!-- Fondo de arte generativo -->
    <div class="absolute inset-0">
      <div class="animate-slow-zoom absolute inset-0">
        <MonoPoster variant="burst" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-stitch-bg via-stitch-bg/20 to-stitch-bg/90"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-stitch-bg/95 via-stitch-bg/30 to-stitch-bg/60"></div>
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0)_0%,rgba(8,8,10,0.9)_100%)]"></div>
    </div>

    <div class="section-shell relative z-10 flex flex-1 flex-col justify-center pb-24 pt-32 md:pt-40">
      <div class="max-w-3xl">
        <p class="rise-in kicker mb-6 flex items-center gap-3 text-stitch-muted" style="animation-delay: 80ms">
          <span class="inline-block h-px w-12 bg-marvel-500"></span>
          Onofrietti Comics · Independent studio
        </p>

        <h1 class="font-display text-display-lg font-bold text-white drop-shadow-[0_40px_120px_rgba(0,0,0,0.85)]">
          <span class="rise-in block" style="animation-delay: 180ms">Stories</span>
          <span class="rise-in block text-outline" style="animation-delay: 280ms">drawn in ink</span>
        </h1>

        <p class="rise-in editorial-text mt-8 max-w-xl text-base text-white/70 md:text-lg" style="animation-delay: 400ms">
          An independent comics studio. Every page is drawn by hand, one panel at a
          time — no rush, no formula. Just stories that leave a mark.
        </p>

        <ul
          class="rise-in mt-8 flex flex-wrap gap-x-2 gap-y-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/50"
          style="animation-delay: 500ms"
        >
          <li v-for="(m, i) in meta" :key="m" class="flex items-center gap-x-4">
            <span>{{ m }}</span>
            <span v-if="i < meta.length - 1" class="text-white/20" aria-hidden="true">//</span>
          </li>
        </ul>

        <div class="rise-in mt-10 flex flex-wrap items-center gap-4" style="animation-delay: 600ms">
          <a
            href="#comics"
            class="group inline-flex items-center gap-3 bg-marvel-500 px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white shadow-[0_8px_40px_-20px_rgba(230,36,41,0.9)] transition-all duration-300 hover:bg-marvel-600 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Explore the catalog
            <span class="transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true">→</span>
          </a>
          <a
            href="#editorial"
            class="inline-flex items-center gap-3 border border-white/30 bg-black/40 px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
          >
            Read the spotlight
          </a>
        </div>
      </div>
    </div>

    <div class="relative z-10 border-t border-white/10 bg-black/60 py-4 backdrop-blur-sm">
      <Marquee :items="tickerItems" :duration="36" />
    </div>
  </section>
</template>
