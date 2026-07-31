<script setup>
// Novedades y últimos cómics disponibles.
// El catálogo se lee desde Firebase (Firestore + Storage) si está
// configurado; si no, se usa el catálogo local de prueba.
import { ref, computed, onMounted } from 'vue'
import SectionHeading from '../ui/SectionHeading.vue'
import ComicCard from '../comic/ComicCard.vue'
import { fetchComics } from '../../services/comicsService'

const comics = ref([])
const loading = ref(true)

// Solo se muestran los cómics disponibles en el catálogo.
const availableComics = computed(() =>
  comics.value.filter((c) => ['Disponible', 'Edición limitada'].includes(c.status))
)

onMounted(async () => {
  comics.value = await fetchComics()
  loading.value = false
})
</script>

<template>
  <section id="comics" class="relative bg-black py-24 md:py-36">
    <div class="mx-auto max-w-6xl px-5 md:px-8">
      <div class="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          kicker="Últimos números"
          title="Novedades y cómics disponibles"
          description="Cada número es un objeto de colección. Tinta sobre papel, sin prisas, como debe ser."
        />
      </div>

      <!-- Esqueleto de carga -->
      <div v-if="loading" class="mt-16 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        <div v-for="i in 6" :key="i" class="animate-pulse">
          <div class="aspect-[1920/2951] bg-ink-800"></div>
          <div class="mt-5 space-y-2">
            <div class="h-3 w-24 bg-ink-800"></div>
            <div class="h-5 w-40 bg-ink-700"></div>
          </div>
        </div>
      </div>

      <!-- Catálogo -->
      <div v-else class="mt-16 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        <ComicCard v-for="(comic, i) in availableComics" :key="comic.id" :comic="comic" :index="i" />
      </div>
    </div>
  </section>
</template>
