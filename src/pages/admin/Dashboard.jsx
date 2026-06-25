import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Users, ClipboardList, UserCheck, ArrowRight, Loader2, GripVertical, Image } from 'lucide-react'
import api from '../../api/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [elementos, setElementos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [serv, planes, pers, asig, elem] = await Promise.all([
          api.get('/servicios'),
          api.get('/planes'),
          api.get('/personas'),
          api.get('/asignaciones'),
          api.get('/elementos'),
        ])
        setStats({
          servicios: serv.data.length,
          planes: planes.data.length,
          personas: pers.data.length,
          asignaciones: asig.data.length,
        })
        setElementos(Array.isArray(elem.data) ? elem.data : [])
      } catch {
        setStats({ servicios: 0, planes: 0, personas: 0, asignaciones: 0 })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    { title: 'Servicios', value: stats?.servicios ?? '-', description: 'Eventos registrados', icon: CalendarDays, href: '/admin/servicios', color: 'bg-zinc-900' },
    { title: 'Planes', value: stats?.planes ?? '-', description: 'Fechas programadas', icon: ClipboardList, href: '/admin/servicios', color: 'bg-zinc-700' },
    { title: 'Personal', value: stats?.personas ?? '-', description: 'Usuarios registrados', icon: Users, href: '/admin/personal', color: 'bg-zinc-600' },
    { title: 'Asignaciones', value: stats?.asignaciones ?? '-', description: 'Personas asignadas', icon: UserCheck, href: '/admin/servicios', color: 'bg-emerald-600' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-5 animate-spin mr-2" />Cargando panel...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(card.href)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`size-10 rounded-lg ${card.color} flex items-center justify-center`}><card.icon className="size-5 text-white" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-900">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-zinc-400 hover:text-zinc-600 transition-colors">Ver más <ArrowRight className="size-3" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Todos los elementos (cross-plan) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><GripVertical className="size-4" />Todos los elementos</CardTitle>
            <span className="text-xs text-muted-foreground">{elementos.length} en total</span>
          </CardHeader>
          <CardContent>
            {elementos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No hay elementos registrados</p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1">
                <Table>
                  <TableHeader><TableRow><TableHead>Título</TableHead><TableHead className="w-16">Orden</TableHead><TableHead className="w-20">Duración</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {elementos.slice(0, 20).map((el) => (
                      <TableRow key={el.idElemento}>
                        <TableCell className="text-sm">{el.titulo}</TableCell>
                        <TableCell className="text-muted-foreground">#{el.orden}</TableCell>
                        <TableCell className="text-muted-foreground">{el.duracion}m</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Archivos / Gallery link */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/archivos')}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Image className="size-4" />Archivos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Galería multimedia. Sube y visualiza imágenes, documentos y más.</p>
            <div className="flex items-center gap-1 mt-3 text-xs text-zinc-400 hover:text-zinc-600 transition-colors">Ver galería <ArrowRight className="size-3" /></div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Nuevo Servicio', href: '/admin/servicios' },
            { label: 'Gestionar Personal', href: '/admin/personal' },
            { label: 'Ver Asignaciones', href: '/admin/servicios' },
          ].map((action) => (
            <Card key={action.label} className="cursor-pointer hover:bg-zinc-50 transition-colors" onClick={() => navigate(action.href)}>
              <CardContent className="p-6 flex items-center justify-between"><span className="text-sm font-medium text-zinc-700">{action.label}</span><ArrowRight className="size-4 text-zinc-400" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
