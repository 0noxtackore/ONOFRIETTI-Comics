import { ref } from 'vue'

// Estado compartido del menú de navegación (abre/cierra y bloquea el scroll).
const isOpen = ref(false)

export function useMenu() {
  const open = () => {
    isOpen.value = true
    document.documentElement.style.overflow = 'hidden'
  }

  const close = () => {
    isOpen.value = false
    document.documentElement.style.overflow = ''
  }

  const toggle = () => (isOpen.value ? close() : open())

  return { isOpen, open, close, toggle }
}
