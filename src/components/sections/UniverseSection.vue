<script setup>
// Universo: declaración editorial + cifras del catálogo + línea temporal.
import { ref, computed, onMounted } from 'vue'
import { fetchComics } from '../../services/comicsService'

const comics = ref([])

const stats = computed(() => {
  const list = comics.value
  const characters = new Set(list.map((c) => c.protagonist).filter(Boolean))
  const limited = list.filter((c) => c.status === 'Limited Edition').length
  const years = list.map((c) => Number(c.year)).filter(Boolean)
  const span = years.length ? Math.max(...years) - Math.min(...years) : 0
  return [
    { value: String(list.length).padStart(2, '0'), label: 'Issues' },
    { value: String(characters.size).padStart(2, '0'), label: 'Characters' },
    { value: String(limited).padStart(2, '0'), label: 'Limited editions' },
    { value: `${span}+`, label: 'Years of story' },
  ]
})

const milestones = [
  { year: '1998', text: 'First doodles in the back of a third-grade notebook.' },
  { year: '2014', text: 'The studio goes full-time. Ink becomes a job, not a hobby.' },
  { year: '2026', text: 'The Origin launches the new line of collectible issues.' },
  { year: 'Now', text: 'New issues every month. Still hand-drawn, still unhurried.' },
]

onMounted(async () => {
  comics.value = await fetchComics()
})
</script>

<template>
  <section id="universe" class="relative overflow-hidden border-y border-white/10 bg-stitch-bg py-section md:py-section-lg">
    <div class="pointer-events-none absolute inset-0 opacity-[0.06] diagonal-stripes" aria-hidden="true"></div>

    <div class="section-shell relative">
      <div v-reveal class="max-w-3xl">
        <div class="mb-5 flex items-center gap-3">
          <span class="h-px w-10 bg-marvel-500"></span>
          <p class="kicker text-marvel-400">The universe</p>
        </div>
        <p class="font-display text-display-xs font-bold leading-[0.95] text-white md:text-display">
          One city. A thousand panels. <span class="text-outline">The same ink.</span>
        </p>
        <p class="editorial-text mt-6 max-w-2xl text-base text-white/70 md:text-lg">
          Every Onofrietti story lives in the same world — you just meet it from a
          different street corner. Read one and you have read a fragment. Read them
          all and the city starts to make sense.
        </p>
      </div>

      <!-- Cifras -->
      <dl v-reveal="{ delay: 100 }" class="mt-14 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-4">
        <div v-for="s in stats" :key="s.label" class="bg-stitch-bg px-6 py-8">
          <dt class="font-display text-4xl font-bold text-white md:text-5xl">{{ s.value }}</dt>
          <dd class="mt-2 text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">{{ s.label }}</dd>
        </div>
      </dl>

      <!-- Línea temporal -->
      <ol v-reveal="{ delay: 160 }" class="mt-14 grid gap-px border border-white/10 bg-white/10 md:grid-cols-4">
        <li v-for="(m, i) in milestones" :key="m.year" class="bg-stitch-bg p-6">
          <p class="font-display text-sm font-bold uppercase tracking-[0.2em] text-marvel-400">
            {{ m.year }}
          </p>
          <p class="mt-3 text-sm leading-relaxed text-white/60">{{ m.text }}</p>
          <span class="mt-4 block text-[10px] uppercase tracking-[0.3em] text-white/25">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
        </li>
      </ol>
    </div>
  </section>
</template>
