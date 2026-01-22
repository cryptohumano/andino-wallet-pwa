import { Card, CardContent } from '@/components/ui/card'
import { Mountain, Loader2 } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useActiveMountainLog } from '@/hooks/useActiveMountainLog'
import { useActiveEmergencies } from '@/hooks/useActiveEmergencies'
import { useRecentMountainLogs } from '@/hooks/useRecentMountainLogs'
import { ActiveMountainLogCard } from '@/components/home/ActiveMountainLogCard'
import { ActiveEmergenciesCard } from '@/components/home/ActiveEmergenciesCard'

// Lazy load del mapa para mejorar LCP
const MountainLogsMap = lazy(() => import('@/components/home/MountainLogsMap').then(module => ({ default: module.MountainLogsMap })))

export default function Home() {
  // Hooks para datos de montañistas
  const { activeLog, isLoading: isLoadingActiveLog } = useActiveMountainLog()
  const { activeEmergencies, isLoading: isLoadingEmergencies } = useActiveEmergencies()
  const { recentLogs: allLogs, isLoading: isLoadingAllLogs } = useRecentMountainLogs(100) // Para el mapa

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Mountain className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Andino Wallet
          </h1>
        </div>
      </div>

      {/* Bitácora Activa - Solo si existe */}
      {isLoadingActiveLog ? (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cargando...</span>
            </div>
          </CardContent>
        </Card>
      ) : activeLog ? (
        <ActiveMountainLogCard log={activeLog} />
      ) : null}

      {/* Emergencias Activas - Solo si existen */}
      {isLoadingEmergencies ? (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cargando...</span>
            </div>
          </CardContent>
        </Card>
      ) : activeEmergencies.length > 0 ? (
        <ActiveEmergenciesCard emergencies={activeEmergencies} />
      ) : null}

      {/* Mapa de Bitácoras - Ocupa la mayor parte de la pantalla, bloqueado */}
      <Suspense fallback={
        <div className="w-full h-[calc(100vh-12rem)] min-h-[400px] rounded-lg border flex items-center justify-center bg-muted/50">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <MountainLogsMap 
          logs={allLogs} 
          isLoading={isLoadingAllLogs} 
          showCurrentLocation={true}
          className="w-full mb-20 sm:mb-24"
        />
      </Suspense>
    </div>
  )
}

