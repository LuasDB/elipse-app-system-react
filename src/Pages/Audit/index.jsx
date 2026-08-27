import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, ChevronDown, ChevronLeft, ChevronRight, ScrollText, RefreshCw, X, Crosshair } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import Toast from '@/components/common/Toast'
import AuditList from '@/components/common/AuditTrail/AuditList'
import auditService from '@/services/auditService'
import { AUDIT_ENTITIES, getActionConfig, getEntityConfig } from '@/utils/auditConstants'

const PAGE_SIZE = 40
const EMPTY_FILTERS = { search: '', entity: '', entityId: '', action: '', actorId: '', from: '', to: '' }

const AuditPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    entity: searchParams.get('entity') || '',
    entityId: searchParams.get('entityId') || '',
  }))
  const [page, setPage] = useState(1)
  const [result, setResult] = useState({ items: [], total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [options, setOptions] = useState({ actions: [], entities: [], actors: [] })
  const [toast, setToast] = useState(null)
  const debounceRef = useRef(null)
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    auditService.options()
      .then((res) => setOptions(res.data || { actions: [], entities: [], actors: [] }))
      .catch(() => {})
  }, [])

  const fetchLog = useCallback(async () => {
    setLoading(true)
    try {
      const res = await auditService.list({ ...filters, page, limit: PAGE_SIZE })
      setResult(res.data || { items: [], total: 0, pages: 1, page: 1 })
    } catch (err) {
      setToast({ message: err.message || 'Error al cargar la bitácora', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => { fetchLog() }, [fetchLog])

  // Búsqueda con debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilters((f) => (f.search === searchInput ? f : { ...f, search: searchInput }))
      setPage(1)
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [searchInput])

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS)
    setSearchInput('')
    setPage(1)
    setSearchParams({}, { replace: true })
  }

  const clearEntityScope = () => {
    setFilters((f) => ({ ...f, entityId: '' }))
    setPage(1)
    const next = new URLSearchParams(searchParams)
    next.delete('entityId')
    setSearchParams(next, { replace: true })
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)
  const selectClass = 'pl-3 pr-8 py-2 text-sm rounded-lg border bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 appearance-none cursor-pointer'
  const selectStyle = { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Auditoría"
        subtitle="Registro de altas, cambios y eliminaciones. Quién hizo cada movimiento y cuándo."
        actions={
          <button
            onClick={fetchLog}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        }
      />

      {/* Alcance: historial de un registro específico (llega desde el detalle) */}
      {filters.entityId && (
        <div
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border mb-4 text-sm"
          style={{ borderColor: 'var(--color-accent)', background: 'var(--color-accent-muted)', color: 'var(--color-text-secondary)' }}
        >
          <Crosshair size={15} style={{ color: 'var(--color-accent)' }} />
          <span>
            Historial de {getEntityConfig(filters.entity).label.toLowerCase()}{' '}
            <span className="font-mono text-xs">{filters.entityId}</span>
          </span>
          <button
            onClick={clearEntityScope}
            className="ml-auto flex items-center gap-1 text-xs font-medium hover:underline"
            style={{ color: 'var(--color-accent)' }}
          >
            <X size={13} /> Ver toda la bitácora
          </button>
        </div>
      )}

      {/* Filtros */}
      <div
        className="flex flex-col gap-3 p-4 rounded-xl border bg-white mb-4"
        style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por registro, usuario o acción..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          <div className="relative">
            <select value={filters.entity} onChange={(e) => setFilter('entity', e.target.value)} className={selectClass} style={selectStyle}>
              <option value="">Todos los módulos</option>
              {(options.entities.length ? options.entities : Object.keys(AUDIT_ENTITIES)).map((e) => (
                <option key={e} value={e}>{AUDIT_ENTITIES[e]?.plural || e}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
          </div>

          <div className="relative">
            <select value={filters.action} onChange={(e) => setFilter('action', e.target.value)} className={selectClass} style={selectStyle}>
              <option value="">Todas las acciones</option>
              {options.actions.map((a) => (
                <option key={a} value={a}>{getActionConfig(a).label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
          </div>

          <div className="relative">
            <select value={filters.actorId} onChange={(e) => setFilter('actorId', e.target.value)} className={selectClass} style={selectStyle}>
              <option value="">Todos los usuarios</option>
              {options.actors.map((a) => (
                <option key={a.userId} value={a.userId}>{a.name || a.email || a.userId}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Desde
            <input type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)}
              className="px-2 py-1.5 text-sm rounded-lg border bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }} />
          </label>
          <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Hasta
            <input type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)}
              className="px-2 py-1.5 text-sm rounded-lg border bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }} />
          </label>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium hover:underline" style={{ color: 'var(--color-danger)' }}>
              <X size={13} /> Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-surface-sunken)' }}>
          <ScrollText size={14} style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {loading ? 'Cargando...' : `${result.total} movimiento(s)`}
          </p>
        </div>

        <AuditList items={result.items} loading={loading} showEntity emptyLabel="No hay movimientos que coincidan con los filtros" />

        {!loading && result.pages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border-light)', background: 'var(--color-surface-sunken)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Página {result.page} de {result.pages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={result.page <= 1}
                className="p-1.5 rounded-lg border transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <ChevronLeft size={15} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(result.pages, p + 1))}
                disabled={result.page >= result.pages}
                className="p-1.5 rounded-lg border transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <ChevronRight size={15} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default AuditPage
