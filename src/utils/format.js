// Formatea el número de cómic para mostrarlo (ej. 1 → "#1").
export function formatIssue(issue) {
  const n = Number(issue)
  if (!Number.isFinite(n) || n <= 0) return ''
  return `#${n}`
}

// Convierte un texto a slug URL-friendly (ej. "El Origen" → "el-origen").
export function slugify(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
