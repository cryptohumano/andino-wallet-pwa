import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Hook para detectar si estamos en un dispositivo móvil
 * Incluye detección de PWA instalada (standalone mode)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

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
      setIsMobile(isSmallScreen || isMobileUserAgent || isStandalone)
    }
    
    // Verificar inmediatamente
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

  return !!isMobile
}
