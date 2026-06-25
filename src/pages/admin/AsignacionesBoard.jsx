import { useState, useEffect, useCallback } from 'react'
import { Users, UserPlus, Loader2, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../api/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

const statusVariant = {
  Pendiente: { variant: 'secondary', label: 'Pendiente' },
  Confirmado: { variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-600', label: 'Confirmado' },
  Rechazado: { variant: 'destructive', label: 'Rechazado' },
}

export default function AsignacionesBoard({ idPlan }) {
  const [asignaciones, setAsignaciones] = useState([])
  const [personas, setPersonas] = useState([])
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [personaId, setPersonaId] = useState('')
  const [equipoId, setEquipoId] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailAsig, setDetailAsig] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [asigRes, persRes, eqRes] = await Promise.all([
        api.get(`/asignaciones/plan/${idPlan}`),
        api.get('/personas'),
        api.get('/equipos'),
      ])
      setAsignaciones(asigRes.data)
      setPersonas(persRes.data)
      setEquipos(eqRes.data)
    } catch {
      toast.error('Error al cargar datos de asignaciones')
    } finally {
      setLoading(false)
    }
  }, [idPlan])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAsignar = async () => {
    if (!personaId || !equipoId) { toast.error('Selecciona una persona y un equipo'); return }
    setSaving(true)
    try {
      await api.post('/asignaciones', { idPersona: parseInt(personaId), idEquipo: parseInt(equipoId), idPlan: parseInt(idPlan) })
      toast.success('Asignación creada y correo enviado al voluntario')
      setPersonaId(''); setEquipoId('')
      fetchData()
    } catch { toast.error('Error al crear la asignación') }
    finally { setSaving(false) }
  }

  const handleDelete = async (asignacionId) => {
    if (!confirm('¿Eliminar esta asignación?')) return
    try {
      await api.delete(`/asignaciones/${asignacionId}`)
      toast.success('Asignación eliminada')
      fetchData()
    } catch { toast.error('Error al eliminar asignación') }
  }

  const handleViewDetail = async (asignacionId) => {
    setLoadingDetail(true)
    try {
      const { data } = await api.get(`/asignaciones/${asignacionId}`)
      setDetailAsig(data)
      setDetailOpen(true)
    } catch { toast.error('Error al cargar detalle') }
    finally { setLoadingDetail(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="size-4 animate-spin mr-2" />Cargando asignaciones...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><UserPlus className="size-5" />Asignar Personal</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-sm font-medium">Persona</label>
              <Select value={personaId} onValueChange={setPersonaId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar persona" /></SelectTrigger>
                <SelectContent>{personas.map((p) => (<SelectItem key={p.idPersona} value={String(p.idPersona)}>{p.nombre}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-sm font-medium">Equipo</label>
              <Select value={equipoId} onValueChange={setEquipoId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar equipo" /></SelectTrigger>
                <SelectContent>{equipos.map((e) => (<SelectItem key={e.idEquipo} value={String(e.idEquipo)}>{e.nombreEquipo}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleAsignar} disabled={saving} className="shrink-0">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}Asignar Persona
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2 mb-4"><Users className="size-5" />Asignaciones actuales</h3>
        {asignaciones.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-8 text-center"><Users className="size-8 text-zinc-300 mb-2" /><p className="text-sm text-muted-foreground">No hay asignaciones para este plan</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {asignaciones.map((a) => {
              const status = statusVariant[a.estado] || statusVariant.Pendiente
              return (
                <Card key={a.idAsignacion} className="hover:shadow-sm transition-shadow group cursor-pointer" onClick={() => handleViewDetail(a.idAsignacion)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">{a.persona?.nombre}</p>
                        <p className="text-xs text-muted-foreground">{a.persona?.email}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={status.variant} className={status.className}>{status.label}</Badge>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleDelete(a.idAsignacion) }} title="Eliminar asignación">
                          <Trash2 className="size-3 text-zinc-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="bg-zinc-100 rounded-md px-2 py-0.5">{a.equipo?.nombreEquipo}</span>
                      <Eye className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          {loadingDetail ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="size-5 animate-spin mr-2" />Cargando detalle...</div>
          ) : detailAsig ? (
            <>
              <DialogHeader>
                <DialogTitle>Detalle de Asignación</DialogTitle>
                <DialogDescription>Información completa de la asignación</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div><Label className="text-xs text-muted-foreground">Persona</Label><p className="text-sm font-medium">{detailAsig.persona?.nombre}</p><p className="text-xs text-muted-foreground">{detailAsig.persona?.email}</p></div>
                <div><Label className="text-xs text-muted-foreground">Equipo</Label><p className="text-sm">{detailAsig.equipo?.nombreEquipo}</p></div>
                <div><Label className="text-xs text-muted-foreground">Plan</Label><p className="text-sm">{detailAsig.plan?.tituloSerie}</p><p className="text-xs text-muted-foreground">{detailAsig.plan?.fecha}</p></div>
                <div><Label className="text-xs text-muted-foreground">Estado</Label><Badge variant={statusVariant[detailAsig.estado]?.variant || 'secondary'} className={statusVariant[detailAsig.estado]?.className}>{statusVariant[detailAsig.estado]?.label || detailAsig.estado}</Badge></div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
