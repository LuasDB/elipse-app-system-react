import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Briefcase } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import Toast from '@/components/common/Toast'
import DualPrice from '@/components/common/DualPrice'
import sellersService from '@/services/sellersService'
import { formatUSD } from '@/utils/currency'

const SellersPage = () => {
  const navigate = useNavigate()
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await sellersService.getAll()
      setSellers(response.data || [])
    } catch (error) {
      setToast({ message: error.message || 'Error al cargar vendedores', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSellers() }, [fetchSellers])

  const filteredSellers = sellers.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
  })

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Vendedores"
        subtitle="Desempeño y estado de cuenta de comisiones por vendedor"
      />

      {/* Búsqueda */}
      <div
        className="flex items-center gap-3 p-4 rounded-xl border bg-white mb-4"
        style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
            style={{ borderColor: 'var(--color-border)' }}
          />
        </div>
      </div>

      {/* Tabla */}
      <div
        className="rounded-xl border bg-white overflow-hidden"
        style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--color-surface-sunken)' }}>
                {['Vendedor', 'Correo', 'Contratos', 'Ventas totales', 'Comisión asignada', 'Pagada', 'Pendiente'].map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-light)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Cargando vendedores...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    <Briefcase size={40} className="mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      {search ? 'No se encontraron resultados' : 'Aún no hay vendedores registrados'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {search ? 'Prueba con otro término' : 'Crea usuarios con rol "Vendedor" en el módulo de Usuarios'}
                    </p>
                  </td>
                </tr>
              ) : filteredSellers.map((seller) => (
                <tr
                  key={seller._id}
                  onClick={() => navigate(`/vendedores/${seller._id}`)}
                  className="hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                  style={{ borderBottom: '1px solid var(--color-border-light)' }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-light))` }}
                      >
                        {seller.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{seller.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{seller.email}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{seller.stats?.contractsCount || 0}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{formatUSD(seller.stats?.totalSales)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{formatUSD(seller.stats?.commissionAssigned)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>{formatUSD(seller.stats?.commissionPaid)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium" style={{ color: seller.stats?.commissionPending > 0 ? 'var(--color-danger)' : 'var(--color-text)' }}>{formatUSD(seller.stats?.commissionPending)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredSellers.length > 0 && (
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--color-border-light)', background: 'var(--color-surface-sunken)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Mostrando <strong>{filteredSellers.length}</strong> de <strong>{sellers.length}</strong> vendedores
            </p>
          </div>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}

export default SellersPage
