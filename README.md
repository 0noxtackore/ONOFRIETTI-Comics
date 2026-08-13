<p align="center">
  <img src="public/images/logo-solid.png" alt="Onofrietti Comics" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3-42b883" />
  <img src="https://img.shields.io/badge/Vite-6-646cff" />
  <img src="https://img.shields.io/badge/Tailwind-3-38bdf8" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28" />
  <img src="https://img.shields.io/badge/Vitest-4-e1c400" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

# Onofrietti Comics

Official website of Onofrietti Comics — a young independent comics studio founded in 2026. A digital comics store with a catalog, a detail page for each issue and an admin panel to manage content.

## Features

- **Comics catalog** with search and filtering by protagonist.
- **Detail sheet** with cover, year, author, pages and share links.
- **Admin panel** protected by Firebase authentication to create and manage comics.
- **Monochrome design** (black / grays / white) with industrial *Archivo* typography, film grain and micro-interactions on hover.
- **Lazy-loaded images** for smoother rendering.

## Tech Stack

| Area       | Technology                              |
| ---------- | --------------------------------------- |
| Framework  | Vue 3 (Composition API, `<script setup>`) |
| Build      | Vite                                    |
| Styling    | Tailwind CSS                            |
| Backend    | Firebase (Firestore + Storage + Auth)   |
| Testing    | Vitest                                  |
| Deploy     | Netlify                                 |

## Requirements

- Node.js 18 or later.
- npm.
- A Firebase project with Firestore, Storage and Authentication enabled.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/0noxtackore/ONOFRIETTI-Comics.git
   cd ONOFRIETTI-Comics
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with your public Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
   These are only public client-side config values; never include private admin credentials.

## Scripts

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Development server with hot reload       |
| `npm run build`      | Production build                         |
| `npm run preview`    | Preview the production build             |
| `npm run test`       | Run the test suite (Vitest)              |

## Routes

The site uses hash-based routes and client-side rendering (SPA).

| Route          | Description                                        |
| -------------- | -------------------------------------------------- |
| `/`            | Home page: hero + comics catalog.                  |
| `/#/comics/<slug>` | Detail sheet for a comic.                      |
| `/#/admin`     | Admin panel (requires Firebase session).           |

## Project Structure

```
src/
├── components/
│   ├── admin/        # Admin panel
│   ├── comic/        # Comic card, cover and detail
│   ├── layout/       # Header, footer and mobile menu
│   ├── sections/     # Hero and comics catalog
│   └── ui/           # Logo and UI components
├── composables/      # Shared state (catalog, menu, scroll)
├── services/         # Firebase integration
└── App.vue           # Hash router and root structure
```

## License

[MIT](LICENSE) © 2026 0noxtackore
