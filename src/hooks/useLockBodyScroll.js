import { useEffect } from 'react'

let lockCount = 0
let originalOverflow = null
let originalPaddingRight = null

/**
 * Bloquea el scroll del body usando solo overflow: hidden.
 * Más simple y no rompe el centrado de modales.
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