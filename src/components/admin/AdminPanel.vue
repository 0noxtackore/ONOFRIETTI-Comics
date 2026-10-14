<script setup>
// Panel de administración oculto en /admin.
// - Requiere sesión con Firebase Authentication (Email/Contraseña).
// - Permite crear, editar, eliminar cómics y añadir portadas (imagen → enlace).
// - Permite gestionar series de cómics con logos.
// Se accede solo escribiendo la URL manualmente: https://sitio/admin
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { isConfigured } from '../../firebase/init'
import { signInAdmin, signOutAdmin, onAdminAuth } from '../../firebase/auth'
import { listComics, saveComic, deleteComic, fileToPoster } from '../../services/adminService'
import { listSeries, saveSeries, deleteSeries, fileToLogo } from '../../services/seriesService'
import { navigate } from '../../utils/router'

const STATUSES = ['Available', 'Limited Edition', 'Sold Out', 'Coming Soon']

const user = ref(null)
const comics = ref([])
const series = ref([])
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const showForm = ref(false)
const showSeriesForm = ref(false)
const editingId = ref(null)
const editingSeriesId = ref(null)
const error = ref('')
const notice = ref('')
const activeTab = ref('comics') // 'comics' o 'series'

const email = ref('')
const password = ref('')
const busy = ref(false)

const search = ref('')

const emptyForm = () => ({
  id: '',
  title: '',
  protagonist: '',
  issue: 1,
  year: new Date().getFullYear(),
  pages: '',
  status: 'Available',
  author: 'Angello Aponte',
  description: '',
  poster: '',
  storagePath: '',
  featured: false,
  seriesId: '',
  rating: '',
  price: '',
  discount: '',
  createdAt: '',
})
const form = reactive(emptyForm())

const emptySeriesForm = () => ({
  id: '',
  name: '',
  slug: '',
  logo: '',
})
const seriesForm = reactive(emptySeriesForm())

// Slug de la parte que se genera automáticamente desde el título.
function slugifyId(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Genera el ID completo desde el título: "ON-<slug>-issue-<n>".
// Si ya existe otro cómic con ese ID, le añade -2, -3, … para que sea único.
function generatedId() {
  const slug = slugifyId(form.title)
  if (!slug) return ''
  const issue = form.issue === '' || form.issue == null ? 1 : Number(form.issue)
  const baseId = `ON-${slug}-issue-${issue}`
  let id = baseId
  let n = 2
  while (comics.value.some((c) => c.id === id && c.id !== editingId.value)) {
    id = `${baseId}-${n}`
    n++
  }
  return id
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [comicsData, seriesData] = await Promise.all([listComics(), listSeries()])
    comics.value = comicsData
    series.value = seriesData
  } catch (e) {
    error.value = 'Could not load data: ' + e.message
  } finally {
    loading.value = false
  }
}

// Cómic con protagonista derivado si la BD no lo trae.
function withProtagonist(c) {
  return {
    ...c,
    protagonist: c.protagonist || String(c.title || '').replace(/^THE\s+/i, ''),
  }
}

// Filtra por búsqueda (título, protagonista, ID, issue, estado, autor).
const filteredComics = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = comics.value.map(withProtagonist)
  if (!q) return list
  return list.filter((c) =>
    [c.title, c.protagonist, c.id, String(c.issue), c.status, c.author]
      .join(' ')
      .toLowerCase()
      .includes(q)
  )
})

// Serie elegida en el formulario (para previsualizar su logo en la ficha).
const selectedSeries = computed(() => series.value.find((s) => s.id === form.seriesId) || null)

// Precio final con descuento para la previsualización de la ficha.
const previewPrice = computed(() => {
  const price = Number(form.price) || 0
  const discount = Number(form.discount) || 0
  return (discount ? price * (1 - discount / 100) : price).toFixed(2)
})

// Agrupa por protagonista, ordenado alfabéticamente.
const groups = computed(() => {
  const map = new Map()
  for (const c of filteredComics.value) {
    const key = c.protagonist || 'Uncategorized'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(c)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, items]) => ({ name, items }))
})

