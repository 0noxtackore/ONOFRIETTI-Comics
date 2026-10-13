<script setup>
// Newsletter: alta de correo para avisos de lanzamientos.
import { ref } from 'vue'

const email = ref('')
const subscribed = ref(false)

function onSubscribe() {
  if (!email.value) return
  subscribed.value = true
}
</script>

<template>
  <section id="newsletter" class="relative overflow-hidden border-t border-white/10 bg-stitch-surface/40 py-section md:py-section-lg">
    <div class="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-marvel-500/10 blur-3xl" aria-hidden="true"></div>

    <div class="section-shell relative">
      <div v-reveal class="mx-auto max-w-2xl text-center">
        <p class="kicker text-marvel-400">Newsletter</p>
        <h2 class="font-display mt-4 text-display-sm font-bold text-white">
          Subscribe to the ink
        </h2>
        <p class="editorial-text mx-auto mt-5 max-w-md text-sm text-white/70 md:text-base">
          Be the first to know about every release, reprint and limited edition.
          No spam. Just ink.
        </p>

        <form
          v-if="!subscribed"
          @submit.prevent="onSubscribe"
          class="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            v-model="email"
            type="email"
            required
            placeholder="your@email.com"
            aria-label="Email address"
            class="w-full border border-white/20 bg-stitch-bg/60 px-5 py-3.5 text-sm text-white transition-colors placeholder:text-white/30 focus:border-white focus:outline-none"
          />
          <button
            type="submit"
            class="shrink-0 bg-marvel-500 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:bg-marvel-600 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Subscribe
          </button>
        </form>

        <p v-else class="mx-auto mt-8 max-w-md border border-white/20 bg-stitch-bg/60 px-6 py-4 text-sm text-white/70">
          Done. Welcome to the ink side.
        </p>

        <p class="mt-5 text-[11px] uppercase tracking-[0.25em] text-white/30">
          One email a month · Unsubscribe anytime
        </p>
      </div>
    </div>
  </section>
</template>
