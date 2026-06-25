import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Plus, ChevronDown, ChevronRight, Loader2, ArrowRight, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../api/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

export default function ServiciosView() {
  const navigate = useNavigate()
  const planesRef = useRef(null)
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [planes, setPlanes] = useState([])
  const [loadingPlanes, setLoadingPlanes] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', descripcion: '' })

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingServicio, setEditingServicio] = useState(null)
  const [editForm, setEditForm] = useState({ nombre: '', descripcion: '' })

  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [savingPlan, setSavingPlan] = useState(false)
  const [nuevoPlan, setNuevoPlan] = useState({ tituloSerie: '', fecha: null })

  const [editPlanDialogOpen, setEditPlanDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [editPlanForm, setEditPlanForm] = useState({ tituloSerie: '', fecha: null })

  const fetchServicios = useCallback(async () => {
    try {
      const { data } = await api.get('/servicios')
      setServicios(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error al cargar servicios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchServicios() }, [fetchServicios])

  const fetchPlanes = async (servicioId) => {
    if (servicioId == null || servicioId === '' || isNaN(Number(servicioId))) return
    setLoadingPlanes(true)
    try {
      const { data } = await api.get(`/planes/servicio/${servicioId}`)
      setPlanes(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error al cargar planes')
      setPlanes([])
    } finally {
      setLoadingPlanes(false)
    }
  }

  const handleToggleExpand = (servicioId) => {
    if (!servicioId && servicioId !== 0) return
    if (expandedId === servicioId) {
      setExpandedId(null)
      setPlanes([])
    } else {
      setExpandedId(servicioId)
      fetchPlanes(servicioId)
      setTimeout(() => planesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }

  const handleCreateServicio = async (e) => {
    e.preventDefault()
    if (!nuevoServicio.nombre.trim()) return
    setSaving(true)
    try {
      await api.post('/servicios', nuevoServicio)
      toast.success('Servicio creado')
      setDialogOpen(false)
      setNuevoServicio({ nombre: '', descripcion: '' })
      fetchServicios()
    } catch { toast.error('Error al crear servicio') }
    finally { setSaving(false) }
  }

  const handleOpenEdit = async (servicio) => {
    try {
      const { data } = await api.get(`/servicios/${servicio.idServicio}`)
      setEditingServicio(data)
      setEditForm({ nombre: data.nombre, descripcion: data.descripcion || '' })
      setEditDialogOpen(true)
    } catch { toast.error('Error al cargar servicio') }
  }

  const handleEditServicio = async (e) => {
    e.preventDefault()
    if (!editForm.nombre.trim() || !editingServicio) return
    setSaving(true)
    try {
      await api.put(`/servicios/${editingServicio.idServicio}`, editForm)
      toast.success('Servicio actualizado')
      setEditDialogOpen(false)
      setEditingServicio(null)
      fetchServicios()
    } catch { toast.error('Error al actualizar servicio') }
    finally { setSaving(false) }
  }

  const handleDeleteServicio = async (id) => {
    if (!confirm('¿Eliminar este servicio y todos sus planes?')) return
    try {
      await api.delete(`/servicios/${id}`)
      toast.success('Servicio eliminado')
      if (expandedId === id) { setExpandedId(null); setPlanes([]) }
      fetchServicios()
    } catch { toast.error('Error al eliminar servicio') }
  }

  const handleCreatePlan = async (e) => {
    e.preventDefault()
    if (!nuevoPlan.tituloSerie.trim() || !nuevoPlan.fecha) return
    setSavingPlan(true)
    try {
      await api.post('/planes', {
        tituloSerie: nuevoPlan.tituloSerie,
        fecha: format(nuevoPlan.fecha, 'yyyy-MM-dd'),
        idServicio: expandedId,
      })
      toast.success('Plan creado')
      setPlanDialogOpen(false)
      setNuevoPlan({ tituloSerie: '', fecha: null })
      fetchPlanes(expandedId)
    } catch { toast.error('Error al crear plan') }
    finally { setSavingPlan(false) }
  }

  const handleOpenEditPlan = async (plan) => {
    try {
      const { data } = await api.get(`/planes/${plan.idPlan}`)
      setEditingPlan(data)
      setEditPlanForm({
        tituloSerie: data.tituloSerie,
        fecha: data.fecha ? new Date(data.fecha + 'T00:00:00') : null,
      })
      setEditPlanDialogOpen(true)
    } catch { toast.error('Error al cargar plan') }
  }

  const handleEditPlan = async (e) => {
    e.preventDefault()
    if (!editPlanForm.tituloSerie.trim() || !editPlanForm.fecha || !editingPlan) return
    setSavingPlan(true)
    try {
      await api.put(`/planes/${editingPlan.idPlan}`, {
        tituloSerie: editPlanForm.tituloSerie,
        fecha: format(editPlanForm.fecha, 'yyyy-MM-dd'),
        idServicio: expandedId,
      })
      toast.success('Plan actualizado')
      setEditPlanDialogOpen(false)
      setEditingPlan(null)
      fetchPlanes(expandedId)
    } catch { toast.error('Error al actualizar plan') }
    finally { setSavingPlan(false) }
  }

  const handleDeletePlan = async (id) => {
    if (!confirm('¿Eliminar este plan?')) return
    try {
      await api.delete(`/planes/${id}`)
      toast.success('Plan eliminado')
      fetchPlanes(expandedId)
    } catch { toast.error('Error al eliminar plan') }
  }

  const servicioSeleccionado = servicios.find((s) => s.idServicio === expandedId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Servicios</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona los servicios y sus planes asociados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4" />Nuevo Servicio</Button></DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateServicio}>
              <DialogHeader>
                <DialogTitle>Crear Servicio</DialogTitle>
                <DialogDescription>Agrega un nuevo servicio al sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" placeholder="Ej: Concierto, Conferencia..." value={nuevoServicio.nombre} onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea id="descripcion" placeholder="Descripción del servicio" rows={3} value={nuevoServicio.descripcion} onChange={(e) => setNuevoServicio({ ...nuevoServicio, descripcion: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="size-4 animate-spin" /> Guardando...</> : 'Guardar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Servicio Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <form onSubmit={handleEditServicio}>
              <DialogHeader>
                <DialogTitle>Editar Servicio</DialogTitle>
                <DialogDescription>Modifica los datos del servicio</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nombre">Nombre</Label>
                  <Input id="edit-nombre" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-descripcion">Descripción</Label>
                  <Textarea id="edit-descripcion" rows={3} value={editForm.descripcion} onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="size-4 animate-spin" /> Guardando...</> : 'Guardar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Plan Dialog */}
        <Dialog open={editPlanDialogOpen} onOpenChange={setEditPlanDialogOpen}>
          <DialogContent>
            <form onSubmit={handleEditPlan}>
              <DialogHeader>
                <DialogTitle>Editar Plan</DialogTitle>
                <DialogDescription>Modifica los datos del plan</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-tituloSerie">Título de la serie</Label>
                  <Input id="edit-tituloSerie" value={editPlanForm.tituloSerie} onChange={(e) => setEditPlanForm({ ...editPlanForm, tituloSerie: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !editPlanForm.fecha && 'text-muted-foreground')}>
                        <CalendarIcon className="size-4 mr-2" />
                        {editPlanForm.fecha ? format(editPlanForm.fecha, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={editPlanForm.fecha} onSelect={(date) => setEditPlanForm({ ...editPlanForm, fecha: date })} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditPlanDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={savingPlan}>{savingPlan ? <><Loader2 className="size-4 animate-spin" /> Guardando...</> : 'Guardar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-16 text-right">Planes</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow key="loading"><TableCell colSpan={5} className="text-center text-muted-foreground py-8"><Loader2 className="size-4 animate-spin inline mr-2" />Cargando servicios...</TableCell></TableRow>
            ) : servicios.length === 0 ? (
              <TableRow key="empty"><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No hay servicios registrados</TableCell></TableRow>
            ) : (
              servicios.map((servicio) => {
                const isExpanded = expandedId === servicio.idServicio
                return (
                  <TableRow key={servicio.idServicio} className={`cursor-pointer transition-colors ${isExpanded ? 'bg-zinc-100 hover:bg-zinc-100' : 'hover:bg-zinc-50'}`} onClick={() => handleToggleExpand(servicio.idServicio)}>
                    <TableCell className="w-10">{isExpanded ? <ChevronDown className="size-4 text-zinc-500" /> : <ChevronRight className="size-4 text-zinc-400" />}</TableCell>
                    <TableCell className="font-medium">{servicio.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{servicio.descripcion || '-'}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{planes.length > 0 && expandedId === servicio.idServicio ? planes.length : '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(servicio)} title="Editar"><Pencil className="size-4 text-zinc-400 hover:text-zinc-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteServicio(servicio.idServicio)} title="Eliminar"><Trash2 className="size-4 text-zinc-400 hover:text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {expandedId != null && (
        <div ref={planesRef} className="rounded-lg border bg-white p-6 animate-[fadeIn_0.2s_ease]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900">Planes de {servicioSeleccionado?.nombre || `Servicio #${expandedId}`}</h2>
            <Button size="sm" onClick={() => setPlanDialogOpen(true)}><Plus className="size-3" />Nuevo Plan</Button>
          </div>

          {/* Create Plan Dialog */}
          <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
            <DialogContent>
              <form onSubmit={handleCreatePlan}>
                <DialogHeader>
                  <DialogTitle>Crear Plan</DialogTitle>
                  <DialogDescription>Programa una nueva fecha para {servicioSeleccionado?.nombre || `Servicio #${expandedId}`}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="tituloSerie">Título de la serie</Label>
                    <Input id="tituloSerie" placeholder="Ej: Edición Verano 2025" value={nuevoPlan.tituloSerie} onChange={(e) => setNuevoPlan({ ...nuevoPlan, tituloSerie: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !nuevoPlan.fecha && 'text-muted-foreground')}><CalendarIcon className="size-4 mr-2" />{nuevoPlan.fecha ? format(nuevoPlan.fecha, 'PPP', { locale: es }) : 'Seleccionar fecha'}</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={nuevoPlan.fecha} onSelect={(date) => setNuevoPlan({ ...nuevoPlan, fecha: date })} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setPlanDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={savingPlan}>{savingPlan ? <><Loader2 className="size-4 animate-spin" /> Guardando...</> : 'Guardar'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {loadingPlanes ? (
            <div className="text-center text-muted-foreground py-8"><Loader2 className="size-5 animate-spin inline mr-2" />Cargando planes...</div>
          ) : planes.length === 0 ? (
            <div className="text-center py-8"><p className="text-sm text-muted-foreground">No hay planes programados para este servicio</p><p className="text-xs text-muted-foreground mt-1">Usa el botón &quot;Nuevo Plan&quot; para crear uno</p></div>
          ) : (
            <div className="space-y-2">
              {planes.map((plan) => (
                <div key={plan.idPlan} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border hover:bg-zinc-100 transition-colors">
                  <div><p className="text-sm font-medium text-zinc-900">{plan.tituloSerie}</p><p className="text-xs text-muted-foreground">{plan.fecha}</p></div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/planes/${plan.idPlan}/cronograma`)}>Cronograma<ArrowRight className="size-3" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditPlan(plan)} title="Editar"><Pencil className="size-3 text-zinc-400" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan.idPlan)} title="Eliminar"><Trash2 className="size-3 text-zinc-400 hover:text-red-500" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
