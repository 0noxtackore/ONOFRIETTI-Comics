<p align="center">
  <img src="/images/logo-solid.png" alt="Onofrietti Comics" width="100%" />
</p>

# Onofrietti Comics

Sitio web de Onofrietti Comics — historias dibujadas a tinta desde 1998. Una tienda digital de cómics independientes con catálogo, detalle de cada ejemplar y panel de administración para gestionar el contenido.

## Características

- **Catálogo de cómics** con búsqueda y filtrado por protagonista.
- **Ficha de detalle** con portada, año, autor, páginas y enlaces para compartir.
- **Panel de administración** protegido por autenticación de Firebase para dar de alta y gestionar cómics.
- **Diseño monocromático** (negro / grises / blanco) con tipografía industrial *Archivo*, grano de película y micro-interacciones en hover.
- **Imágenes lazy-loaded** para un renderizado más fluido.

## Tecnologías

| Área       | Tecnología                              |
| ---------- | --------------------------------------- |
| Framework  | Vue 3 (Composition API, `<script setup>`) |
| Build      | Vite                                    |
| Estilos    | Tailwind CSS                            |
| Backend    | Firebase (Firestore + Storage + Auth)   |
| Testing    | Vitest                                  |
| Despliegue | Netlify                                 |

## Requisitos

- Node.js 18 o superior.
- npm.
- Un proyecto de Firebase con Firestore, Storage y Authentication habilitados.

## Configuración

1. Cloná el repositorio:
   ```bash
   git clone https://github.com/0noxtackore/ONOFRIETTI-Comics.git
   cd ONOFRIETTI-Comics
   ```

2. Instalá las dependencias:
   ```bash
   npm install
   ```

3. Creá un archivo `.env` en la raíz con las credenciales públicas de tu proyecto Firebase:
   ```env
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu-proyecto
   VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```
   Estas variables son solo configuración pública del cliente; nunca incluyas credenciales privadas de administración.

## Scripts

| Comando             | Descripción                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Servidor de desarrollo con recarga en caliente |
| `npm run build`     | Compilación de producción                |
| `npm run preview`   | Vista previa de la compilación           |
| `npm run test`      | Ejecuta la suite de tests (Vitest)       |

## Rutas

El sitio usa rutas por hash y renderizado del lado del cliente (SPA).

| Ruta          | Descripción                                             |
| ------------- | ------------------------------------------------------- |
| `/`           | Página principal: hero + catálogo de cómics.            |
| `/#/comics/<slug>` | Ficha de detalle de un cómic.                       |
| `/#/admin`    | Panel de administración (requiere sesión de Firebase).  |

## Estructura del proyecto

```
src/
├── components/
│   ├── admin/        # Panel de administración
│   ├── comic/        # Card, portada y detalle del cómic
│   ├── layout/       # Header, footer y menú móvil
│   ├── sections/     # Hero y catálogo de cómics
│   └── ui/           # Logo y componentes de interfaz
├── composables/      # Estado compartido (catálogo, menú, scroll)
├── services/         # Integración con Firebase
└── App.vue           # Enrutador por hash y estructura raíz
```

## Licencia

[MIT](LICENSE) © 2026 0noxtackore
