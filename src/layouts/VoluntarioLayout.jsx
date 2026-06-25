import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, LogOut, ClipboardList } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

export default function VoluntarioLayout() {
  const { email, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = email
    ? email.split('@')[0].slice(0, 2).toUpperCase()
    : 'VL'

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Topbar */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-zinc-200">
        <div className="flex items-center gap-3">
          {/* Mobile menu sheet */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="h-16 flex flex-row items-center gap-2 px-6 border-b">
                <div className="size-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <SheetTitle>Asuneventos</SheetTitle>
              </SheetHeader>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-zinc-100 text-zinc-600 text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium truncate">{email}</p>
                    <p className="text-xs text-muted-foreground">Voluntario</p>
                  </div>
                </div>
                <Separator />
                <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Cerrar sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="font-semibold text-zinc-900 hidden sm:inline">Asuneventos</span>
          </div>
        </div>

        {/* Welcome + user menu */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500 hidden sm:inline">
            Bienvenido, <span className="text-zinc-700 font-medium">{email?.split('@')[0]}</span>
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative size-10 rounded-full">
                <Avatar className="size-9">
                  <AvatarFallback className="text-xs bg-zinc-100 text-zinc-600">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="truncate">{email}</p>
                <p className="text-xs text-muted-foreground font-normal">Voluntario</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="size-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Mobile welcome */}
        <div className="sm:hidden mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="size-12">
              <AvatarFallback className="bg-zinc-100 text-zinc-600">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-zinc-900">Bienvenido</p>
              <p className="text-sm text-zinc-500 truncate">{email}</p>
            </div>
          </div>
          <Separator />
        </div>

        <Outlet />
      </main>
    </div>
  )
}
