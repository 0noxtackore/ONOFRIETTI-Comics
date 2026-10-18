// Detección de idioma por IP (geolocalización) y por navegador.
// No hay backend, así que consultamos APIs públicas de geolocalización por IP
// directamente desde el navegador. Si todas fallan, se cae al idioma del
// navegador (navigator.language).

// Países cuyo idioma principal es el español (ISO 3166-1 alfa-2).
export const SPANISH_SPEAKING_COUNTRIES = new Set([
  'AR', // Argentina
  'BO', // Bolivia
  'CL', // Chile
  'CO', // Colombia
  'CR', // Costa Rica
  'CU', // Cuba
  'DO', // República Dominicana
  'EC', // Ecuador
  'ES', // España
  'GQ', // Guinea Ecuatorial
  'GT', // Guatemala
  'HN', // Honduras
  'MX', // México
  'NI', // Nicaragua
  'PA', // Panamá
  'PE', // Perú
  'PR', // Puerto Rico
  'PY', // Paraguay
  'SV', // El Salvador
  'UY', // Uruguay
  'VE', // Venezuela
])

// APIs públicas (HTTPS, con CORS) para obtener el país a partir de la IP.
// Se prueban en orden hasta que una responda.
const ENDPOINTS = [
  { url: 'https://ipwho.is/', pick: (d) => (d && d.success !== false ? d.country_code : null) },
  { url: 'https://api.country.is/', pick: (d) => (d ? d.country : null) },
  { url: 'https://ipapi.co/json/', pick: (d) => (d ? d.country_code : null) },
]

// fetch con timeout para no bloquear la detección si una API no responde.
async function fetchWithTimeout(url, ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// Devuelve el código de país (ISO 3166-1 alfa-2, en mayúsculas) o null.
export async function detectCountryCode() {
  for (const { url, pick } of ENDPOINTS) {
    const data = await fetchWithTimeout(url, 4000)
    const code = pick(data)
    if (typeof code === 'string' && /^[a-zA-Z]{2}$/.test(code)) {
      return code.toUpperCase()
    }
  }
  return null
}

// ¿El país es hispanohablante?
export function isSpanishSpeakingCountry(code) {
  return SPANISH_SPEAKING_COUNTRIES.has(String(code || '').toUpperCase())
}

// Idioma a partir del país: 'es' para países hispanohablantes, 'en' para el resto.
export function localeForCountry(code) {
  return isSpanishSpeakingCountry(code) ? 'es' : 'en'
}

// Idioma preferido del navegador (fallback). Español si aparece en la lista,
// inglés si aparece, y 'en' por defecto.
export function browserLocale() {
  const list =
    typeof navigator !== 'undefined'
      ? navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language]
      : []

  for (const lang of list) {
    const lower = String(lang || '').toLowerCase()
    if (lower.startsWith('es')) return 'es'
    if (lower.startsWith('en')) return 'en'
  }
  return 'en'
}
