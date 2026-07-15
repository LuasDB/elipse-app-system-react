import { useEffect } from 'react'

let lockCount = 0
let originalOverflow = null
let originalPaddingRight = null

/**
 * Efecto compartido para cuando se abre un modal: bloquea el scroll del body
 * (con overflow: hidden) y sube el contenido principal hasta arriba, para que
 * el modal y sus primeros campos siempre se vean desde el inicio de la pantalla.
 */
export const useLockBodyScroll = (isLocked) => {
  useEffect(() => {
    if (!isLocked) return

    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow
      originalPaddingRight = document.body.style.paddingRight

      // Compensar la barra de scroll para evitar layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }

      document.querySelector('main')?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
    lockCount++

    return () => {
      lockCount--
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow ?? ''
        document.body.style.paddingRight = originalPaddingRight ?? ''
        originalOverflow = null
        originalPaddingRight = null
      }
    }
  }, [isLocked])
}

export default useLockBodyScroll