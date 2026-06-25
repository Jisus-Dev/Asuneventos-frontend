import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import api from '../api/api'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: { email: '', password: '' },
  })

  const handleSubmit = async (values) => {
    if (loading) return
    setLoading(true)

    try {
      const response = await api.post('/auth/login', values)
      const { token, rol, email } = response.data

      login(token, rol, email)
      toast.success('Login exitoso')

      const destino = rol === 'ROLE_ADMIN' ? '/admin/dashboard' : '/voluntario/agenda'
      navigate(destino, { replace: true })
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Credenciales inválidas')
      } else {
        toast.error(err.response?.data?.message || 'Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel - branding */}
      <div className="relative hidden lg:flex items-center justify-center bg-zinc-900 p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

        <div className="relative z-10 max-w-sm">
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white text-zinc-900 font-bold text-lg mb-6">
              A
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Asuneventos
            </h1>
            <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
              Plataforma de gestión logística para eventos. Administra servicios, planes y personal con eficiencia.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'Centralizado', label: 'Todo en un solo lugar' },
              { value: 'Seguro', label: 'Control de acceso por roles' },
              { value: 'En tiempo real', label: 'Seguimiento de actividades' },
              { value: 'Escalable', label: 'Desde pequeños a grandes eventos' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm font-semibold text-white">{item.value}</div>
                <div className="text-xs text-zinc-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>

          <p className="mt-16 text-xs text-zinc-600">&copy; 2025 Asuneventos</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile branding */}
          <div className="lg:hidden mb-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 text-white font-bold text-lg mb-4">
              A
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Asuneventos</h1>
            <p className="text-sm text-zinc-500 mt-1">Gestión logística de eventos</p>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Iniciar sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ required: 'El email es requerido' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="usuario@asuneventos.com"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    rules={{ required: 'La contraseña es requerida' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••••"
                            autoComplete="current-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Iniciando sesión...
                      </span>
                    ) : (
                      'Iniciar sesión'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex justify-center">
              <p className="text-xs text-muted-foreground">
                Asuneventos v1.0
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
