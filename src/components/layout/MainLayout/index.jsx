import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from '../Sidebar'

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-dvh" style={{ background: 'var(--color-surface)' }}>

      {/* Desktop sidebar — ocupa el alto completo de la pantalla */}
      <div className="hidden lg:flex h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile: overlay al abrir el drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-overlayIn"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden animate-slideInLeft">
            <Sidebar isMobile onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Columna principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Topbar — solo mobile */}
        <header
          className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b flex-shrink-0"
          style={{ borderColor: 'var(--color-border-light)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={20} className="text-gray-700" />
          </button>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}
          >
            SVI
          </span>
        </header>

        {/* Contenido con scroll independiente */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}

export default MainLayout
