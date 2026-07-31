<script setup>
// Panel de administración oculto en #/admin.
// - Requiere sesión con Firebase Authentication (Email/Contraseña).
// - Permite crear, editar, eliminar cómics y añadir portadas (imagen → enlace).
// Se accede solo escribiendo la URL manualmente: https://sitio/#/admin
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { isConfigured } from '../../firebase/init'
import { signInAdmin, signOutAdmin, onAdminAuth } from '../../firebase/auth'
import { listComics, saveComic, deleteComic, fileToPoster } from '../../services/adminService'

const STATUSES = ['Disponible', 'Edición limitada', 'Agotado', 'Próximamente']

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

const emptyForm = () => ({
  id: '',
  title: '',
  subtitle: '',
  issue: '',
  index: '',
  year: '',
  pages: '',
  status: 'Disponible',
  author: 'Angello Aponte',
  description: '',
  poster: '',
  storagePath: '',
  featured: false,
})
const form = reactive(emptyForm())

async function load() {
  loading.value = true
  error.value = ''
  try {
    comics.value = await listComics()
  } catch (e) {
    error.value = 'No se pudo cargar la lista: ' + e.message
  } finally {
    loading.value = false
  }
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
  if (!form.id.trim()) {
    error.value = 'El ID del documento es obligatorio (ej. el-origen).'
    return
  }
  if (!form.title.trim()) {
    error.value = 'El título es obligatorio.'
    return
  }
  const isEditing = Boolean(editingId.value)
  saving.value = true
  try {
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      issue: form.issue.trim(),
      index: form.index.trim(),
      year: form.year.trim(),
      pages: form.pages.trim(),
      status: form.status,
      author: form.author.trim() || 'Angello Aponte',
      description: form.description.trim(),
      poster: form.poster.trim(),
      storagePath: form.storagePath.trim(),
      featured: Boolean(form.featured),
    }
    await saveComic(form.id.trim(), payload)
    await load()
    showForm.value = false
    editingId.value = null
    notice.value = isEditing ? 'Cómic actualizado.' : 'Cómic creado.'
  } catch (e) {
    error.value = 'Error al guardar: ' + e.message
  } finally {
    saving.value = false
  }
}

async function remove(comic) {
  if (!window.confirm(`¿Eliminar "${comic.title}"? Esta acción no se puede deshacer.`)) return
  error.value = ''
  try {
    await deleteComic(comic.id)
    await load()
    if (editingId.value === comic.id) {
      showForm.value = false
      editingId.value = null
    }
    notice.value = 'Cómic eliminado.'
  } catch (e) {
    error.value = 'Error al eliminar: ' + e.message
  }
}

async function processCover(file) {
  error.value = ''
  if (!form.id.trim()) {
    error.value = 'Primero escribe el ID del documento.'
    return
  }
  uploading.value = true
  try {
    const { poster } = await fileToPoster(file)
    form.storagePath = ''
    form.poster = poster
    notice.value = 'Imagen convertida a enlace y lista para guardar.'
  } catch (err) {
    error.value = 'Error al procesar la imagen: ' + err.message
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
    error.value = 'Credenciales incorrectas.'
  } finally {
    busy.value = false
  }
}

async function logout() {
  await signOutAdmin()
  password.value = ''
}

function goToSite() {
  window.location.hash = ''
}

let unsubscribe = null
onMounted(async () => {
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
  if (unsubscribe) unsubscribe()
})

watch(notice, (v) => {
  if (v) setTimeout(() => (notice.value = ''), 3000)
})
</script>

