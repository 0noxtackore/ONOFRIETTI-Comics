// Navegación SPA en modo history (URLs limpias, sin "#").
// Empuja una entrada nueva al historial y dispara el evento que App.vue
// escucha para re-resolver la ruta sin recargar la página.
export function navigate(path) {
  const target = path || '/'
  window.history.pushState({}, '', target)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
