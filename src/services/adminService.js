// Servicios de escritura para el panel de administración (/admin).
// Crear, actualizar, eliminar cómics. Las portadas se convierten a un
// enlace de imagen (data URL) y se guardan en el propio documento de
// Firestore, así no hace falta Firebase Storage ni plan de pago.
// IMPORTANTE: solo funcionan si hay sesión iniciada (las reglas de
// Firestore rechazan escrituras sin usuario autenticado).
import { getFirebase } from '../firebase/init'
import { mapDoc } from './comicsService'

// Lista todos los cómics directo de Firestore (sin caché).
export async function listComics() {
  const fb = await getFirebase()
  if (!fb) return []
  const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
  const snap = await getDocs(query(collection(fb.db, 'comics'), orderBy('issue')))
  return snap.docs.map(mapDoc)
}

// Crea o reemplaza un cómic por completo. id = ID del documento.
export async function saveComic(id, data) {
  const fb = await getFirebase()
  if (!fb) throw new Error('Firebase no está configurado')
  const { doc, setDoc } = await import('firebase/firestore')
  await setDoc(doc(fb.db, 'comics', id), data)
  return id
}

// Elimina un cómic.
export async function deleteComic(id) {
  const fb = await getFirebase()
  if (!fb) throw new Error('Firebase no está configurado')
  const { doc, deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(fb.db, 'comics', id))
}

// Proporción de portada en la tarjeta (1920 x 2951).
const COVER_RATIO = 1920 / 2951

// Convierte una imagen (seleccionada o pegada) en un enlace de imagen
// comprimido (data URL webp). Devuelve { storagePath: '', poster }.
// La imagen se recorta al centro para ajustarse siempre a 1920x2951.
export async function fileToPoster(file, maxSize = 900) {
  const dataUrl = await compressImage(file, maxSize)
  if (dataUrl.length > 900000) {
    throw new Error('La imagen es demasiado pesada para Firestore. Usa una más pequeña (máx. ~1 MB).')
  }
  return { storagePath: '', poster: dataUrl }
}

// Rectángulo de recorte centrado para ajustar la imagen a la proporción.
function cropRect(w, h, ratio) {
  let sw = w
  let sh = Math.round(w / ratio)
  if (sh > h) {
    sh = h
    sw = Math.round(h * ratio)
  }
  return {
    sw,
    sh,
    sx: Math.round((w - sw) / 2),
    sy: Math.round((h - sh) / 2),
  }
}

// Recorta y comprime una imagen a data URL usando canvas.
function compressImage(file, maxSize) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      try {
        const { sw, sh, sx, sy } = cropRect(img.width, img.height, COVER_RATIO)
        const scale = Math.min(1, maxSize / Math.max(sw, sh))
        const w = Math.max(1, Math.round(sw * scale))
        const h = Math.max(1, Math.round(sh * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, w, h)
        URL.revokeObjectURL(url)
        if (canvas.toBlob) {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('No se pudo procesar la imagen'))
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result)
              reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
              reader.readAsDataURL(blob)
            },
            'image/webp',
            0.82
          )
        } else {
          resolve(canvas.toDataURL('image/webp', 0.82))
        }
      } catch (err) {
        URL.revokeObjectURL(url)
        reject(err)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('El archivo no es una imagen válida'))
    }
    img.src = url
  })
}
