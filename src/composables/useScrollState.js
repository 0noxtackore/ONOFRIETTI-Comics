import { ref, onMounted, onUnmounted } from 'vue'

// Flag reactivo: true cuando el usuario ha hecho scroll.
export function useScrollState(threshold = 32) {
  const isScrolled = ref(false)

  const onScroll = () => {
    isScrolled.value = window.scrollY > threshold
  }

  onMounted(() => {
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return { isScrolled }
}