<template>
  <div class="fixed inset-0 z-[100] overflow-y-auto bg-black text-white antialiased">
    <!-- Aviso: Firebase no configurado -->
    <div v-if="!isConfigured" class="flex min-h-screen items-center justify-center p-8">
      <p class="max-w-md border border-white/15 p-8 text-center text-sm uppercase tracking-[0.25em] text-white/60">
        Firebase no está configurado. Completa el archivo <span class="font-bold text-white">.env</span> para usar el panel.
      </p>
    </div>

    <!-- Pantalla de login -->
    <div v-else-if="!user" class="flex min-h-screen items-center justify-center p-8">
      <form class="w-full max-w-sm border border-white/15 p-10" @submit.prevent="login">
        <p class="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Sistema restringido</p>
        <h1 class="font-display mt-2 text-2xl font-black uppercase tracking-tight text-white">Acceso admin</h1>

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
          Contraseña
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
          {{ busy ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
    </div>

    <!-- Panel -->
    <div v-else class="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <header class="flex flex-col gap-4 border-b border-white/15 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Sesión iniciada · {{ user.email }}</p>
          <h1 class="font-display mt-1 text-3xl font-black uppercase tracking-tight">Panel de cómics</h1>
        </div>
        <div class="flex gap-3">
          <button
            @click="goToSite"
            class="border border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:border-white"
          >
            Volver al sitio
          </button>
          <button
            @click="logout"
            class="border border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-white/50 transition-colors duration-300 hover:border-white hover:text-white"
          >
            Salir
          </button>
        </div>
      </header>

      <p v-if="notice" class="mt-5 border border-white/40 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black">
        {{ notice }}
      </p>
      <p v-if="error" class="mt-5 border border-red-400/40 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
        {{ error }}
      </p>

      <div class="mt-8 flex items-center justify-between">
        <h2 class="text-sm font-bold uppercase tracking-[0.3em] text-white/60">Catálogo ({{ comics.length }})</h2>
        <button
          @click="openNew"
          class="bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors duration-300 hover:bg-white/80"
        >
          + Nuevo cómic
        </button>
      </div>

      <!-- Cargando -->
      <div v-if="loading" class="mt-6 space-y-3">
        <div v-for="i in 3" :key="i" class="h-16 animate-pulse border border-white/10"></div>
      </div>

      <!-- Lista vacía -->
      <div v-else-if="comics.length === 0" class="mt-6 border border-white/10 p-10 text-center">
        <p class="text-sm uppercase tracking-[0.25em] text-white/40">No hay cómics todavía. Crea el primero.</p>
      </div>

      <!-- Lista de cómics -->
      <div v-else class="mt-6 divide-y divide-white/10 border-y border-white/10">
        <div v-for="comic in comics" :key="comic.id" class="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-4">
            <div class="h-16 w-11 shrink-0 overflow-hidden bg-ink-900">
              <img :src="comic.poster || '/images/no-image.webp'" :alt="`Portada de ${comic.title}`" class="h-full w-full object-cover" />
            </div>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">{{ comic.issue }} — {{ comic.year }}</p>
              <h3 class="font-display text-lg font-black uppercase tracking-tight">{{ comic.title }}</h3>
              <p class="text-xs text-white/50">{{ comic.id }} · {{ comic.subtitle }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
              {{ comic.status }}
            </span>
            <span v-if="comic.featured" class="border border-white bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black">
              Destacado
            </span>
            <button
              @click="openEdit(comic)"
              class="border border-white/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:border-white"
            >
              Editar
            </button>
            <button
              @click="remove(comic)"
              class="border border-white/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 transition-colors duration-300 hover:border-red-400 hover:text-red-400"
            >
              Borrar
            </button>
          </div>
        </div>
      </div>

      <!-- Formulario crear / editar -->
      <div v-if="showForm" class="mt-10 border border-white/15 p-6 md:p-8" @paste="onPaste">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-xl font-black uppercase tracking-tight">{{ editingId ? 'Editar cómic' : 'Nuevo cómic' }}</h2>
          <button @click="cancelForm" class="text-xs font-bold uppercase tracking-[0.25em] text-white/40 hover:text-white">Cerrar ×</button>
        </div>

        <div class="mt-6 grid gap-6 md:grid-cols-3">
          <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            ID del documento
            <input
              v-model="form.id"
              :disabled="!!editingId"
              placeholder="el-origen"
              class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm placeholder:text-white/25 focus:border-white focus:outline-none disabled:opacity-40"
            />
          </label>
          <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            Título *
            <input
              v-model="form.title"
              placeholder="El Origen"
              class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm placeholder:text-white/25 focus:border-white focus:outline-none"
            />
          </label>
          <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            Subtítulo
            <input
              v-model="form.subtitle"
              placeholder="Libro Uno"
              class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm placeholder:text-white/25 focus:border-white focus:outline-none"
            />
          </label>
          <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            Número
            <input
              v-model="form.issue"
              placeholder="Nº 01"
              class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm placeholder:text-white/25 focus:border-white focus:outline-none"
            />
          </label>
          <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            Índice (orden)
            <input
              v-model="form.index"
              placeholder="01"
              class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm placeholder:text-white/25 focus:border-white focus:outline-none"
            />
          </label>
          <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            Año
            <input
              v-model="form.year"
              placeholder="2026"
              class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm placeholder:text-white/25 focus:border-white focus:outline-none"
            />
          </label>
          <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            Páginas
            <input
              v-model="form.pages"
              placeholder="32"
              class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm placeholder:text-white/25 focus:border-white focus:outline-none"
            />
          </label>
          <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            Autor / Artista
            <input
              v-model="form.author"
              placeholder="Angello Aponte"
              class="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-sm placeholder:text-white/25 focus:border-white focus:outline-none"
            />
          </label>
          <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            Estado
            <select
              v-model="form.status"
              class="mt-2 w-full border border-white/20 bg-black px-4 py-3 text-sm text-white focus:border-white focus:outline-none"
            >
              <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label class="flex cursor-pointer items-center gap-3 self-end pb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            <input v-model="form.featured" type="checkbox" class="h-4 w-4 accent-white" />
            Destacado
          </label>
          <label class="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 md:col-span-3">
            Descripción
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Sinopsis del cómic, se muestra en la ficha del producto…"
              class="mt-2 w-full resize-y border border-white/20 bg-transparent px-4 py-3 text-sm leading-relaxed placeholder:text-white/25 focus:border-white focus:outline-none"
            ></textarea>
          </label>
        </div>

        <div class="mt-6 border border-white/10 p-4">
          <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Portada (se convierte a enlace de imagen)</p>
          <div class="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div class="w-24 shrink-0 overflow-hidden bg-ink-900">
              <img :src="form.poster || '/images/no-image.webp'" alt="Vista previa de la portada" class="aspect-[1920/2951] w-full object-cover" />
            </div>
            <div class="flex-1">
              <label
                class="inline-flex cursor-pointer border border-white/30 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:border-white"
              >
                {{ uploading ? 'Procesando…' : 'Elegir imagen' }}
                <input type="file" accept="image/*" class="hidden" :disabled="uploading" @change="onCoverSelected" />
              </label>
              <p class="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/35">
                O pega un captura con Ctrl+V. La imagen se comprime y se guarda dentro del propio cómic.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-8 flex flex-wrap gap-3">
          <button
            @click="save"
            :disabled="saving"
            class="bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors duration-300 hover:bg-white/80 disabled:opacity-50"
          >
            {{ saving ? 'Guardando…' : 'Guardar cómic' }}
          </button>
          <button
            @click="cancelForm"
            class="border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] text-white/60 transition-colors duration-300 hover:border-white hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
