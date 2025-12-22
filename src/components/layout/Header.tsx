import { Button } from '@/components/ui/button'
import { Search, Bell, Menu } from 'lucide-react'
import { NetworkSwitcher } from '@/components/NetworkSwitcher'
import { useNetwork } from '@/contexts/NetworkContext'

export function Header() {
  const { selectedChain, setSelectedChain, isConnecting } = useNetwork()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Aura Wallet</h1>
            <NetworkSwitcher
              selectedChain={selectedChain}
              onSelectChain={setSelectedChain}
              isConnecting={isConnecting}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

