import { ref } from 'vue'

// Estado compartido del catálogo: la búsqueda del header y los filtros de la
// sección de cómics filtran la misma lista en tiempo real.
const query = ref('')
const selectedProtagonist = ref('')

export function useCatalog() {
  const setQuery = (value) => {
    query.value = value
  }

  const reset = () => {
    query.value = ''
    selectedProtagonist.value = ''
  }

  return { query, selectedProtagonist, setQuery, reset }
}
