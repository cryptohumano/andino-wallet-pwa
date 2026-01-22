/**
 * Floating Action Button (FAB) - Componente reutilizable
 * Optimizado para mobile-first, posicionado en zona óptima de pulgar
 */

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface FABProps {
  icon: LucideIcon
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive' | 'outline'
  size?: 'default' | 'lg'
  className?: string
  disabled?: boolean
  'aria-label'?: string
  position?: 'left' | 'right'
  isExpanded?: boolean // Estado opcional para atenuar el FAB
  bottomOffset?: number // Offset desde el bottom en rem (default: 1rem = 4)
  wide?: boolean // Si es true, el FAB es el doble de ancho (para emergencia)
  secondaryIcon?: LucideIcon // Icono secundario (para GPS tracking)
}

/**
 * Hook opcional para obtener estado de expansión
 * No falla si el contexto no existe
 */
function useExpandedState(): boolean {
  try {
    // Intentar usar el contexto si existe (para compatibilidad futura)
    // Por ahora siempre retorna false
    return false
  } catch {
    return false
  }
}

export function FAB({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  size = 'lg',
  className,
  disabled = false,
  'aria-label': ariaLabel,
  position = 'right',
  isExpanded: isExpandedProp,
  bottomOffset = 4, // Default: 1rem (4 * 0.25rem)
  wide = false, // FAB alargado (el doble de ancho)
  secondaryIcon: SecondaryIcon,
}: FABProps) {
  const isExpandedFromContext = useExpandedState()
  const isExpanded = isExpandedProp ?? isExpandedFromContext
  
  // La clase CSS se basa en la variante, no en la posición
  // destructive = fab-emergency (rojo), default = fab-navigation (azul)
  const variantClass = variant === 'destructive' 
    ? 'fab-emergency' 
    : 'fab-navigation'
  
  const positionClass = position === 'left' 
    ? 'left-4 md:left-6' 
    : 'right-4 md:right-6'
  
  // Calcular bottom dinámicamente basado en bottomOffset
  // Si bottomOffset es 0, usar el mismo cálculo que BottomNav (sin calc)
  const bottomValue = bottomOffset === 0
    ? 'max(1rem, env(safe-area-inset-bottom, 1rem))'
    : `calc(max(1rem, env(safe-area-inset-bottom, 1rem)) + ${bottomOffset * 0.25}rem)`
  
  return (
    <div
      className={cn(
        'fixed z-[100] pointer-events-auto',
        positionClass,
        variantClass, // Clase basada en variant
        wide && 'fab-wide', // Clase para FAB alargado
        'safe-area-inset-bottom',
        position === 'left' ? 'safe-area-inset-left' : 'safe-area-inset-right',
        'fab-dim', // Clase base para estado dim
        isExpanded && 'fab-dim-active' // Activar dim cuando hay expansión
      )}
      style={{
        bottom: bottomValue,
        [position]: 'max(1rem, env(safe-area-inset-' + position + ', 1rem))',
        // Asegurar que el FAB sea siempre visible
        display: 'flex',
        visibility: 'visible',
        opacity: isExpanded ? 0.4 : 1,
        // Forzar visibilidad - importante para diagnóstico
        position: 'fixed',
        zIndex: 100,
      }}
      data-fab-visible="true"
      data-fab-variant={variant}
      data-fab-position={position}
    >
      <Button
        size={size}
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'h-14 md:h-16 rounded-full',
          wide ? 'w-28 md:w-32 px-4' : 'w-14 md:w-16', // Ancho doble si es wide
          'transition-all duration-300',
          'flex items-center justify-center gap-2',
          'active:scale-95', // Feedback táctil en móvil
          variant === 'outline' && 'variant-outline', // Clase para estilos CSS específicos
          // Los colores se aplican via CSS para asegurar visibilidad
          className
        )}
        aria-label={ariaLabel || label}
      >
        <Icon className="h-6 w-6 md:h-7 md:w-7 flex-shrink-0" />
        {SecondaryIcon && (
          <SecondaryIcon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
        )}
        {wide && (
          <span className="text-sm font-medium whitespace-nowrap">{label}</span>
        )}
        {!wide && <span className="sr-only">{label}</span>}
      </Button>
    </div>
  )
}
