<script setup>
// Bitácora del estudio: artículos y notas de proceso.
import SectionHeading from '../ui/SectionHeading.vue'

const articles = [
  {
    date: 'Mar 2026',
    category: 'Process',
    title: 'Inking The Origin, panel by panel',
    excerpt: 'How a single page took three days, two pens and one very patient editor.',
    read: '6 min',
  },
  {
    date: 'Feb 2026',
    category: 'Studio',
    title: 'Why we print on uncoated stock',
    excerpt: 'Paper changes how a story feels in your hands. We tested eleven stocks to find ours.',
    read: '4 min',
  },
  {
    date: 'Jan 2026',
    category: 'Interview',
    title: 'Angello Aponte on drawing slowly',
    excerpt: 'The founder talks deadlines, mistakes and the case for not rushing a page.',
    read: '9 min',
  },
  {
    date: 'Dec 2025',
    category: 'Collecting',
    title: 'A field guide to limited editions',
    excerpt: 'What makes an Onofrietti variant worth keeping — and what to look for.',
    read: '5 min',
  },
]

const [lead, ...rest] = articles
</script>

<template>
  <section id="journal" class="py-section md:py-section-lg">
    <div class="section-shell">
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          kicker="From the journal"
          title="Notes from the studio"
          description="Process, paper and the people behind the panels."
        />
        <a
          href="#newsletter"
          class="link-line shrink-0 text-xs font-bold uppercase tracking-[0.25em] text-white/60 transition-colors hover:text-white"
        >
          Subscribe for new notes
        </a>
      </div>

      <div class="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <!-- Artículo destacado -->
        <article v-reveal class="group flex flex-col border-t-2 border-marvel-500 pt-6">
          <div class="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">
            <span class="text-marvel-400">{{ lead.category }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ lead.date }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ lead.read }}</span>
          </div>

          <h3 class="font-display mt-4 text-3xl font-bold leading-[0.95] text-white transition-colors duration-300 group-hover:text-marvel-400 md:text-4xl">
            {{ lead.title }}
          </h3>
          <p class="editorial-text mt-4 max-w-lg text-base text-white/60">{{ lead.excerpt }}</p>
          <a href="#journal" class="mt-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-white">
            Read the note
            <span class="transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true">→</span>
          </a>
        </article>

        <!-- Lista -->
        <ul class="flex flex-col divide-y divide-white/10 border-y border-white/10">
          <li v-for="(a, i) in rest" :key="a.title">
            <a
              v-reveal="{ delay: i * 80 }"
              href="#journal"
              class="group flex items-start justify-between gap-6 py-6 transition-colors duration-300"
            >
              <div>
                <div class="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">
                  <span class="text-marvel-400">{{ a.category }}</span>
                  <span aria-hidden="true">·</span>
                  <span>{{ a.date }}</span>
                </div>
                <h3 class="font-heading mt-2 text-lg font-semibold text-white transition-colors duration-300 group-hover:text-marvel-400 md:text-xl">
                  {{ a.title }}
                </h3>
              </div>
              <span class="mt-1 shrink-0 text-white/40 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true">→</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
