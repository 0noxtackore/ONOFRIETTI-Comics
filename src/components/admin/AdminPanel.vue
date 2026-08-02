<script setup>
// Panel de administración oculto en /admin.
// - Requiere sesión con Firebase Authentication (Email/Contraseña).
// - Permite crear, editar, eliminar cómics y añadir portadas (imagen → enlace).
// Se accede solo escribiendo la URL manualmente: https://sitio/admin
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { isConfigured } from '../../firebase/init'
import { signInAdmin, signOutAdmin, onAdminAuth } from '../../firebase/auth'
import { listComics, saveComic, deleteComic, fileToPoster } from '../../services/adminService'
import { navigate } from '../../utils/router'

const STATUSES = ['Available', 'Limited Edition', 'Sold Out', 'Coming Soon']

const user = ref(null)
const comics = ref([])
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const showForm = ref(false)
const editingId = ref(null)
const error = ref('')
const notice = ref('')

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
})
const form = reactive(emptyForm())

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
    comics.value = await listComics()
  } catch (e) {
    error.value = 'Could not load the list: ' + e.message
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
  <div class="fixed inset-0 z-[100] overflow-y-auto bg-black text-white antialiased">
    <!-- Aviso: Firebase no configurado -->
    <div v-if="!isConfigured" class="flex min-h-screen items-center justify-center p-8">
      <p class="max-w-md border border-white/15 p-8 text-center text-sm uppercase tracking-[0.25em] text-white/60">
        Firebase is not configured. Complete the <span class="font-bold text-white">.env</span> file to use the panel.
      </p>
    </div>

    <!-- Pantalla de login -->
    <div v-else-if="!user" class="flex min-h-screen items-center justify-center p-8">
      <form class="w-full max-w-sm border border-white/15 p-10" @submit.prevent="login">
        <p class="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Restricted system</p>
        <h1 class="font-display mt-2 text-2xl font-black uppercase tracking-tight text-white">Admin access</h1>

        <label class="mt-8 block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
          Email
          <input
            v-model="email"
            type="email"
            required
            autocomplete="username"
            placeholder="admin@onofrietti.com"
            class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-white focus:outline-none"
          />
        </label>

        <label class="mt-5 block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
          Password
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-white focus:outline-none"
          />
        </label>

        <p v-if="error" class="mt-4 text-xs uppercase tracking-[0.2em] text-red-400">{{ error }}</p>

        <button
          type="submit"
          :disabled="busy"
          class="mt-8 w-full bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors duration-300 hover:bg-white/80 disabled:opacity-50"
        >
          {{ busy ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>

    <!-- Panel -->
    <div v-else class="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <header class="flex flex-col gap-4 border-b border-white/15 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Signed in as · {{ user.email }}</p>
          <h1 class="font-display mt-1 text-3xl font-black uppercase tracking-tight">Comics panel</h1>
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
      </header>

      <p v-if="notice" class="mt-5 border border-white/40 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black">
        {{ notice }}
      </p>
      <p v-if="error" class="mt-5 border border-red-400/40 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
        {{ error }}
      </p>

      <div class="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div class="flex-1">
          <h2 class="text-sm font-bold uppercase tracking-[0.3em] text-white/60">
            Catalog ({{ filteredComics.length }} / {{ comics.length }})
          </h2>
          <div class="relative mt-3 max-w-md">
            <input
              v-model="search"
              type="search"
              placeholder="Search by title, character, ID, issue, status…"
              class="w-full border border-white/20 bg-transparent py-3 pl-4 pr-10 text-sm text-white placeholder:text-white/25 focus:border-white focus:outline-none"
            />
            <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white/40">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-binoculars-fill" viewBox="0 0 16 16">
                <path d="M4.5 1A1.5 1.5 0 0 0 3 2.5V3h4v-.5A1.5 1.5 0 0 0 5.5 1zM7 4v1h2V4h4v.882a.5.5 0 0 0 .276.447l.895.447A1.5 1.5 0 0 1 15 7.118V13H9v-1.5a.5.5 0 0 1 .146-.354l.854-.853V9.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v.793l.854.853A.5.5 0 0 1 7 11.5V13H1V7.118a1.5 1.5 0 0 1 .83-1.342l.894-.447A.5.5 0 0 0 3 4.882V4zM1 14v.5A1.5 1.5 0 0 0 2.5 16h3A1.5 1.5 0 0 0 7 14.5V14zm8 0v.5a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5V14zm4-11H9v-.5A1.5 1.5 0 0 1 10.5 1h1A1.5 1.5 0 0 1 13 2.5z"/>
              </svg>
            </span>
          </div>
        </div>
        <button
          @click="openNew"
          class="bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors duration-300 hover:bg-white/80"
        >
          + New comic
        </button>
      </div>

      <!-- Cargando -->
      <div v-if="loading" class="mt-6 space-y-3">
        <div v-for="i in 3" :key="i" class="h-16 animate-pulse border border-white/10"></div>
      </div>

      <!-- Lista vacía -->
      <div v-else-if="comics.length === 0" class="mt-6 border border-white/10 p-10 text-center">
        <p class="text-sm uppercase tracking-[0.25em] text-white/40">No comics yet. Create the first one.</p>
      </div>

      <!-- Sin resultados de búsqueda -->
      <div v-else-if="filteredComics.length === 0" class="mt-6 border border-white/10 p-10 text-center">
        <p class="text-sm uppercase tracking-[0.25em] text-white/40">No comics match your search.</p>
      </div>

      <!-- Lista de cómics agrupada por protagonista -->
      <div v-else class="mt-6 space-y-3">
        <section v-for="group in groups" :key="group.name" class="border border-white/10">
          <button
            type="button"
            @click="toggleGroup(group.name)"
            class="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors duration-300 hover:bg-white/5"
          >
            <span class="flex items-center gap-3">
              <span class="text-xs font-bold uppercase tracking-[0.3em] text-white">{{ group.name }}</span>
              <span class="text-[11px] uppercase tracking-[0.2em] text-white/40">{{ group.items.length }} issues</span>
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-3 w-3 text-white/50 transition-transform duration-300"
              :class="isGroupOpen(group.name) ? 'rotate-180' : ''"
            >
              <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
            </svg>
          </button>
          <div v-if="isGroupOpen(group.name)" class="divide-y divide-white/10 border-t border-white/10">
            <div v-for="comic in group.items" :key="comic.id" class="flex flex-col gap-3 py-4 px-4 md:flex-row md:items-center md:justify-between">
              <div class="flex items-center gap-4">
                <div class="h-16 w-11 shrink-0 overflow-hidden bg-ink-900">
                  <img :src="comic.poster || '/images/no-image.webp'" :alt="`Cover of ${comic.title}`" class="h-full w-full object-cover" />
                </div>
                <div>
                  <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">{{ comic.year }}</p>
                  <h4 class="font-display text-lg font-black uppercase tracking-tight">{{ comic.title }}</h4>
                  <p class="text-xs text-white/50">{{ comic.id }} · Issue {{ comic.issue }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                  {{ comic.status }}
                </span>
                <span v-if="comic.featured" class="border border-white bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                  Featured
                </span>
                <button
                  @click="openEdit(comic)"
                  class="border border-white/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:border-white"
                >
                  Edit
                </button>
                <button
                  @click="remove(comic)"
                  class="border border-white/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 transition-colors duration-300 hover:border-red-400 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Modal crear / editar cómic -->
      <Teleport to="body">
        <Transition name="admin-modal">
          <div
            v-if="showForm"
            class="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-black/80 p-4 py-10 backdrop-blur-sm md:p-8"
            @click.self="cancelForm"
            role="dialog"
            aria-modal="true"
            :aria-label="editingId ? 'Edit comic' : 'New comic'"
          >
            <div class="w-full max-w-3xl border border-white/15 bg-ink-950" @paste="onPaste">
              <div class="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-8">
                <h2 class="font-display text-xl font-black uppercase tracking-tight">{{ editingId ? 'Edit comic' : 'New comic' }}</h2>
                <button
                  @click="cancelForm"
                  class="flex h-9 w-9 items-center justify-center border border-white/20 text-sm text-white/60 transition-colors duration-300 hover:border-white hover:text-white"
                  aria-label="Close form"
                >
                  ×
                </button>
              </div>

              <div class="px-6 py-6 md:px-8">
                <div class="grid gap-6 md:grid-cols-3">
                  <p class="text-[10px] uppercase tracking-[0.3em] text-white/40 md:col-span-3">
                    Product ID (auto-generated): <span class="font-bold text-white">{{ generatedId() || '…' }}</span>
                  </p>
                  <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                    Title *
                    <input
                      v-model="form.title"
                      placeholder="The Origin"
                      class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm placeholder:text-white/25 focus:border-white focus:outline-none"
                    />
                  </label>
                  <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                    Character / Protagonist (auto: without "THE")
                    <input
                      v-model="form.protagonist"
                      placeholder="TUTEQUE-MAN"
                      class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm placeholder:text-white/25 focus:border-white focus:outline-none"
                    />
                  </label>
                  <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                    Issue ({{ form.issue }})
                    <input
                      v-model.number="form.issue"
                      type="number"
                      min="1"
                      placeholder="1"
                      class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm placeholder:text-white/25 focus:border-white focus:outline-none"
                    />
                  </label>
                  <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                    Year (current year detected, editable)
                    <input
                      v-model.number="form.year"
                      type="number"
                      min="1900"
                      max="2100"
                      placeholder="2026"
                      class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm placeholder:text-white/25 focus:border-white focus:outline-none"
                    />
                  </label>
                  <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                    Pages
                    <input
                      v-model.number="form.pages"
                      type="number"
                      min="1"
                      placeholder="32"
                      class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm placeholder:text-white/25 focus:border-white focus:outline-none"
                    />
                  </label>
                  <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                    Author / Artist
                    <input
                      v-model="form.author"
                      placeholder="Angello Aponte"
                      class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm placeholder:text-white/25 focus:border-white focus:outline-none"
                    />
                  </label>
                  <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                    Status
                    <select
                      v-model="form.status"
                      class="mt-2 w-full border border-white/20 bg-black px-4 py-3 text-sm text-white focus:border-white focus:outline-none"
                    >
                      <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
                    </select>
                  </label>
                  <label class="flex cursor-pointer items-center gap-3 self-end pb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                    <input v-model="form.featured" type="checkbox" class="h-4 w-4 accent-white" />
                    Featured
                  </label>
                  <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 md:col-span-3">
                    Description
                    <textarea
                      v-model="form.description"
                      rows="3"
                      placeholder="Comic synopsis, shown on the product page…"
                      class="mt-2 w-full resize-y border border-white/20 bg-transparent px-4 py-3 text-sm leading-relaxed placeholder:text-white/25 focus:border-white focus:outline-none"
                    ></textarea>
                  </label>
                </div>

                <div class="mt-6 border border-white/10 p-4">
                  <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Cover (converted to image link)</p>
                  <div class="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div class="w-24 shrink-0 overflow-hidden bg-ink-900">
                      <img :src="form.poster || '/images/no-image.webp'" alt="Cover preview" class="aspect-[1920/2951] w-full object-cover" />
                    </div>
                    <div class="flex-1">
                      <label
                        class="inline-flex cursor-pointer border border-white/30 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:border-white"
                      >
                        {{ uploading ? 'Processing…' : 'Choose image' }}
                        <input type="file" accept="image/*" class="hidden" :disabled="uploading" @change="onCoverSelected" />
                      </label>
                      <p class="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/35">
                        Or paste a screenshot with Ctrl+V. The image is compressed and stored inside the comic itself.
                      </p>
                    </div>
                  </div>
                </div>

                <p v-if="error" class="mt-5 border border-red-400/40 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                  {{ error }}
                </p>

                <div class="mt-8 flex flex-wrap gap-3">
                  <button
                    @click="save"
                    :disabled="saving"
                    class="bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors duration-300 hover:bg-white/80 disabled:opacity-50"
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