// Grupos desplegados (por defecto todos colapsados).
const expandedGroups = ref(new Set())

function isGroupOpen(name) {
  return expandedGroups.value.has(name)
}

function toggleGroup(name) {
  const next = new Set(expandedGroups.value)
  if (next.has(name)) next.delete(name)
  else next.add(name)
  expandedGroups.value = next
}

function openNew() {
  Object.assign(form, emptyForm())
  editingId.value = null
  showForm.value = true
  error.value = ''
}

function openEdit(comic) {
  Object.assign(form, emptyForm(), comic)
  editingId.value = comic.id
  showForm.value = true
  error.value = ''
}

function cancelForm() {
  showForm.value = false
  editingId.value = null
  error.value = ''
}

async function save() {
  error.value = ''
  const newId = generatedId()
  if (!newId) {
    error.value = 'Title is required (the ID is generated from the title).'
    return
  }
  if (!form.title.trim()) {
    error.value = 'Title is required.'
    return
  }
  const isEditing = Boolean(editingId.value)
  const idChanged = isEditing && editingId.value !== newId
  saving.value = true
  try {
    const payload = {
      title: form.title.trim(),
      protagonist: form.protagonist.trim() || String(form.title).replace(/^THE\s+/i, '').trim(),
      slug: newId.replace(/^ON-/, ''),
      issue: form.issue === '' ? 1 : Number(form.issue),
      year: form.year === '' ? new Date().getFullYear() : Number(form.year),
      pages: form.pages === '' ? 0 : Number(form.pages),
      status: form.status,
      author: form.author.trim() || 'Angello Aponte',
      description: form.description.trim(),
      poster: form.poster.trim(),
      storagePath: form.storagePath.trim(),
      featured: Boolean(form.featured),
      seriesId: form.seriesId || '',
      rating: form.rating === '' ? 0 : Math.min(100, Math.max(0, Number(form.rating))),
      price: form.price === '' ? 0 : Number(form.price),
      discount: form.discount === '' ? 0 : Math.min(100, Math.max(0, Number(form.discount))),
      createdAt: isEditing ? form.createdAt || new Date().toISOString() : new Date().toISOString(),
    }
    await saveComic(newId, payload)
    // Si el ID cambió, el documento nuevo ya existe; elimina el antiguo.
    if (idChanged) {
      try {
        await deleteComic(editingId.value)
      } catch (e) {
        throw new Error(
          `New comic saved as "${newId}", but the old one "${editingId.value}" could not be deleted: ${e.message}`
        )
      }
    }
    await load()
    showForm.value = false
    editingId.value = null
    notice.value = isEditing ? 'Comic updated.' : 'Comic created.'
  } catch (e) {
    error.value = 'Error saving: ' + e.message
  } finally {
    saving.value = false
  }
}

async function remove(comic) {
  if (!window.confirm(`Delete "${comic.title}"? This action cannot be undone.`)) return
  error.value = ''
  try {
    await deleteComic(comic.id)
    await load()
    if (editingId.value === comic.id) {
      showForm.value = false
      editingId.value = null
    }
    notice.value = 'Comic deleted.'
  } catch (e) {
    error.value = 'Error deleting: ' + e.message
  }
}

// Funciones para gestionar series
function slugifyName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function openNewSeries() {
  Object.assign(seriesForm, emptySeriesForm())
  editingSeriesId.value = null
  showSeriesForm.value = true
  error.value = ''
}

function openEditSeries(s) {
  Object.assign(seriesForm, emptySeriesForm(), s)
  editingSeriesId.value = s.id
  showSeriesForm.value = true
  error.value = ''
}

function cancelSeriesForm() {
  showSeriesForm.value = false
  editingSeriesId.value = null
  error.value = ''
}

async function saveSeriesData() {
  error.value = ''
  if (!seriesForm.name.trim()) {
    error.value = 'Series name is required.'
    return
  }
  const slug = slugifyName(seriesForm.name)
  const id = editingSeriesId.value || `series-${slug}`
  saving.value = true
  try {
    const payload = {
      name: seriesForm.name.trim().toUpperCase(),
      slug,
      logo: seriesForm.logo.trim(),
    }
    await saveSeries(id, payload)
    await load()
    showSeriesForm.value = false
    editingSeriesId.value = null
    notice.value = editingSeriesId.value ? 'Series updated.' : 'Series created.'
  } catch (e) {
    error.value = 'Error saving series: ' + e.message
  } finally {
    saving.value = false
  }
}

