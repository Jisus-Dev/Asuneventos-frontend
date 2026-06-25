import { useState, useEffect, useCallback } from 'react'
import { CalendarDays, MapPin, Clock, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusBadge = {
  Pendiente: { variant: 'secondary', label: 'Pendiente' },
  Confirmado: { variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-600', label: 'Confirmado' },
  Rechazado: { variant: 'destructive', label: 'Rechazado' },
}

export default function MiAgendaView() {
  const { email } = useAuth()
  const [asignaciones, setAsignaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchAsignaciones = useCallback(async () => {
    try {
      const { data: personas } = await api.get('/personas')
      const persona = personas.find((p) => p.email?.toLowerCase() === email?.toLowerCase())

      if (!persona) {
        toast.error('No se encontró tu perfil de voluntario')
        return
      }

      const { data } = await api.get(`/asignaciones/persona/${persona.idPersona}`)
      setAsignaciones(data)
    } catch {
      toast.error('Error al cargar tu agenda')
    } finally {
      setLoading(false)
    }
  }, [email])

  useEffect(() => {
    fetchAsignaciones()
  }, [fetchAsignaciones])

  const handleEstado = async (asignacionId, estado) => {
    setUpdatingId(asignacionId)
    try {
      await api.patch(`/asignaciones/${asignacionId}/estado`, { estado })
      toast.success(estado === 'Confirmado' ? 'Asistencia confirmada' : 'Asistencia rechazada')
      setAsignaciones((prev) =>
        prev.map((a) => (a.idAsignacion === asignacionId ? { ...a, estado } : a))
      )
    } catch {
      toast.error('Error al actualizar el estado')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-5 animate-spin mr-2" />
        Cargando agenda...
      </div>
    )
  }

  if (asignaciones.length === 0) {
    return (
      <div className="text-center py-20">
        <CalendarDays className="size-12 text-zinc-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-zinc-600">No tienes eventos pendientes</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Cuando seas asignado a un evento, aparecerá aquí
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {asignaciones.map((a) => {
        const status = statusBadge[a.estado] || statusBadge.Pendiente
        const isUpdating = updatingId === a.idAsignacion
        const isResuelto = a.estado === 'Confirmado' || a.estado === 'Rechazado'

        return (
          <Card key={a.idAsignacion}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">
                  {a.plan?.servicio?.nombre || 'Evento'}
                </CardTitle>
                <Badge
                  variant={status.variant}
                  className={status.className}
                >
                  {status.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pb-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                <span>{a.plan?.tituloSerie || 'Sin título'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                <span>{a.plan?.fecha || 'Fecha no definida'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                <span>{a.equipo?.nombreEquipo || 'Sin equipo'}</span>
              </div>
            </CardContent>

            {a.estado === 'Pendiente' && (
              <CardFooter className="flex-col sm:flex-row gap-3 pt-0">
                <Button
                  className="w-full"
                  disabled={isUpdating}
                  onClick={() => handleEstado(a.idAsignacion, 'Confirmado')}
                >
                  {isUpdating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle className="size-4" />
                  )}
                  Confirmar Asistencia
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={isUpdating}
                  onClick={() => handleEstado(a.idAsignacion, 'Rechazado')}
                >
                  {isUpdating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <XCircle className="size-4" />
                  )}
                  No podré asistir
                </Button>
              </CardFooter>
            )}

            {isResuelto && (
              <CardFooter className="pt-0">
                <div className="w-full p-3 rounded-lg bg-zinc-50 border text-center">
                  <p className="text-sm text-muted-foreground">
                    {a.estado === 'Confirmado'
                      ? 'Gracias por confirmar tu asistencia'
                      : 'Gracias por avisar. Te esperamos en otra ocasión'}
                  </p>
                </div>
              </CardFooter>
            )}
          </Card>
        )
      })}
    </div>
  )
}
