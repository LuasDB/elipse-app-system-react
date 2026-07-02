import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Users, Building2, FileText,
  DollarSign, ClipboardCheck, BarChart3,
  LogOut, ChevronLeft, HelpCircle, X
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/usuarios', label: 'Usuarios', icon: Users },
  { to: '/proyectos', label: 'Proyectos', icon: Building2 },
  { to: '/contratos', label: 'Contratos', icon: FileText },
  { to: '/pagos', label: 'Pagos', icon: DollarSign },
  { to: '/entregas', label: 'Entregas', icon: ClipboardCheck },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
  { to: '/ayuda', label: 'Ayuda', icon: HelpCircle },
]

const Sidebar = ({ isMobile = false, onClose }) => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // En mobile nunca se colapsa
  const isCollapsed = isMobile ? false : collapsed

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`
        flex flex-col h-full flex-shrink-0
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[68px]' : 'w-[250px]'}
      `}
      style={{ background: 'var(--color-primary-dark)' }}
    >
      {/* Header */}
      <div className="px-5 py-6 flex items-center justify-between flex-shrink-0">
        {!isCollapsed && (
          <div className="animate-fadeIn min-w-0">
            <h1
              className="text-xl font-semibold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}
            >
              S V I
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5 tracking-widest uppercase truncate">
              Sistema de ventas inmobiliarias
            </p>
          </div>
        )}

        {isCollapsed && (
          <div className="text-xl font-bold mx-auto" style={{ color: 'var(--color-accent)' }}>
            IC
          </div>
        )}

        {/* Botón colapsar — solo desktop */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5 flex-shrink-0"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
        )}

        {/* Botón cerrar — solo mobile */}
        {isMobile && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5 flex-shrink-0"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Divisor */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-shrink-0" />

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => `
              group flex items-center gap-3 rounded-lg text-[13.5px] font-medium transition-all duration-200
              ${isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
              ${isActive
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={19}
                  style={isActive ? { color: 'var(--color-accent)' } : {}}
                  className={!isActive ? 'group-hover:text-slate-300 flex-shrink-0' : 'flex-shrink-0'}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: 'var(--color-accent)' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sección de usuario */}
      <div className="mx-3 mb-4 flex-shrink-0">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-3" />
        <div className={`flex items-center gap-3 px-3 py-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
            style={{ background: 'var(--color-primary-light)' }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{user?.name || 'Usuario'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.role || 'admin'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
