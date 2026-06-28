import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Users, Building2, FileText,
  DollarSign, ClipboardCheck, BarChart3,
  LogOut, ChevronLeft, Menu,HelpCircle
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/usuarios', label: 'Usuarios', icon: Users },
  { to: '/proyectos', label: 'Proyectos', icon: Building2 },
  { to: '/contratos', label: 'Contratos', icon: FileText },
  { to: '/pagos', label: 'Pagos', icon: DollarSign },
  { to: '/entregas', label: 'Entregas', icon: ClipboardCheck },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
  { to: '/ayuda', label: 'Ayuda', icon: HelpCircle},
]

const footerItems = [
  { to: '/ayuda', label: 'Ayuda', icon: HelpCircle },
]

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-6 flex items-center justify-between">
        {!collapsed && (
          <div className="animate-fadeIn">
            <h1
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}
              className="text-xl font-semibold tracking-tight"
            >
              S V I
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5 tracking-widest uppercase">
              Sistema de ventas inmobiliarias
            </p>
          </div>
        )}
        {collapsed && (
          <div
            style={{ color: 'var(--color-accent)' }}
            className="text-xl font-bold mx-auto"
          >
            IC
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
        >
          <ChevronLeft size={18} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `
              group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-200
              ${isActive
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }
              ${collapsed ? 'justify-center px-2' : ''}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={19}
                  style={isActive ? { color: 'var(--color-accent)' } : {}}
                  className={!isActive ? 'group-hover:text-slate-300' : ''}
                />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--color-accent)' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

        


      {/* User section */}
      <div className="mx-3 mb-4">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-3" />
        <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
            style={{ background: 'var(--color-primary-light)' }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{user?.name || 'Usuario'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.role || 'admin'}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-gray-200"
      >
        <Menu size={20} className="text-gray-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 animate-overlayIn"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-50 lg:z-auto h-screen flex-shrink-0
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[68px]' : 'w-[250px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ background: 'var(--color-primary-dark)' }}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

export default Sidebar
