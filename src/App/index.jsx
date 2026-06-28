import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import MainLayout from '@/components/layout/MainLayout'
import Login from '@/Pages/Login'
import Dashboard from '@/Pages/Dashboard'
import UsersPage from '@/Pages/Users'
import ProjectsPage from '@/Pages/Projects'
import ProjectDetail from '@/Pages/Projects/ProjectDetail'
import ContractsPage from '@/Pages/Contracts'
import PaymentsPage from '@/Pages/Payments'
import Help from '@/Pages/Help'


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" />
}

const ComingSoon = ({ label }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--color-accent-muted)' }}>
      <span className="text-2xl">🏗️</span>
    </div>
    <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>{label}</h2>
    <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>Este módulo se encuentra en desarrollo</p>
  </div>
)

const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/usuarios" element={<UsersPage />} />
                <Route path="/proyectos" element={<ProjectsPage />} />
                <Route path="/proyectos/:id" element={<ProjectDetail />} />
                <Route path="/contratos" element={<ContractsPage />} />
                <Route path="/pagos" element={<PaymentsPage />} />
                <Route path="/entregas" element={<ComingSoon label="Entregas" />} />
                <Route path="/reportes" element={<ComingSoon label="Reportes" />} />
                <Route path="/ayuda" element={<Help />} />

                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App