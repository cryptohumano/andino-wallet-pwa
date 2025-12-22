import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Home, Wallet, Send, FileText, MoreHorizontal } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Cuentas', href: '/accounts', icon: Wallet },
  { name: 'Enviar', href: '/send', icon: Send },
  { name: 'Documentos', href: '/documents', icon: FileText },
  { name: 'Más', href: '/settings', icon: MoreHorizontal },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 min-w-0 px-2 py-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="text-xs mt-1 truncate">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

