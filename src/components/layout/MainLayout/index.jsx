import Sidebar from '@/components/layout/Sidebar'

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[var(--color-surface)]">
        <div className="p-6 lg:p-8 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default MainLayout
