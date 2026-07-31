<script setup>
// Hero a pantalla completa, estilo lanzamiento de videojuego.
import MonoPoster from '../ui/MonoPoster.vue'
import Marquee from '../ui/Marquee.vue'
import { comics } from '../../data/comics'

const featured = comics.find((c) => c.featured)
const meta = ['Nº ' + featured.issue.slice(-2), featured.year, `${featured.pages} páginas`, 'Tinta y café']

const tickerItems = [
  'Nuevos números cada mes',
  '100% dibujado a mano',
  'El Origen ya disponible',
  'Sin superhéroes. Solo historias',
  'Fundado en 1998',
  'Hecho a tinta',
]
</script>

<template>
  <!--
    HERO COMPLETO — COMENTADO.
    Para reactivarlo, descomenta todo el bloque <section id="inicio">.
  -->
  <!--
  <section id="inicio" class="relative flex min-h-screen flex-col overflow-hidden">
    <div class="absolute inset-0">
      <div class="animate-slow-zoom absolute inset-0">
        <MonoPoster variant="burst" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40"></div>
    </div>

    <div class="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <div class="max-w-3xl">
        <p class="rise-in mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.4em] text-white/70" style="animation-delay: 100ms">
          <span class="inline-block h-px w-12 bg-white"></span>
          Onofrietti Comics presenta
        </p>

        <h1 class="font-display text-[15vw] font-black uppercase leading-[0.85] tracking-tight text-white sm:text-8xl lg:text-[7rem]">
          <span class="rise-in block" style="animation-delay: 200ms">El</span>
          <span class="rise-in text-outline block" style="animation-delay: 300ms">Origen</span>
        </h1>

        <p class="rise-in mt-8 max-w-xl text-base leading-relaxed text-white/70 md:text-lg" style="animation-delay: 420ms">
          Donde todo empezó. Una historia de tinta, garabatos y el fondo de un cuaderno
          de tercer grado.
        </p>

        <ul class="rise-in mt-8 flex flex-wrap gap-x-2 gap-y-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/60" style="animation-delay: 520ms">
          <li v-for="(m, i) in meta" :key="m" class="flex items-center gap-x-4">
            <span>{{ m }}</span>
            <span v-if="i < meta.length - 1" class="text-white/25" aria-hidden="true">//</span>
          </li>
        </ul>

        <div class="rise-in mt-10 flex flex-wrap items-center gap-4" style="animation-delay: 620ms">
          <a
            href="#comics"
            class="group inline-flex items-center gap-3 bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors hover:bg-white/80"
          >
            Ver cómics
            <span class="transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true">→</span>
          </a>
          <a
            href="#comics"
            class="inline-flex items-center gap-3 border border-white/30 px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors hover:border-white hover:bg-white hover:text-black"
          >
            El catálogo
          </a>
        </div>
      </div>
    </div>

    <div class="relative z-10 border-t border-white/10 bg-black/60 py-4 backdrop-blur-sm">
      <Marquee :items="tickerItems" :duration="36" />
    </div>
  </section>
  -->
</template>
