// Directiva global v-reveal
// Muestra un elemento con una transición suave cuando entra en el viewport.
// Uso: v-reveal            -> sin retardo
//       v-reveal="{ delay: 120 }" -> con retardo en milisegundos

let observer = null

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    )
  }
  return observer
}

export default {
  mounted(el, binding) {
    el.classList.add('reveal')
    const delay = binding.value?.delay ?? 0
    if (delay > 0) el.style.transitionDelay = `${delay}ms`
    getObserver().observe(el)
  },
  unmounted(el) {
    if (observer) observer.unobserve(el)
  },
}
