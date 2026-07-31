// Autenticación del panel de administración (#/admin).
// Usa Firebase Authentication con Email/Contraseña. Solo si hay sesión
// iniciada las reglas de Firestore/Storage permiten escribir.
import { getFirebase } from './init'

let auth = null

async function getAuth() {
  const fb = await getFirebase()
  if (!fb) return null
  if (!auth) {
    const { getAuth } = await import('firebase/auth')
    auth = getAuth(fb.app)
  }
  return auth
}

// Inicia sesión como administrador.
export async function signInAdmin(email, password) {
  const a = await getAuth()
  if (!a) throw new Error('Firebase no está configurado')
  const { signInWithEmailAndPassword } = await import('firebase/auth')
  await signInWithEmailAndPassword(a, email, password)
}

// Cierra la sesión de administrador.
export async function signOutAdmin() {
  const a = await getAuth()
  if (!a) return
  const { signOut } = await import('firebase/auth')
  await signOut(a)
}

// Devuelve el usuario con sesión activa (o null).
export async function getCurrentUser() {
  const a = await getAuth()
  if (!a) return null
  return a.currentUser
}

// Observa el estado de sesión: recibe el usuario (o null) en cada cambio.
// Devuelve una función para desuscribirse.
export async function onAdminAuth(cb) {
  const a = await getAuth()
  if (!a) return () => {}
  const { onAuthStateChanged } = await import('firebase/auth')
  return onAuthStateChanged(a, cb)
}
