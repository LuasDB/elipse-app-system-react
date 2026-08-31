import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, ChevronDown, RefreshCw, ArrowUpRight } from 'lucide-react'
import auditService from '@/services/auditService'
import AuditList from './AuditList'

const LIMIT = 50

// Historial de cambios de un registro concreto (contrato, pago, vendedor...).
// Solo debe renderizarse para el rol admin. Carga perezosa al desplegar y trae
// como máximo los LIMIT movimientos más recientes; si hay más, ofrece abrir la
// bitácora global ya filtrada por ese registro.
const AuditTrail = ({ entity, entityId, title = 'Historial de cambios', defaultOpen = false }) => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(defaultOpen)
  const [items, setItems] = useState(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchLog = useCallback(async () => {
    if (!entity || !entityId) return
    setLoading(true)
    setError(null)
    try {
      const res = await auditService.byEntity(entity, entityId, { limit: LIMIT })
      setItems(res.data?.items || [])
      setTotal(res.data?.total || 0)
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial')
    } finally {
      setLoading(false)
    }
  }, [entity, entityId])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next && items === null) fetchLog()
  }

  const shown = items?.length || 0
  const hasMore = total > shown

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface-raised)' }}
    >
      <div className="flex items-center">
        <button
          onClick={toggle}
          className="flex-1 flex items-center gap-2.5 px-4 py-3 text-left hover:bg-[var(--color-surface)] transition-colors"
        >
          <History size={15} style={{ color: 'var(--color-accent)' }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>
            {title}
          </span>
          {Array.isArray(items) && (
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
              ({total})
            </span>
          )}
          <ChevronDown
            size={15}
            className={`ml-auto transition-transform ${open ? 'rotate-180' : ''}`}
            style={{ color: 'var(--color-text-muted)' }}
          />
        </button>
        {open && (
          <button
            onClick={fetchLog}
            title="Actualizar"
            className="px-3 py-3 hover:bg-[var(--color-surface)] transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        )}
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--color-border-light)' }}>
          {error ? (
            <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--color-danger)' }}>{error}</p>
          ) : (
            <>
              <AuditList
                items={items || []}
                loading={loading}
                showEntity={false}
                emptyLabel="Este registro no tiene movimientos en la bitácora"
              />
              {hasMore && (
                <button
                  onClick={() => navigate(`/auditoria?entity=${entity}&entityId=${entityId}`)}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-medium hover:bg-[var(--color-surface)] transition-colors"
                  style={{ color: 'var(--color-info)', borderTop: '1px solid var(--color-border-light)' }}
                >
                  Ver historial completo ({total})
                  <ArrowUpRight size={13} />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AuditTrail
