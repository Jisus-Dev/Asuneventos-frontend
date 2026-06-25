import { useState, useEffect, useCallback } from 'react'
import { Plus, Loader2, Trash2, Pencil, Users } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../api/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const rolBadge = {
  ROLE_ADMIN: { className: 'bg-zinc-900 hover:bg-zinc-800', label: 'Admin' },
  ROLE_VOLUNTARIO: { className: 'bg-emerald-500 hover:bg-emerald-600', label: 'Voluntario' },
}

export default function Personal() {
  const [personas, setPersonas] = useState([])
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)

  // Persona form
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'ROLE_VOLUNTARIO' })

  // Edit persona
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState(null)
  const [editForm, setEditForm] = useState({ nombre: '', email: '', password: '', rol: 'ROLE_VOLUNTARIO' })

  // Equipo form
  const [equipoDialogOpen, setEquipoDialogOpen] = useState(false)
  const [nuevoEquipo, setNuevoEquipo] = useState('')

  // Edit equipo
  const [editEquipoDialogOpen, setEditEquipoDialogOpen] = useState(false)
  const [editingEquipo, setEditingEquipo] = useState(null)
  const [editEquipoNombre, setEditEquipoNombre] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [pers, eq] = await Promise.all([api.get('/personas'), api.get('/equipos')])
      setPersonas(Array.isArray(pers.data) ? pers.data : [])
      setEquipos(Array.isArray(eq.data) ? eq.data : [])
    } catch {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Persona CRUD
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.email.trim() || !form.password.trim()) return
    setSaving(true)
    try { await api.post('/personas', form); toast.success('Persona creada'); setDialogOpen(false); setForm({ nombre: '', email: '', password: '', rol: 'ROLE_VOLUNTARIO' }); fetchData() }
    catch { toast.error('Error al crear persona') }
    finally { setSaving(false) }
  }

  const handleOpenEditPersona = async (p) => {
    try {
      const { data } = await api.get(`/personas/${p.idPersona}`)
      setEditingPersona(data)
      setEditForm({ nombre: data.nombre, email: data.email, password: '', rol: data.rol })
      setEditDialogOpen(true)
    } catch { toast.error('Error al cargar persona') }
  }

  const handleEditPersona = async (e) => {
    e.preventDefault()
    if (!editForm.nombre.trim() || !editForm.email.trim() || !editingPersona) return
    setSaving(true)
    try {
      const body = { nombre: editForm.nombre, email: editForm.email, rol: editForm.rol }
      if (editForm.password) body.password = editForm.password
      await api.put(`/personas/${editingPersona.idPersona}`, body)
      toast.success('Persona actualizada')
      setEditDialogOpen(false); setEditingPersona(null)
      fetchData()
    } catch { toast.error('Error al actualizar persona') }
    finally { setSaving(false) }
  }

  const handleDeletePersona = async (id) => {
    if (!confirm('¿Eliminar esta persona?')) return
    try { await api.delete(`/personas/${id}`); toast.success('Persona eliminada'); setPersonas((prev) => prev.filter((p) => p.idPersona !== id)) }
    catch { toast.error('Error al eliminar persona') }
  }

  // Equipo CRUD
  const handleCreateEquipo = async (e) => {
    e.preventDefault()
    if (!nuevoEquipo.trim()) return
    setSaving(true)
    try { await api.post('/equipos', { nombreEquipo: nuevoEquipo }); toast.success('Equipo creado'); setEquipoDialogOpen(false); setNuevoEquipo(''); fetchData() }
    catch { toast.error('Error al crear equipo') }
    finally { setSaving(false) }
  }

  const handleOpenEditEquipo = async (eq) => {
    try {
      const { data } = await api.get(`/equipos/${eq.idEquipo}`)
      setEditingEquipo(data)
      setEditEquipoNombre(data.nombreEquipo)
      setEditEquipoDialogOpen(true)
    } catch { toast.error('Error al cargar equipo') }
  }

  const handleEditEquipo = async (e) => {
    e.preventDefault()
    if (!editEquipoNombre.trim() || !editingEquipo) return
    setSaving(true)
    try { await api.put(`/equipos/${editingEquipo.idEquipo}`, { nombreEquipo: editEquipoNombre }); toast.success('Equipo actualizado'); setEditEquipoDialogOpen(false); setEditingEquipo(null); fetchData() }
    catch { toast.error('Error al actualizar equipo') }
    finally { setSaving(false) }
  }

  const handleDeleteEquipo = async (id) => {
    if (!confirm('¿Eliminar este equipo?')) return
    try { await api.delete(`/equipos/${id}`); toast.success('Equipo eliminado'); setEquipos((prev) => prev.filter((e) => e.idEquipo !== id)) }
    catch { toast.error('Error al eliminar equipo') }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-5 animate-spin mr-2" />Cargando...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Personas section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Personal</h1>
            <p className="text-sm text-muted-foreground mt-1">Administradores y voluntarios del sistema</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="size-4" />Nueva Persona</Button></DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader><DialogTitle>Crear Persona</DialogTitle><DialogDescription>Registra un nuevo usuario en el sistema</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><Label htmlFor="nombre">Nombre</Label><Input id="nombre" placeholder="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
                  <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                  <div className="space-y-2"><Label htmlFor="password">Contraseña</Label><Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Rol</Label><Select value={form.rol} onValueChange={(v) => setForm({ ...form, rol: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ROLE_ADMIN">Administrador</SelectItem><SelectItem value="ROLE_VOLUNTARIO">Voluntario</SelectItem></SelectContent></Select></div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="size-4 animate-spin" />Guardando...</> : 'Guardar'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Persona Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <form onSubmit={handleEditPersona}>
                <DialogHeader><DialogTitle>Editar Persona</DialogTitle><DialogDescription>Modifica los datos del usuario</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><Label htmlFor="edit-nombre">Nombre</Label><Input id="edit-nombre" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} required /></div>
                  <div className="space-y-2"><Label htmlFor="edit-email">Email</Label><Input id="edit-email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required /></div>
                  <div className="space-y-2"><Label htmlFor="edit-password">Contraseña (dejar vacío para no cambiar)</Label><Input id="edit-password" type="password" placeholder="••••••••" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Rol</Label><Select value={editForm.rol} onValueChange={(v) => setEditForm({ ...editForm, rol: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ROLE_ADMIN">Administrador</SelectItem><SelectItem value="ROLE_VOLUNTARIO">Voluntario</SelectItem></SelectContent></Select></div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="size-4 animate-spin" />Guardando...</> : 'Guardar'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Email</TableHead><TableHead>Rol</TableHead><TableHead className="w-24" /></TableRow></TableHeader>
            <TableBody>
              {personas.length === 0 ? (
                <TableRow key="empty"><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No hay personal registrado</TableCell></TableRow>
              ) : (
                personas.map((p) => {
                  const badge = rolBadge[p.rol] || rolBadge.ROLE_VOLUNTARIO
                  return (
                    <TableRow key={p.idPersona}>
                      <TableCell className="font-medium">{p.nombre}</TableCell>
                      <TableCell className="text-muted-foreground">{p.email}</TableCell>
                      <TableCell><Badge className={badge.className}>{badge.label}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditPersona(p)} title="Editar"><Pencil className="size-4 text-zinc-400 hover:text-zinc-600" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePersona(p.idPersona)} title="Eliminar"><Trash2 className="size-4 text-zinc-400 hover:text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Separator />

      {/* Equipos section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2"><Users className="size-5" />Equipos</h2>
            <p className="text-sm text-muted-foreground mt-1">Grupos de trabajo para asignaciones</p>
          </div>
          <Dialog open={equipoDialogOpen} onOpenChange={setEquipoDialogOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="size-4" />Nuevo Equipo</Button></DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateEquipo}>
                <DialogHeader><DialogTitle>Crear Equipo</DialogTitle><DialogDescription>Registra un nuevo equipo de trabajo</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><Label htmlFor="nombreEquipo">Nombre del equipo</Label><Input id="nombreEquipo" placeholder="Ej: Staff, Logística..." value={nuevoEquipo} onChange={(e) => setNuevoEquipo(e.target.value)} required /></div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEquipoDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="size-4 animate-spin" />Guardando...</> : 'Guardar'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Equipo Dialog */}
          <Dialog open={editEquipoDialogOpen} onOpenChange={setEditEquipoDialogOpen}>
            <DialogContent>
              <form onSubmit={handleEditEquipo}>
                <DialogHeader><DialogTitle>Editar Equipo</DialogTitle><DialogDescription>Modifica el nombre del equipo</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><Label htmlFor="edit-nombreEquipo">Nombre del equipo</Label><Input id="edit-nombreEquipo" value={editEquipoNombre} onChange={(e) => setEditEquipoNombre(e.target.value)} required /></div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditEquipoDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="size-4 animate-spin" />Guardando...</> : 'Guardar'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader><TableRow><TableHead>Nombre del equipo</TableHead><TableHead className="w-24" /></TableRow></TableHeader>
            <TableBody>
              {equipos.length === 0 ? (
                <TableRow key="empty-eq"><TableCell colSpan={2} className="text-center text-muted-foreground py-8">No hay equipos registrados</TableCell></TableRow>
              ) : (
                equipos.map((e) => (
                  <TableRow key={e.idEquipo}>
                    <TableCell className="font-medium">{e.nombreEquipo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditEquipo(e)} title="Editar"><Pencil className="size-4 text-zinc-400 hover:text-zinc-600" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEquipo(e.idEquipo)} title="Eliminar"><Trash2 className="size-4 text-zinc-400 hover:text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
