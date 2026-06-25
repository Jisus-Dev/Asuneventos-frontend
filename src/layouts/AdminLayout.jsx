import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, Menu, LogOut, ChevronDown, Image } from 'lucide-react'
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

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/servicios', label: 'Servicios', icon: Calendar },
  { to: '/admin/personal', label: 'Personal', icon: Users },
  { to: '/admin/archivos', label: 'Archivos', icon: Image },
]

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-zinc-100 text-zinc-900'
      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
  }`

export default function AdminLayout() {
  const { email, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = email
    ? email.split('@')[0].slice(0, 2).toUpperCase()
    : 'AD'

  const SidebarNav = () => (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} end className={linkClass} onClick={() => setOpen(false)}>
          <item.icon className="size-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-zinc-200">
        <div className="flex items-center gap-2 h-16 px-6 border-b border-zinc-200">
          <div className="size-8 rounded-lg bg-zinc-900 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="font-semibold text-zinc-900">Asuneventos</span>
        </div>

        <div className="flex-1 py-4">
          <SidebarNav />
        </div>

        <div className="p-4 border-t border-zinc-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 px-2 h-auto py-2">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs bg-zinc-100 text-zinc-600">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{email}</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="size-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 bg-white border-b border-zinc-200">
          {/* Mobile menu trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
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
              <div className="py-4">
                <SidebarNav />
              </div>
              <Separator />
              <div className="p-4">
                <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Cerrar sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <h2 className="text-lg font-semibold text-zinc-900 hidden sm:block">Panel de Administración</h2>
          <div className="sm:hidden" />

          {/* Desktop user menu (top-right) */}
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative size-10 rounded-full">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-zinc-100 text-zinc-600">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p>{email}</p>
                  <p className="text-xs text-muted-foreground font-normal">Administrador</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile user menu */}
          <div className="lg:hidden">
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
                  <p className="text-xs text-muted-foreground font-normal">Administrador</p>
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

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
