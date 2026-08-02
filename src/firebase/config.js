// Configuración de Firebase.
// Los valores se leen de variables de entorno (archivo .env en la raíz del proyecto).
// Pasos para activar la BD:
//   1. Crea un proyecto en https://console.firebase.google.com
//   2. Añade una app web y copia los valores de su configuración
//   3. Copia .env.example a .env y completa los VITE_FIREBASE_*
//   4. En la consola crea la colección "comics"
//   5. Activa Authentication (Email/Contraseña) y crea tu usuario admin.
//      Reglas: Firestore/Storage -> read público, write solo con sesión.
//   6. Gestiona el catálogo desde el panel oculto: https://sitio/admin
//
// Esquema recomendado para cada documento de la colección "comics":
//   {
//     title: "Reyes de la Noche",
//     issue: 5,                   // Número del cómic (número; se muestra "Issue #5")
//     year: 2026,                 // Año (número)
//     pages: 40,                  // Páginas (número)
//     status: "Coming Soon",        // Available | Limited Edition | Sold Out | Coming Soon
//     poster: "",                 // URL directa de portada (opcional)
//     storagePath: "covers/xxx.webp", // Portada subida a Storage (opcional)
//     featured: false             // Cómic destacado del hero
//   }

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

// true cuando el .env está configurado.
// Si no hay configuración, la app usa el catálogo local de prueba.
const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export { firebaseConfig, isConfigured }
