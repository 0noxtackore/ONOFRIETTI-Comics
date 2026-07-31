// Capa de datos de cómics.
// - Si Firebase está configurado (.env), lee el catálogo desde Firestore.
// - Si la BD está vacía o hay un error, usa data/comics.js como catálogo
//   de prueba (así la web funciona aunque aún no haya nada en la BD).
// Las portadas son enlaces de imagen (data URL o URL) guardados en el
// campo "poster" de cada documento; no se usa Firebase Storage.
import { getFirebase } from '../firebase/init'
import { comics as seedComics } from '../data/comics'

let cached = null

// Normaliza un documento de Firestore a un cómic.
export function mapDoc(doc) {
  const d = doc.data()
  return {
    id: doc.id,
    title: d.title || '',
    subtitle: d.subtitle || '',
    issue: d.issue || '',
    index: d.index || '',
    year: d.year || '',
    pages: d.pages || '',
    status: d.status || 'Disponible',
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
    const q = query(collection(fb.db, 'comics'), orderBy('index'))
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

// Devuelve un cómic concreto por su ID (desde Firestore o el catálogo local).
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
