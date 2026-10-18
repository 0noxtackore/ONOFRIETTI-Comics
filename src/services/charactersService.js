// Servicios para gestionar personajes (characters).
// Cada personaje tiene: id, name, slug, image (data URL), description.
import { getFirebase } from '../firebase/init'
import { t } from '../i18n'

// Mapea un documento de Firestore a un objeto plano.
function mapCharacterDoc(doc) {
  const data = doc.data()
  return { id: doc.id, ...data }
}

// Lista todos los personajes.
export async function listCharacters() {
  const fb = await getFirebase()
  if (!fb) return []
  const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
  const snap = await getDocs(query(collection(fb.db, 'characters'), orderBy('name')))
  return snap.docs.map(mapCharacterDoc)
}

// Obtiene un personaje por ID.
export async function getCharacterById(id) {
  const fb = await getFirebase()
  if (!fb) return null
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(fb.db, 'characters', id))
  return snap.exists() ? mapCharacterDoc(snap) : null
}

// Obtiene un personaje por slug.
export async function getCharacterBySlug(slug) {
  const fb = await getFirebase()
  if (!fb) return null
  const { collection, getDocs, query, where, limit } = await import('firebase/firestore')
  const snap = await getDocs(query(collection(fb.db, 'characters'), where('slug', '==', slug), limit(1)))
  return snap.empty ? null : mapCharacterDoc(snap.docs[0])
}

// Crea o actualiza un personaje.
export async function saveCharacter(id, data) {
  const fb = await getFirebase()
  if (!fb) throw new Error(t('errors.firebaseNotConfigured'))
  const { doc, setDoc } = await import('firebase/firestore')
  await setDoc(doc(fb.db, 'characters', id), data)
  return id
}

// Elimina un personaje.
export async function deleteCharacter(id) {
  const fb = await getFirebase()
  if (!fb) throw new Error(t('errors.firebaseNotConfigured'))
  const { doc, deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(fb.db, 'characters', id))
}

// Convierte una imagen a data URL para la foto del personaje.
export async function fileToCharacterImage(file, maxSize = 900) {
  const dataUrl = await compressImage(file, maxSize)
  if (dataUrl.length > 1000000) {
    throw new Error(t('errors.imageTooHeavyShort'))
  }
  return dataUrl
}

// Comprime una imagen sin recortar.
function compressImage(file, maxSize) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      try {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        URL.revokeObjectURL(url)
        if (canvas.toBlob) {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error(t('errors.processImageFailed')))
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result)
              reader.onerror = () => reject(new Error(t('errors.readImageFailed')))
              reader.readAsDataURL(blob)
            },
            'image/webp',
            0.85
          )
        } else {
          resolve(canvas.toDataURL('image/webp', 0.85))
        }
      } catch (err) {
        URL.revokeObjectURL(url)
        reject(err)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(t('errors.invalidImage')))
    }
    img.src = url
  })
}
