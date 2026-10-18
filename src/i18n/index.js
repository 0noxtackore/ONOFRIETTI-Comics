// Sistema de internacionalización (i18n) ligero, sin dependencias externas.
// - Idioma reactivo compartido (ref) → los componentes se actualizan solos.
// - Detección por IP: países hispanohablantes → español, resto → inglés.
// - Fallback al idioma del navegador si la IP no se puede resolver.
// - Selector manual que se guarda en localStorage y tiene prioridad sobre la IP.
import { ref } from 'vue'
import { messages } from './messages'
import { detectCountryCode, localeForCountry, browserLocale } from './geo'

export const SUPPORTED_LOCALES = ['es', 'en']
export const DEFAULT_LOCALE = 'en'

const STORAGE_KEY = 'onofrietti-locale'

// Idioma actual (reactivo). Empieza en inglés hasta que se resuelve.
const locale = ref(DEFAULT_LOCALE)

// true cuando el usuario eligió idioma manualmente (no se sobreescribe con la IP).
let userChosen = false

function isSupported(value) {
  return SUPPORTED_LOCALES.includes(value)
}

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStored(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // localStorage no disponible (modo privado, etc.)
  }
}

// Resuelve una clave con notación de puntos dentro de un objeto de mensajes.
function resolve(source, key) {
  return key.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), source)
}

// Traduce una clave para un idioma concreto, con interpolación de {params}.
export function translate(targetLocale, key, params) {
  let value = resolve(messages[targetLocale], key)
  if (value == null) value = resolve(messages[DEFAULT_LOCALE], key)
  if (value == null) return key
  if (typeof value === 'string' && params) {
    return value.replace(/\{(\w+)\}/g, (match, name) =>
      params[name] != null ? String(params[name]) : match
    )
  }
  return value
}

// Traducción usando el idioma activo. Lee locale.value → reactivo en plantillas.
export function t(key, params) {
  return translate(locale.value, key, params)
}

// Estados de cómic (los datos guardan los valores en inglés): traduce solo al mostrar.
const STATUS_KEYS = {
  Available: 'status.available',
  'Limited Edition': 'status.limited',
  'Sold Out': 'status.soldOut',
  'Coming Soon': 'status.comingSoon',
}

export function tStatus(status) {
  return t(STATUS_KEYS[status] || status)
}

// Sincroniza <html lang>, el título y la meta descripción del documento.
function applyDocumentLocale() {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('lang', locale.value)
  const meta = messages[locale.value] && messages[locale.value].meta
  if (meta) {
    if (meta.title) document.title = meta.title
    const desc = document.querySelector('meta[name="description"]')
    if (desc && meta.description) desc.setAttribute('content', meta.description)
  }
}

// Cambia el idioma. Si persist=true (elección manual), se guarda y deja de
// ser sobreescrito por la detección por IP.
export function setLocale(value, { persist = true } = {}) {
  if (!isSupported(value)) return
  if (persist) {
    userChosen = true
    writeStored(value)
  }
  if (locale.value !== value) locale.value = value
  applyDocumentLocale()
}

// Parte síncrona: preferencia guardada o, si no, idioma del navegador.
// Se llama antes de montar la app para evitar parpadeos.
export function setupI18n() {
  const saved = readStored()
  if (isSupported(saved)) {
    userChosen = true
    locale.value = saved
  } else {
    locale.value = browserLocale()
  }
  applyDocumentLocale()
  return locale.value
}

// Parte asíncrona: consulta la IP y decide el idioma según el país.
// No sobreescribe una elección manual del usuario.
export async function detectLocaleByIp() {
  if (userChosen) return locale.value
  const country = await detectCountryCode()
  if (userChosen || !country) return locale.value
  const next = localeForCountry(country)
  if (next !== locale.value) {
    locale.value = next
    applyDocumentLocale()
  }
  return locale.value
}

// Composable para usar en los componentes.
export function useI18n() {
  return {
    locale,
    t,
    tStatus,
    setLocale,
    availableLocales: SUPPORTED_LOCALES,
  }
}
