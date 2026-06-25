import { Routes, Route, Navigate } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import VoluntarioLayout from './layouts/VoluntarioLayout'
import Login from './pages/Login'
import Dashboard from './pages/admin/Dashboard'
import Servicios from './pages/admin/Servicios'
import Planes from './pages/admin/Planes'
import Cronograma from './pages/admin/Cronograma'
import Personal from './pages/admin/Personal'
import Archivos from './pages/admin/Archivos'
import Agenda from './pages/voluntario/Agenda'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute />}>
        <Route index element={<Login />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="planes" element={<Planes />} />
          <Route path="planes/:idPlan/cronograma" element={<Cronograma />} />
          <Route path="personal" element={<Personal />} />
          <Route path="archivos" element={<Archivos />} />
        </Route>
      </Route>

      <Route path="/voluntario" element={<ProtectedRoute requiredRole="ROLE_VOLUNTARIO" />}>
        <Route element={<VoluntarioLayout />}>
          <Route index element={<Navigate to="/voluntario/agenda" replace />} />
          <Route path="agenda" element={<Agenda />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
