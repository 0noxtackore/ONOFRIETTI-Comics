<script setup>
// Dossier de personajes: se deriva del catálogo (protagonista + descripciones).
import { ref, computed, onMounted } from 'vue'
import SectionHeading from '../ui/SectionHeading.vue'
import { fetchComics } from '../../services/comicsService'

const comics = ref([])
const loading = ref(true)

const characters = computed(() => {
  const map = new Map()
  for (const c of comics.value) {
    const key = c.protagonist || c.title
    if (!map.has(key)) {
      map.set(key, { name: key, count: 0, description: c.description, year: c.year })
    }
    const entry = map.get(key)
    entry.count += 1
    if (!entry.description && c.description) entry.description = c.description
  }
  return [...map.values()].sort((a, b) => b.count - a.count)
})

onMounted(async () => {
  comics.value = await fetchComics()
  loading.value = false
})
</script>

<template>
  <section id="characters" class="py-section md:py-section-lg">
    <div class="section-shell">
      <SectionHeading
        kicker="Character dossier"
        title="The cast"
        description="Protagonists built issue by issue. No capes required — just people with something to lose."
      />

      <!-- Esqueletos -->
      <div v-if="loading" class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="h-56 animate-pulse border border-white/10 bg-stitch-surface/40"></div>
      </div>

      <div v-else class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(c, i) in characters"
          :key="c.name"
          v-reveal="{ delay: (i % 3) * 90 }"
          class="group relative flex flex-col overflow-hidden border border-white/10 bg-stitch-surface/40 p-6 transition-colors duration-300 hover:border-white/30"
        >
          <span
            class="font-display absolute right-5 top-3 text-5xl font-bold text-white/5 transition-colors duration-300 group-hover:text-marvel-500/30"
            aria-hidden="true"
          >
            {{ String(i + 1).padStart(2, '0') }}
          </span>

          <p class="kicker text-marvel-400">{{ c.count }} {{ c.count === 1 ? 'issue' : 'issues' }}</p>

          <h3 class="font-display mt-3 text-2xl font-bold uppercase leading-none text-white md:text-3xl">
            {{ c.name }}
          </h3>

          <p class="editorial-text mt-4 line-clamp-3 flex-1 text-sm text-white/60">
            {{ c.description || 'A dossier still being written. More pages to come.' }}
          </p>

          <a
            href="#comics"
            class="mt-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-white/50 transition-colors hover:text-white"
          >
            View issues
            <span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
          </a>
        </article>
      </div>
    </div>
  </section>
</template>
