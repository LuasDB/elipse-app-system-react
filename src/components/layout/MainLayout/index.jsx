import { useState } from "react"
import { Menu } from "lucide-react"
import Sidebar from "../Sidebar"

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-dvh bg-[var(--color-surface)]">

      {/* Sidebar (desktop) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar (mobile overlay) */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl animate-slideIn">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Topbar (mobile only) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b"
          style={{ borderColor: 'var(--color-border-light)' }}
        >
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <span className="text-sm font-semibold">Panel</span>
          <div />
        </div>

        {/* Content */}
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