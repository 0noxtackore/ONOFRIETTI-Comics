<script setup>
// Arte generativo monocromático. Genera fondos estilo cartel de cómic
// (ráfagas, tramas, círculos...) sin depender de imágenes externas.
// Para usarlo con portadas reales basta con reemplazar el componente.
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'burst' }, // burst | scan | diag | rings | grid | noise
  tone: { type: String, default: 'light' }, // 'light' trazos blancos sobre negro
})

// Sufijo único para los patrones SVG (evita colisiones de id en la página)
const uid = `mp-${Math.random().toString(36).slice(2, 8)}`
const stroke = computed(() => (props.tone === 'light' ? '#ffffff' : '#0a0a0a'))

// Rayos de la variante "burst"
const rays = computed(() => {
  const count = 48
  const angle = 360 / count
  return Array.from({ length: count }, (_, i) => ({
    i,
    x2: 400 + 620,
    y2: 520,
    w: i % 7 === 0 ? 7 : i % 3 === 0 ? 3 : 1.5,
    o: i % 5 === 0 ? 0.5 : 0.2,
    angle: i * angle,
  }))
})

// Líneas de horizonte de la variante "grid" (perspectiva)
const horizon = computed(() => {
  const lines = []
  let y = 380
  for (let i = 0; i < 14; i++) {
    lines.push(Math.round(y))
    y += 26 + i * 3
  }
  return lines
})
</script>

<template>
  <svg
    class="h-full w-full"
    viewBox="0 0 800 1000"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <pattern :id="`${uid}-dots`" width="26" height="26" patternUnits="userSpaceOnUse">
        <circle
          cx="6"
          cy="6"
          r="3"
          :fill="stroke"
          :opacity="tone === 'light' ? 0.28 : 0.4"
        />
      </pattern>
      <pattern :id="`${uid}-scan`" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect
          width="8"
          height="3"
          :fill="stroke"
          :opacity="tone === 'light' ? 0.16 : 0.5"
        />
      </pattern>
      <pattern
        :id="`${uid}-diag`"
        width="60"
        height="60"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <rect
          width="34"
          height="60"
          :fill="stroke"
          :opacity="tone === 'light' ? 0.12 : 0.5"
        />
      </pattern>
    </defs>

    <rect width="800" height="1000" fill="#050505" />

    <!-- Ráfaga de estrella -->
    <template v-if="variant === 'burst'">
      <g :stroke="stroke" stroke-linecap="round">
        <line
          v-for="r in rays"
          :key="r.i"
          x1="400"
          y1="520"
          :x2="r.x2"
          :y2="r.y2"
          :transform="`rotate(${r.angle} 400 520)`"
          :stroke-width="r.w"
          :opacity="r.o"
        />
      </g>
      <circle cx="400" cy="520" r="180" fill="#0a0a0a" :stroke="stroke" stroke-width="2" />
      <rect width="800" height="1000" :fill="`url(#${uid}-dots)`" />
    </template>

    <!-- Líneas de escáner -->
    <template v-else-if="variant === 'scan'">
      <rect width="800" height="1000" :fill="`url(#${uid}-scan)`" />
      <rect y="380" width="800" height="140" :fill="stroke" :opacity="tone === 'light' ? 0.92 : 1" />
      <rect y="336" width="800" height="6" :fill="stroke" :opacity="tone === 'light' ? 0.4 : 1" />
      <rect y="526" width="800" height="6" :fill="stroke" :opacity="tone === 'light' ? 0.4 : 1" />
    </template>

    <!-- Bandas diagonales -->
    <template v-else-if="variant === 'diag'">
      <rect width="800" height="1000" :fill="`url(#${uid}-diag)`" />
      <circle cx="400" cy="500" r="260" fill="none" :stroke="stroke" stroke-width="3" :opacity="0.85" />
      <circle cx="400" cy="500" r="120" fill="none" :stroke="stroke" stroke-width="1" :opacity="0.5" />
    </template>

    <!-- Cuadrícula en perspectiva -->
    <template v-else-if="variant === 'grid'">
      <g :stroke="stroke" :opacity="tone === 'light' ? 0.14 : 0.55">
        <line
          v-for="i in 16"
          :key="`v-${i}`"
          :x1="i * 50"
          y1="0"
          :x2="(i - 8) * 60 + 400"
          y2="1000"
          stroke-width="1"
        />
        <line
          v-for="(y, j) in horizon"
          :key="`h-${j}`"
          x1="0"
          :y1="y"
          x2="800"
          :y2="y"
          stroke-width="1"
        />
      </g>
      <rect width="800" height="1000" :fill="`url(#${uid}-dots)`" />
    </template>

    <!-- Anillos concéntricos -->
    <template v-else-if="variant === 'rings'">
      <g :stroke="stroke" fill="none">
        <circle
          v-for="r in [60, 120, 180, 240, 300, 360, 420]"
          :key="r"
          cx="400"
          cy="500"
          :r="r"
          :stroke-width="r > 300 ? 8 : 2"
          :opacity="tone === 'light' ? 0.7 : 1"
        />
      </g>
      <rect width="800" height="1000" :fill="`url(#${uid}-scan)`" />
    </template>

    <!-- Grano denso -->
    <template v-else>
      <rect width="800" height="1000" :fill="`url(#${uid}-dots)`" />
      <rect
        x="80"
        y="120"
        width="640"
        height="760"
        fill="none"
        :stroke="stroke"
        stroke-width="2"
        :opacity="tone === 'light' ? 0.85 : 1"
      />
      <rect
        x="100"
        y="140"
        width="600"
        height="720"
        fill="none"
        :stroke="stroke"
        stroke-width="1"
        :opacity="0.4"
      />
    </template>
  </svg>
</template>
