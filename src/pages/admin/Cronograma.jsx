import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Clock, GripVertical, Plus, Loader2, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../api/api'
import AsignacionesBoard from './AsignacionesBoard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

export default function CronogramaView() {
  const { idPlan } = useParams()
  const [elementos, setElementos] = useState([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ titulo: '', orden: '', duracion: '' })

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingElemento, setEditingElemento] = useState(null)
  const [editForm, setEditForm] = useState({ titulo: '', orden: '', duracion: '' })

  const fetchElementos = useCallback(async () => {
    try {
      const { data } = await api.get(`/elementos/plan/${idPlan}`)
      setElementos(data)
    } catch {
      toast.error('Error al cargar el cronograma')
    } finally {
      setLoading(false)
    }
  }, [idPlan])

  useEffect(() => { fetchElementos() }, [fetchElementos])

  const totalMinutos = elementos.reduce((sum, el) => sum + (el.duracion || 0), 0)
  const horas = Math.floor(totalMinutos / 60)
  const minutos = totalMinutos % 60
  const duracionTotal = horas > 0 ? `${horas}h ${minutos > 0 ? `${minutos}m` : ''}` : `${minutos}m`

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim() || !form.orden || !form.duracion) return
    setSaving(true)
    try {
      await api.post('/elementos', { titulo: form.titulo, orden: parseInt(form.orden), duracion: parseInt(form.duracion), idPlan: parseInt(idPlan) })
      toast.success('Elemento agregado')
      setSheetOpen(false)
      setForm({ titulo: '', orden: '', duracion: '' })
      fetchElementos()
    } catch { toast.error('Error al agregar elemento') }
    finally { setSaving(false) }
  }

  const handleOpenEdit = async (el) => {
    try {
      const { data } = await api.get(`/elementos/${el.idElemento}`)
      setEditingElemento(data)
      setEditForm({ titulo: data.titulo, orden: String(data.orden || ''), duracion: String(data.duracion || '') })
      setEditDialogOpen(true)
    } catch { toast.error('Error al cargar elemento') }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!editForm.titulo.trim() || !editForm.orden || !editForm.duracion || !editingElemento) return
    setSaving(true)
    try {
      await api.put(`/elementos/${editingElemento.idElemento}`, { titulo: editForm.titulo, orden: parseInt(editForm.orden), duracion: parseInt(editForm.duracion), idPlan: parseInt(idPlan) })
      toast.success('Elemento actualizado')
      setEditDialogOpen(false)
      setEditingElemento(null)
      fetchElementos()
    } catch { toast.error('Error al actualizar elemento') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este elemento del cronograma?')) return
    try {
      await api.delete(`/elementos/${id}`)
      toast.success('Elemento eliminado')
      fetchElementos()
    } catch { toast.error('Error al eliminar elemento') }
  }

  const sorted = [...elementos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Cronograma</h1>
          <p className="text-sm text-muted-foreground mt-1">Plan #{idPlan} &middot; Minuto a minuto</p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild><Button><Plus className="size-4" />Agregar Elemento</Button></SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <SheetHeader><SheetTitle>Agregar Elemento</SheetTitle><SheetDescription>Añade una actividad al cronograma</SheetDescription></SheetHeader>
              <div className="space-y-4 py-6">
                <div className="space-y-2"><Label htmlFor="titulo">Título</Label><Input id="titulo" placeholder="Ej: Bienvenida, Acto principal..." value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="orden">Orden</Label><Input id="orden" type="number" min="1" placeholder="1" value={form.orden} onChange={(e) => setForm({ ...form, orden: e.target.value })} required /></div>
                  <div className="space-y-2"><Label htmlFor="duracion">Duración (min)</Label><Input id="duracion" type="number" min="1" placeholder="30" value={form.duracion} onChange={(e) => setForm({ ...form, duracion: e.target.value })} required /></div>
                </div>
              </div>
              <SheetFooter>
                <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="size-4 animate-spin" />Guardando...</> : 'Guardar'}</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        {/* Edit Elemento Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <form onSubmit={handleEdit}>
              <DialogHeader><DialogTitle>Editar Elemento</DialogTitle><DialogDescription>Modifica los datos de la actividad</DialogDescription></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2"><Label htmlFor="edit-titulo">Título</Label><Input id="edit-titulo" value={editForm.titulo} onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="edit-orden">Orden</Label><Input id="edit-orden" type="number" min="1" value={editForm.orden} onChange={(e) => setEditForm({ ...editForm, orden: e.target.value })} required /></div>
                  <div className="space-y-2"><Label htmlFor="edit-duracion">Duración (min)</Label><Input id="edit-duracion" type="number" min="1" value={editForm.duracion} onChange={(e) => setEditForm({ ...editForm, duracion: e.target.value })} required /></div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="size-4 animate-spin" />Guardando...</> : 'Guardar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!loading && elementos.length > 0 && (
        <Alert>
          <Clock className="size-4" />
          <AlertTitle>Duración total del evento</AlertTitle>
          <AlertDescription>{totalMinutos} minutos ({duracionTotal}) &middot; {elementos.length} elemento{elementos.length !== 1 ? 's' : ''}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="size-5 animate-spin mr-2" />Cargando cronograma...</div>
      ) : elementos.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-16 text-center"><Clock className="size-10 text-zinc-300 mb-3" /><p className="text-sm font-medium text-zinc-600">No hay elementos en el cronograma</p><p className="text-xs text-muted-foreground mt-1">Agrega actividades usando el botón &quot;Agregar Elemento&quot;</p></CardContent></Card>
      ) : (
        <div className="relative pl-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-zinc-200">
          {sorted.map((el, i) => (
            <div key={el.idElemento} className="relative pb-6 last:pb-0">
              <div className="absolute -left-[23px] top-1.5 flex items-center justify-center">
                <div className="size-[17px] rounded-full bg-white border-2 border-zinc-300 flex items-center justify-center"><span className="text-[10px] font-bold text-zinc-500">{el.orden ?? i + 1}</span></div>
              </div>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1"><GripVertical className="size-4 text-zinc-300 shrink-0" /><h3 className="font-medium text-zinc-900 truncate">{el.titulo}</h3></div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="size-3" /><span>{el.duracion} minutos</span></div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-mono text-xs bg-zinc-100 rounded-full px-2 py-0.5">#{el.orden ?? i + 1}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(el)} title="Editar"><Pencil className="size-3 text-zinc-400" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(el.idElemento)} title="Eliminar"><Trash2 className="size-3 text-zinc-400 hover:text-red-500" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <Separator />
      <AsignacionesBoard idPlan={idPlan} />
    </div>
  )
}
