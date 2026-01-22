import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Hook para detectar si estamos en un dispositivo móvil
 * Incluye detección de PWA instalada (standalone mode)
 */
export function useIsMobile() {
  // Inicializar con una verificación inmediata para evitar undefined
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Verificación inicial síncrona
    if (typeof window === 'undefined') return false
    
    const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    // @ts-ignore - window.navigator.standalone es específico de iOS
    const isStandalone = window.navigator.standalone === true || 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches
    
    return isSmallScreen || isMobileUserAgent || isStandalone
  })

  React.useEffect(() => {
    const checkMobile = () => {
      // 1. Verificar ancho de ventana
      const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT
      
      // 2. Verificar user agent
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      // 3. Verificar si está en modo standalone (PWA instalada)
      // @ts-ignore - window.navigator.standalone es específico de iOS
      const isStandalone = window.navigator.standalone === true || 
        // Para Android y otros navegadores, verificar display-mode
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches
      
      // Es móvil si: pantalla pequeña, user agent móvil, o está en modo standalone
      const mobile = isSmallScreen || isMobileUserAgent || isStandalone
      setIsMobile(mobile)
      
      // Log para depuración solo en desarrollo
      if (import.meta.env.DEV) {
        console.log('[useIsMobile] Estado actualizado:', {
          isSmallScreen,
          isMobileUserAgent,
          isStandalone,
          mobile,
          windowWidth: window.innerWidth,
          userAgent: navigator.userAgent.substring(0, 50),
        })
      }
    }
    
    // Verificar inmediatamente (aunque ya lo hicimos en el estado inicial)
    checkMobile()
    
    // Escuchar cambios de tamaño de ventana
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      checkMobile()
    }
    mql.addEventListener("change", onChange)
    window.addEventListener('resize', checkMobile)
    
    return () => {
      mql.removeEventListener("change", onChange)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return isMobile
}
