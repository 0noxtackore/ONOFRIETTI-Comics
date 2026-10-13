<script setup>
// Editorial spotlight: artículo destacado sobre el número estrella del estudio.
import MonoPoster from '../ui/MonoPoster.vue'
import { comics } from '../../data/comics'
import { formatIssue } from '../../utils/format'

const featured = comics.find((c) => c.featured) || comics[0]
</script>

<template>
  <section id="editorial" class="border-y border-white/10 bg-stitch-surface/30 py-section md:py-section-lg">
    <div class="section-shell grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <!-- Panel de arte -->
      <div v-reveal class="relative">
        <div class="relative aspect-[4/5] overflow-hidden border border-white/15 bg-stitch-bg">
          <MonoPoster variant="diag" />
          <div class="absolute inset-0 bg-gradient-to-t from-stitch-bg via-transparent to-transparent"></div>
          <div class="absolute bottom-0 left-0 p-6 md:p-8">
            <p class="kicker text-marvel-400">Spotlight issue</p>
            <p class="font-display mt-2 text-display-sm font-bold text-white">
              {{ formatIssue(featured.issue) || '#1' }}
            </p>
          </div>
        </div>
        <span class="absolute -right-3 -top-3 h-16 w-16 border-r-2 border-t-2 border-marvel-500" aria-hidden="true"></span>
      </div>

      <!-- Texto -->
      <div v-reveal="{ delay: 120 }">
        <div class="mb-5 flex items-center gap-3">
          <span class="h-px w-10 bg-marvel-500"></span>
          <p class="kicker text-marvel-400">Editorial spotlight</p>
        </div>

        <h2 class="font-display text-display-sm font-bold text-white md:text-display">
          {{ featured.title }}, revisited
        </h2>

        <p class="editorial-text mt-6 text-base text-white/70 md:text-lg">
          {{ featured.description }} We went back to the original roughs to build an
          edition that reads the way it was drawn: raw, unfinished, honest.
        </p>
        <p class="editorial-text mt-4 text-base text-white/60">
          Thirty-two pages of ink, one long afternoon of coffee, and a story about
          where all of this began. Printed on uncoated stock with a matte finish.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-6 border-t border-white/10 pt-6">
          <a
            href="#comics"
            class="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors hover:text-marvel-400"
          >
            See all issues
            <span class="transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true">→</span>
          </a>
          <p class="text-xs uppercase tracking-[0.25em] text-white/40">
            Words by {{ featured.author }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