async function removeSeries(s) {
  if (!window.confirm(`Delete series "${s.name}"? This action cannot be undone.`)) return
  error.value = ''
  try {
    await deleteSeries(s.id)
    await load()
    if (editingSeriesId.value === s.id) {
      showSeriesForm.value = false
      editingSeriesId.value = null
    }
    notice.value = 'Series deleted.'
  } catch (e) {
    error.value = 'Error deleting series: ' + e.message
  }
}

async function processLogo(file) {
  error.value = ''
  if (!seriesForm.name.trim()) {
    error.value = 'Write the series name first.'
    return
  }
  uploading.value = true
  try {
    const logo = await fileToLogo(file)
    seriesForm.logo = logo
    notice.value = 'Logo ready to save.'
  } catch (err) {
    error.value = 'Error processing the image: ' + err.message
  } finally {
    uploading.value = false
  }
}

function onLogoSelected(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (file) processLogo(file)
}

async function processCover(file) {
  error.value = ''
  if (!form.title.trim()) {
    error.value = 'Write the comic title first.'
    return
  }
  uploading.value = true
  try {
    const { poster } = await fileToPoster(file)
    form.storagePath = ''
    form.poster = poster
    notice.value = 'Image converted to link and ready to save.'
  } catch (err) {
    error.value = 'Error processing the image: ' + err.message
  } finally {
    uploading.value = false
  }
}

function onCoverSelected(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (file) processCover(file)
}

// Permite pegar un captura (Ctrl+V) directamente en el formulario.
function onPaste(e) {
  const file = e.clipboardData?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    e.preventDefault()
    processCover(file)
  }
}

async function login() {
  error.value = ''
  busy.value = true
  try {
    await signInAdmin(email.value.trim(), password.value)
    password.value = ''
  } catch {
    error.value = 'Invalid credentials.'
  } finally {
    busy.value = false
  }
}

async function logout() {
  await signOutAdmin()
  password.value = ''
}

function goToSite() {
  navigate('/')
}

let unsubscribe = null
onMounted(async () => {
  window.addEventListener('keydown', onGlobalKey)
  unsubscribe = await onAdminAuth((u) => {
    user.value = u
    if (u) load()
    else {
      comics.value = []
      showForm.value = false
      loading.value = false
    }
  })
})
onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKey)
  if (unsubscribe) unsubscribe()
})

function onGlobalKey(e) {
  if (e.key === 'Escape' && showForm.value) cancelForm()
}

watch(notice, (v) => {
  if (v) setTimeout(() => (notice.value = ''), 3000)
})

watch(search, (v) => {
  if (v.trim()) {
    expandedGroups.value = new Set(groups.value.map((g) => g.name))
  }
})
</script>

