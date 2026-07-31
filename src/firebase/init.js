// Inicialización diferida y compartida de Firebase.
// Todos los módulos (comicsService, adminService, auth) usan esta única
// instancia, así solo se importa el SDK una vez y solo cuando hay .env.
// Nota: no se usa Firebase Storage; las portadas se guardan como enlaces
// de imagen (data URL) dentro del propio documento de Firestore.
import { firebaseConfig, isConfigured } from './config'

let app = null
let db = null

// Devuelve { app, db } o null si Firebase no está configurado.
async function getFirebase() {
  if (!isConfigured) return null
  if (!app) {
    const { initializeApp } = await import('firebase/app')
    app = initializeApp(firebaseConfig)
  }
  if (!db) {
    const { getFirestore } = await import('firebase/firestore')
    db = getFirestore(app)
  }
  return { app, db }
}

export { getFirebase, firebaseConfig, isConfigured }
