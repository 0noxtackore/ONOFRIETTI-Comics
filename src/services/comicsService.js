// Capa de datos de cómics.
// - Si Firebase está configurado (.env), lee el catálogo desde Firestore.
// - Si la BD está vacía o hay un error, usa data/comics.js como catálogo
//   de prueba (así la web funciona aunque aún no haya nada en la BD).
// Las portadas son enlaces de imagen (data URL o URL) guardados en el
// campo "poster" de cada documento; no se usa Firebase Storage.
import { getFirebase } from '../firebase/init'
import { comics as seedComics } from '../data/comics'
import { slugify, protagonistFromTitle } from '../utils/format'

let cached = null

// Normaliza un documento de Firestore a un cómic.
export function mapDoc(doc) {
  const d = doc.data()
  const num = (v) => (v === '' || v == null ? '' : Number(v))
  return {
    id: doc.id,
    slug: d.slug || slugify(d.title),
    title: d.title || '',
    protagonist: d.protagonist || protagonistFromTitle(d.title),
    issue: num(d.issue),
    year: num(d.year),
    pages: num(d.pages),
    status: d.status || 'Available',
    author: d.author || 'Angello Aponte',
    description: d.description || '',
    poster: d.poster || '',
    storagePath: d.storagePath || '',
    featured: Boolean(d.featured),
  }
}

// Devuelve el catálogo de cómics (de Firestore o el de prueba).
export async function fetchComics() {
  if (cached) return cached

  const fb = await getFirebase()
  if (!fb) return seedComics

  try {
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
    const q = query(collection(fb.db, 'comics'), orderBy('issue'))
    const snap = await getDocs(q)
    const list = snap.docs.map(mapDoc)

    // BD vacía: usa el catálogo local hasta que haya datos reales.
    if (list.length === 0) return seedComics

    cached = list
    return cached
  } catch (err) {
    console.error('No se pudo leer Firestore, usando catálogo local:', err)
    return seedComics
  }
}

// Devuelve un cómic por su slug (URL limpia /comics/<slug>).
export async function fetchComicBySlug(slug) {
  const fb = await getFirebase()
  if (fb) {
    try {
      const { collection, getDocs, query, where, limit } = await import('firebase/firestore')
      const q = query(collection(fb.db, 'comics'), where('slug', '==', slug), limit(1))
      const snap = await getDocs(q)
      if (!snap.empty) return mapDoc(snap.docs[0])
    } catch (err) {
      console.error('No se pudo leer el cómic por slug', slug, err)
    }
  }
  return seedComics.find((c) => c.slug === slug) || null
}

// Devuelve un cómic concreto por su ID (para compatibilidad / admin).
export async function fetchComicById(id) {
  const fb = await getFirebase()
  if (fb) {
    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const snap = await getDoc(doc(fb.db, 'comics', id))
      if (snap.exists()) return mapDoc(snap)
    } catch (err) {
      console.error('No se pudo leer el cómic', id, err)
    }
  }
  return seedComics.find((c) => c.id === id) || null
}