<template>
  <div class="fixed inset-0 z-[100] overflow-y-auto bg-white text-ink-950 antialiased">
    <!-- Aviso: Firebase no configurado -->
    <div v-if="!isConfigured" class="flex min-h-screen items-center justify-center p-8">
      <p class="max-w-md border border-ink-950/15 p-8 text-center text-sm uppercase tracking-[0.25em] text-ink-950/60">
        Firebase is not configured. Complete the <span class="font-bold text-ink-950">.env</span> file to use the panel.
      </p>
    </div>

    <!-- Pantalla de login -->
    <div v-else-if="!user" class="flex min-h-screen items-center justify-center p-8">
      <form class="w-full max-w-sm border border-ink-950/15 p-10" @submit.prevent="login">
        <p class="text-[10px] font-bold uppercase tracking-[0.4em] text-ink-950/40">Restricted system</p>
        <h1 class="font-display mt-2 text-2xl font-black uppercase tracking-tight text-ink-950">Admin access</h1>

        <label class="mt-8 block text-[10px] font-bold uppercase tracking-[0.3em] text-ink-950/50">
          Email
          <input
            v-model="email"
            type="email"
            required
            autocomplete="username"
            placeholder="you@example.com"
            class="mt-2 w-full border border-ink-950/20 bg-transparent px-4 py-3 text-sm text-ink-950 placeholder:text-ink-950/25 focus:border-ink-950 focus:outline-none"
          />
        </label>

        <label class="mt-5 block text-[10px] font-bold uppercase tracking-[0.3em] text-ink-950/50">
          Password
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="Enter your password"
            class="mt-2 w-full border border-ink-950/20 bg-transparent px-4 py-3 text-sm text-ink-950 placeholder:text-ink-950/25 focus:border-ink-950 focus:outline-none"
          />
        </label>

        <p v-if="error" class="mt-4 text-xs uppercase tracking-[0.2em] text-red-600">{{ error }}</p>

        <button
          type="submit"
          :disabled="busy"
          class="mt-8 w-full bg-ink-950 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:bg-ink-800 disabled:opacity-50"
        >
          {{ busy ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>

    <!-- Panel -->
    <div v-else>
      <!-- Barra superior negra -->
      <header class="bg-black text-white">
        <div class="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Signed in as · {{ user.email }}</p>
            <h1 class="font-display mt-1 text-3xl font-black uppercase tracking-tight">Admin panel</h1>
          </div>
          <div class="flex gap-3">
            <button
              @click="goToSite"
              class="border border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:border-white"
            >
              Back to site
            </button>
            <button
              @click="logout"
              class="border border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-white/50 transition-colors duration-300 hover:border-white hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <!-- Editor: simulacro de la ficha de cómic -->
      <div v-if="showForm && activeTab === 'comics'" @paste="onPaste">
        <!-- Barra de acciones -->
        <div class="sticky top-0 z-10 flex flex-col gap-3 border-b border-ink-950/10 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <button
            @click="cancelForm"
            class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-ink-950/60 transition-colors duration-300 hover:text-ink-950"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
            </svg>
            Back to catalog
          </button>
          <div class="flex items-center gap-3">
            <span class="hidden text-[10px] uppercase tracking-[0.3em] text-ink-950/40 sm:inline">
              {{ editingId ? 'Editing comic' : 'New comic' }}
            </span>
            <button
              @click="cancelForm"
              class="border border-ink-950/20 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-ink-950/60 transition-colors duration-300 hover:border-ink-950 hover:text-ink-950"
            >
              Cancel
            </button>
            <button
              @click="save"
              :disabled="saving"
              class="bg-ink-950 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:bg-ink-800 disabled:opacity-50"
            >
              {{ saving ? 'Saving…' : 'Save comic' }}
            </button>
          </div>
        </div>

        <!-- Sección gris oscura (ficha) -->
        <div class="bg-ink-900 text-white">
          <div class="mx-auto max-w-6xl px-8 py-14 md:px-16 md:py-20">
            <div class="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
              <!-- Izquierda: logo de serie, issue, info, precio -->
              <div class="flex flex-col items-center text-center">
                <div v-if="selectedSeries && selectedSeries.logo" class="mb-6">
                  <img
                    :src="selectedSeries.logo"
                    :alt="`Logo of ${selectedSeries.name}`"
                    class="h-40 w-auto object-contain drop-shadow-lg md:h-48"
                  />
                </div>

                <div class="flex items-center gap-4">
                  <img src="/images/logo-menubar.png" alt="Logo" class="h-16 w-auto object-contain md:h-20" />
                  <p class="font-display text-xl font-black uppercase text-white md:text-2xl">
                    ISSUE {{ form.issue || 1 }}
                  </p>
                </div>

                <div class="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-[11px] uppercase tracking-[0.15em] text-white/50">
                  <span>Author: {{ form.author || '—' }}</span>
                  <span>Year: {{ form.year || '—' }}</span>
                  <span>Pages: {{ form.pages || '—' }}</span>
                </div>

                <div v-if="form.price" class="mt-4 w-full text-center">
                  <div v-if="form.discount" class="flex items-center justify-center gap-3">
                    <p class="font-display text-2xl font-black text-red-500 line-through md:text-3xl">
                      ${{ form.price }}
                    </p>
                    <span class="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600">-{{ form.discount }}%</span>
                  </div>
                  <p class="font-display text-5xl font-black text-white md:text-6xl">${{ previewPrice }}</p>
                </div>

                <div class="mt-8 flex w-full items-center justify-center gap-3 bg-white px-8 py-5 text-sm font-bold uppercase tracking-[0.25em] text-ink-950/60">
                  Buy (preview)
                </div>
              </div>

              <!-- Derecha: portada -->
              <div class="flex justify-center lg:justify-end">
                <div class="overflow-hidden shadow-2xl shadow-black/50">
                  <img
                    :src="form.poster || '/images/no-image.webp'"
                    :alt="`Cover of ${form.title || 'comic'}`"
                    class="w-96 object-cover md:w-[28rem]"
                  />
                </div>
              </div>
            </div>

            <!-- Sección de detalles (formulario) -->
            <section class="mt-16 border-t border-white/10 pt-16 md:mt-24">
              <h2 class="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">Comic details</h2>
              <p class="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/40">
                Product ID (auto-generated): <span class="font-bold text-white">{{ generatedId() || '…' }}</span>
              </p>

              <div class="mt-8 grid gap-6 md:grid-cols-3">
                <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 md:col-span-2">
                  Title *
                  <input
                    v-model="form.title"
                    placeholder="The Origin"
                    class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-white focus:outline-none"
                  />
                </label>
                <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                  Character / Protagonist
                  <input
                    v-model="form.protagonist"
                    placeholder="TUTEQUE-MAN"
                    class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-white focus:outline-none"
                  />
                </label>
                <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                  Issue ({{ form.issue }})
                  <input
                    v-model.number="form.issue"
                    type="number"
                    min="1"
                    placeholder="1"
                    class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-white focus:outline-none"
                  />
                </label>
                <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                  Year
                  <input
                    v-model.number="form.year"
                    type="number"
                    min="1900"
                    max="2100"
                    placeholder="2026"
                    class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-white focus:outline-none"
                  />
                </label>
                <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                  Pages
                  <input
                    v-model.number="form.pages"
                    type="number"
                    min="1"
                    placeholder="32"
                    class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-white focus:outline-none"
                  />
                </label>
                <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                  Author / Artist
                  <input
                    v-model="form.author"
                    placeholder="Angello Aponte"
                    class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-white focus:outline-none"
                  />
                </label>
                <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                  Status
                  <select
                    v-model="form.status"
                    class="mt-2 w-full border border-white/20 bg-ink-900 px-4 py-3 text-sm text-white focus:border-white focus:outline-none"
                  >
                    <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
                  </select>
                </label>
                <label class="flex cursor-pointer items-center gap-3 self-end pb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                  <input v-model="form.featured" type="checkbox" class="h-4 w-4 accent-white" />
                  Featured
                </label>
                <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                  Rating (%)
                  <input
                    v-model.number="form.rating"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="85"
                    class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-white focus:outline-none"
                  />
                </label>
                <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                  Price ($)
                  <input
                    v-model.number="form.price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="9.99"
                    class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-white focus:outline-none"
                  />
                </label>
                <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                  Discount (%)
                  <input
                    v-model.number="form.discount"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="10"
                    class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-white focus:outline-none"
                  />
                </label>
                <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 md:col-span-3">
                  Series (optional)
                  <select
                    v-model="form.seriesId"
                    class="mt-2 w-full border border-white/20 bg-ink-900 px-4 py-3 text-sm text-white focus:border-white focus:outline-none"
                  >
                    <option value="">No series</option>
                    <option v-for="s in series" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </label>
                <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 md:col-span-3">
                  Description
                  <textarea
                    v-model="form.description"
                    rows="3"
                    placeholder="Comic synopsis, shown on the product page…"
                    class="mt-2 w-full resize-y border border-white/20 bg-transparent px-4 py-3 text-sm leading-relaxed text-white placeholder:text-white/25 focus:border-white focus:outline-none"
                  ></textarea>
                </label>
              </div>

              <div class="mt-8 border border-white/10 p-5">
                <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Cover (converted to image link)</p>
                <div class="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div class="w-24 shrink-0 overflow-hidden bg-ink-800">
                    <img :src="form.poster || '/images/no-image.webp'" alt="Cover preview" class="aspect-[1920/2951] w-full object-cover" />
                  </div>
                  <div class="flex-1">
                    <label class="inline-flex cursor-pointer border border-white/30 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:border-white">
                      {{ uploading ? 'Processing…' : 'Choose image' }}
                      <input type="file" accept="image/*" class="hidden" :disabled="uploading" @change="onCoverSelected" />
                    </label>
                    <p class="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/35">
                      Or paste a screenshot with Ctrl+V. The image is compressed and stored inside the comic itself.
                    </p>
                  </div>
                </div>
              </div>

              <p v-if="error" class="mt-6 border border-red-500/40 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                {{ error }}
              </p>

              <div class="mt-8 flex flex-wrap gap-3">
                <button
                  @click="save"
                  :disabled="saving"
                  class="bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-ink-950 transition-colors duration-300 hover:bg-ink-100 disabled:opacity-50"
                >
                  {{ saving ? 'Saving…' : 'Save comic' }}
                </button>
                <button
                  @click="cancelForm"
                  class="border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-white/60 transition-colors duration-300 hover:border-white hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div v-else class="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <!-- Tabs -->
      <div class="flex gap-1 border-b border-ink-950/10">
        <button
          @click="activeTab = 'comics'"
          class="px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] transition-colors duration-300"
          :class="activeTab === 'comics' ? 'border-b-2 border-ink-950 text-ink-950' : 'text-ink-950/50 hover:text-ink-950'"
        >
          Comics ({{ comics.length }})
        </button>
        <button
          @click="activeTab = 'series'"
          class="px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] transition-colors duration-300"
          :class="activeTab === 'series' ? 'border-b-2 border-ink-950 text-ink-950' : 'text-ink-950/50 hover:text-ink-950'"
        >
          Series ({{ series.length }})
        </button>
      </div>

      <p v-if="notice" class="mt-5 border border-ink-950 bg-ink-950 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white">
        {{ notice }}
      </p>
      <p v-if="error" class="mt-5 border border-red-500/40 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
        {{ error }}
      </p>

      <!-- Comics Tab -->
      <div v-if="activeTab === 'comics'">
        <div class="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div class="flex-1">
            <h2 class="text-sm font-bold uppercase tracking-[0.3em] text-ink-950/60">
              Catalog ({{ filteredComics.length }} / {{ comics.length }})
            </h2>
            <div class="relative mt-3 max-w-md">
              <input
                v-model="search"
                type="search"
                placeholder="Search by title, character, ID, issue, status…"
                class="w-full border border-ink-950/20 bg-transparent py-3 pl-4 pr-10 text-sm text-ink-950 placeholder:text-ink-950/25 focus:border-ink-950 focus:outline-none"
              />
              <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-ink-950/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-binoculars-fill" viewBox="0 0 16 16">
                  <path d="M4.5 1A1.5 1.5 0 0 0 3 2.5V3h4v-.5A1.5 1.5 0 0 0 5.5 1zM7 4v1h2V4h4v.882a.5.5 0 0 0 .276.447l.895.447A1.5 1.5 0 0 1 15 7.118V13H9v-1.5a.5.5 0 0 1 .146-.354l.854-.853V9.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v.793l.854.853A.5.5 0 0 1 7 11.5V13H1V7.118a1.5 1.5 0 0 1 .83-1.342l.894-.447A.5.5 0 0 0 3 4.882V4zM1 14v.5A1.5 1.5 0 0 0 2.5 16h3A1.5 1.5 0 0 0 7 14.5V14zm8 0v.5a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5V14zm4-11H9v-.5A1.5 1.5 0 0 1 10.5 1h1A1.5 1.5 0 0 1 13 2.5z"/>
                </svg>
              </span>
            </div>
          </div>
          <button
            @click="openNew"
            class="bg-ink-950 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:bg-ink-800"
          >
            + New comic
          </button>
        </div>

        <!-- Cargando -->
        <div v-if="loading" class="mt-6 space-y-3">
          <div v-for="i in 3" :key="i" class="h-16 animate-pulse border border-ink-950/10"></div>
        </div>

        <!-- Lista vacía -->
        <div v-else-if="comics.length === 0" class="mt-6 border border-ink-950/10 p-10 text-center">
          <p class="text-sm uppercase tracking-[0.25em] text-ink-950/40">No comics yet. Create the first one.</p>
        </div>

        <!-- Sin resultados de búsqueda -->
        <div v-else-if="filteredComics.length === 0" class="mt-6 border border-ink-950/10 p-10 text-center">
          <p class="text-sm uppercase tracking-[0.25em] text-ink-950/40">No comics match your search.</p>
        </div>

        <!-- Lista de cómics agrupada por protagonista -->
        <div v-else class="mt-6 space-y-3">
          <section v-for="group in groups" :key="group.name" class="border border-ink-950/10">
            <button
              type="button"
              @click="toggleGroup(group.name)"
              class="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors duration-300 hover:bg-ink-950/5"
            >
              <span class="flex items-center gap-4">
                <span class="h-14 w-10 shrink-0 overflow-hidden bg-ink-100">
                  <img :src="group.items[0].poster || '/images/no-image.webp'" :alt="group.name" class="h-full w-full object-cover" />
                </span>
                <span class="flex flex-col">
                  <span class="text-sm font-bold uppercase tracking-[0.3em] text-ink-950">{{ group.name }}</span>
                  <span class="text-[11px] uppercase tracking-[0.2em] text-ink-950/40">{{ group.items.length }} issues</span>
                </span>
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                class="h-3 w-3 text-ink-950/50 transition-transform duration-300"
                :class="isGroupOpen(group.name) ? 'rotate-180' : ''"
              >
                <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
              </svg>
            </button>
            <div v-if="isGroupOpen(group.name)" class="border-t border-ink-950/10 p-4 md:p-6">
              <div class="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                <div v-for="comic in group.items" :key="comic.id" class="flex flex-col border border-ink-950/10 bg-white">
                  <div class="relative overflow-hidden bg-ink-100">
                    <img :src="comic.poster || '/images/no-image.webp'" :alt="`Cover of ${comic.title}`" class="aspect-[1920/2951] w-full object-cover" />
                    <span v-if="comic.featured" class="absolute left-3 top-3 bg-ink-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                      Featured
                    </span>
                  </div>
                  <div class="flex flex-1 flex-col p-4">
                    <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-ink-950/40">{{ comic.year }} · Issue {{ comic.issue }}</p>
                    <h4 class="font-display mt-1 text-lg font-black uppercase tracking-tight text-ink-950">{{ comic.title }}</h4>
                    <p class="mt-1 text-xs text-ink-950/40">{{ comic.id }}</p>
                    <span class="mt-3 inline-block w-fit border border-ink-950/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-950/70">
                      {{ comic.status }}
                    </span>
                    <div class="mt-auto flex gap-2 pt-4">
                      <button
                        @click="openEdit(comic)"
                        class="flex-1 border border-ink-950/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:border-ink-950"
                      >
                        Edit
                      </button>
                      <button
                        @click="remove(comic)"
                        class="border border-ink-950/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-950/50 transition-colors duration-300 hover:border-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Series Tab -->
      <div v-if="activeTab === 'series'">
        <div class="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div class="flex-1">
            <h2 class="text-sm font-bold uppercase tracking-[0.3em] text-ink-950/60">
              Series ({{ series.length }})
            </h2>
          </div>
          <button
            @click="openNewSeries"
            class="bg-ink-950 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:bg-ink-800"
          >
            + New series
          </button>
        </div>

        <!-- Cargando -->
        <div v-if="loading" class="mt-6 space-y-3">
          <div v-for="i in 3" :key="i" class="h-16 animate-pulse border border-ink-950/10"></div>
        </div>

        <!-- Lista vacía -->
        <div v-else-if="series.length === 0" class="mt-6 border border-ink-950/10 p-10 text-center">
          <p class="text-sm uppercase tracking-[0.25em] text-ink-950/40">No series yet. Create the first one.</p>
        </div>

        <!-- Lista de series -->
        <div v-else class="mt-6 space-y-3">
          <div v-for="s in series" :key="s.id" class="flex flex-col gap-3 border border-ink-950/10 py-4 px-4 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-4">
              <div class="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                <img v-if="s.logo" :src="s.logo" :alt="`Logo of ${s.name}`" class="h-full w-full object-cover" />
                <div v-else class="flex h-full w-full items-center justify-center text-ink-950/30">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 class="font-display text-lg font-black uppercase tracking-tight">{{ s.name }}</h4>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button
                @click="openEditSeries(s)"
                class="border border-ink-950/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:border-ink-950"
              >
                Edit
              </button>
              <button
                @click="removeSeries(s)"
                class="border border-ink-950/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-950/50 transition-colors duration-300 hover:border-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- Modal crear / editar serie -->
      <Teleport to="body">
        <Transition name="admin-modal">
          <div
            v-if="showSeriesForm"
            class="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/80 p-4 py-10 backdrop-blur-sm md:p-8"
            @click.self="cancelSeriesForm"
            role="dialog"
            aria-modal="true"
            :aria-label="editingSeriesId ? 'Edit series' : 'New series'"
          >
            <div class="w-full max-w-2xl border border-ink-950/15 bg-white text-ink-950">
              <div class="flex items-center justify-between border-b border-ink-950/10 px-6 py-5 md:px-8">
                <h2 class="font-display text-xl font-black uppercase tracking-tight">{{ editingSeriesId ? 'Edit series' : 'New series' }}</h2>
                <button
                  @click="cancelSeriesForm"
                  class="flex h-9 w-9 items-center justify-center border border-ink-950/20 text-sm text-ink-950/60 transition-colors duration-300 hover:border-ink-950 hover:text-ink-950"
                  aria-label="Close form"
                >
                  ×
                </button>
              </div>

              <div class="px-6 py-6 md:px-8">
                <div class="grid gap-6 md:grid-cols-2">
                  <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-ink-950/50 md:col-span-2">
                    Series Name *
                    <input
                      v-model="seriesForm.name"
                      placeholder="THE ORIGIN SAGA"
                      class="mt-2 w-full border border-ink-950/20 bg-transparent px-4 py-3 text-sm uppercase placeholder:text-ink-950/25 focus:border-ink-950 focus:outline-none"
                    />
                  </label>
                </div>

                <div class="mt-6 border border-ink-950/10 p-4">
                  <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-950/50">Series Logo</p>
                  <div class="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div class="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                      <img v-if="seriesForm.logo" :src="seriesForm.logo" alt="Logo preview" class="h-full w-full object-cover" />
                      <div v-else class="flex h-full w-full items-center justify-center text-ink-950/30">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1">
                      <label
                        class="inline-flex cursor-pointer border border-ink-950/30 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:border-ink-950"
                      >
                        {{ uploading ? 'Processing…' : 'Choose logo' }}
                        <input type="file" accept="image/*" class="hidden" :disabled="uploading" @change="onLogoSelected" />
                      </label>
                      <p class="mt-2 text-[11px] uppercase tracking-[0.2em] text-ink-950/35">
                        Square image recommended. Will be displayed in the comic detail.
                      </p>
                    </div>
                  </div>
                </div>

                <p v-if="error" class="mt-5 border border-red-500/40 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                  {{ error }}
                </p>

                <div class="mt-8 flex flex-wrap gap-3">
                  <button
                    @click="saveSeriesData"
                    :disabled="saving"
                    class="bg-ink-950 px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:bg-ink-800 disabled:opacity-50"
                  >
                    {{ saving ? 'Saving…' : 'Save series' }}
                  </button>
                  <button
                    @click="cancelSeriesForm"
                    class="border border-ink-950/20 px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-ink-950/60 transition-colors duration-300 hover:border-ink-950 hover:text-ink-950"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.admin-modal-enter-active,
.admin-modal-leave-active {
  transition: opacity 0.25s ease;
}
.admin-modal-enter-from,
.admin-modal-leave-to {
  opacity: 0;
}
</style>
