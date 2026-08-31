import { useState } from 'react'
import { ChevronDown, ArrowRight, ScrollText } from 'lucide-react'
import RoleBadge from '@/components/common/RoleBadge'
import { getActionConfig, getEntityConfig, getFieldLabel } from '@/utils/auditConstants'

const isIsoDate = (s) =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s)

const formatValue = (v) => {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? 'Sí' : 'No'
  if (isIsoDate(v)) return new Date(v).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
  if (typeof v === 'number') return v.toLocaleString('es-MX')
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

const formatDateTime = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const fmtUSD = (n) =>
  typeof n === 'number' && !Number.isNaN(n)
    ? n.toLocaleString('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
    : '—'

const STATUS_LABELS = { pendiente: 'Pendiente', parcial: 'Parcial', pagado: 'Pagado', vencido: 'Vencido' }

// Extrae, para las acciones de baja en cascada / reversión, los datos que vale
// la pena mostrar como tabla legible en lugar de solo el JSON crudo.
const getCascadeData = (item) => {
  const snap = item.snapshot
  const meta = item.meta || {}
  if (item.action === 'contract_hard_deleted') {
    return { contract: snap?.contract, payments: snap?.payments || [], commissions: snap?.commissions || [] }
  }
  if (item.action === 'deleted' && item.entity === 'contract') {
    return { contract: snap, payments: meta.removedPayments || [], commissions: meta.removedCommissions || [] }
  }
  if (item.action === 'payments_deleted') {
    return { payments: Array.isArray(snap) ? snap : [] }
  }
  if (item.action === 'payment_reverted') {
    return { movements: snap?.removedMovements || [] }
  }
  return null
}

const MiniTable = ({ title, headers, rows }) => {
  if (!rows.length) return null
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border-light)' }}>
      <div
        className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider"
        style={{ background: 'var(--color-surface-sunken)', color: 'var(--color-text-muted)' }}
      >
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ color: 'var(--color-text-muted)' }}>
              {headers.map((h, i) => (
                <th key={i} className={`px-3 py-1.5 font-medium ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells, r) => (
              <tr key={r} style={{ borderTop: '1px solid var(--color-border-light)' }}>
                {cells.map((c, i) => (
                  <td
                    key={i}
                    className={`px-3 py-1.5 ${i === 0 ? 'text-left' : 'text-right'}`}
                    style={{ color: i === 0 ? 'var(--color-text)' : 'var(--color-text-secondary)' }}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const CascadeDetail = ({ data }) => {
  const { contract, payments = [], commissions = [], movements = [] } = data
  return (
    <div className="space-y-2">
      {contract && (
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Contrato <span className="font-medium">{contract.contractNumber || '—'}</span>
          {contract.buyerName ? ` · ${contract.buyerName}` : ''}
          {contract.unitIdentifier ? ` · ${contract.unitIdentifier}` : ''}
        </p>
      )}
      <MiniTable
        title={`Pagos eliminados (${payments.length})`}
        headers={['Concepto', 'Esperado', 'Pagado', 'Estado']}
        rows={payments.map((p) => [
          p.concept || '—', fmtUSD(p.expectedAmount), fmtUSD(p.paidAmount), STATUS_LABELS[p.status] || p.status || '—',
        ])}
      />
      <MiniTable
        title={`Comisiones eliminadas (${commissions.length})`}
        headers={['Vendedor', 'Asignado', 'Pagado', 'Estado']}
        rows={commissions.map((c) => [
          c.sellerName || '—', fmtUSD(c.amount), fmtUSD(c.paidAmount), STATUS_LABELS[c.status] || c.status || '—',
        ])}
      />
      <MiniTable
        title={`Movimientos borrados (${movements.length})`}
        headers={['Monto', 'Tipo de cambio', 'Fecha', 'Referencia']}
        rows={movements.map((m) => [
          fmtUSD(m.amount),
          typeof m.exchangeRate === 'number' ? m.exchangeRate.toLocaleString('es-MX') : '—',
          formatValue(m.exchangeRateDate || m.registeredAt),
          m.reference || '—',
        ])}
      />
    </div>
  )
}

// Claves de meta que vale la pena mostrar como texto (el resto se ve en el snapshot)
const META_LABELS = {
  amount: 'Monto',
  mxnEquivalent: 'Equivalente MXN',
  exchangeRate: 'Tipo de cambio',
  paymentMethod: 'Método de pago',
  reference: 'Referencia',
  generated: 'Pagos generados',
  replaced: 'Pagos reemplazados',
  deleted: 'Pagos eliminados',
  preserved: 'Pagos conservados',
  removed: 'Pagos removidos',
  files: 'Archivos',
  fileName: 'Archivo',
  filename: 'Archivo',
  contractId: 'ID de contrato',
  ip: 'IP',
  confirmedWithPassword: 'Autorizado con contraseña',
  unitReleased: 'Unidad liberada',
  reason: 'Motivo',
  removedMovementsCount: 'Movimientos borrados',
}

const META_REASON_LABELS = {
  contract_hard_deleted: 'baja del contrato en cascada',
}

const MetaLine = ({ meta }) => {
  if (!meta) return null
  const entries = Object.entries(meta).filter(
    ([k, v]) => k !== 'cascade' && k !== 'removedPayments' && k !== 'removedCommissions' &&
      v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0),
  )
  if (meta.cascade) {
    entries.push(['_cascade', `${meta.cascade.payments} pago(s) y ${meta.cascade.commissions} comisión(es) eliminados en cascada`])
  }
  if (!entries.length) return null
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
      {entries.map(([k, v]) => (
        <span key={k}>
          <span style={{ color: 'var(--color-text-muted)' }}>
            {k === '_cascade' ? '' : `${META_LABELS[k] || k}: `}
          </span>
          {k === 'reason'
            ? (META_REASON_LABELS[v] || v)
            : Array.isArray(v) ? v.join(', ') : formatValue(v)}
        </span>
      ))}
    </div>
  )
}

const AuditRow = ({ item, showEntity }) => {
  const [open, setOpen] = useState(false)
  const [showSnapshot, setShowSnapshot] = useState(false)
  const action = getActionConfig(item.action)
  const entity = getEntityConfig(item.entity)
  const actorName = item.actor?.name || item.userName || 'Sistema'
  const changes = item.changes || []
  const cascade = getCascadeData(item)
  const isRemoval = item.action === 'deleted' || (item.action || '').includes('removed') || (item.action || '').includes('deleted')
  const hasDetail = changes.length > 0 || item.meta || item.snapshot

  return (
    <div style={{ borderBottom: '1px solid var(--color-border-light)' }}>
      <button
        onClick={() => hasDetail && setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${hasDetail ? 'hover:bg-[var(--color-surface)] cursor-pointer' : 'cursor-default'}`}
      >
        <span
          className="inline-flex items-center flex-shrink-0 text-[11px] font-semibold rounded-full px-2.5 py-1"
          style={{ background: action.bg, color: action.color }}
        >
          {action.label}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm truncate" style={{ color: 'var(--color-text)' }}>
            {showEntity && (
              <span style={{ color: 'var(--color-text-muted)' }}>{entity.label} · </span>
            )}
            <span className="font-medium">{item.entityLabel || item.entityId}</span>
          </p>
          <p className="text-xs mt-0.5 flex items-center gap-1.5 flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>{actorName}</span>
            {item.actor?.role && <RoleBadge role={item.actor.role} size="xs" />}
            <span>·</span>
            <span>{formatDateTime(item.createdAt)}</span>
          </p>
        </div>

        {hasDetail && (
          <ChevronDown
            size={16}
            className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            style={{ color: 'var(--color-text-muted)' }}
          />
        )}
      </button>

      {open && hasDetail && (
        <div className="px-4 pb-4 pt-1 space-y-3" style={{ background: 'var(--color-surface)' }}>
          {changes.length > 0 && (
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border-light)' }}>
              {changes.map((c, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[minmax(90px,1fr)_2fr] gap-2 px-3 py-2 text-xs items-center"
                  style={{ borderBottom: i < changes.length - 1 ? '1px solid var(--color-border-light)' : 'none', background: 'var(--color-surface-raised)' }}
                >
                  <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {getFieldLabel(c.field)}
                  </span>
                  <span className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="line-through" style={{ color: 'var(--color-text-muted)' }}>{formatValue(c.from)}</span>
                    <ArrowRight size={12} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>{formatValue(c.to)}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          <MetaLine meta={item.meta} />

          {cascade && (
            <CascadeDetail data={cascade} />
          )}

          {item.snapshot && (
            <div>
              <button
                onClick={() => setShowSnapshot((s) => !s)}
                className="text-xs font-medium hover:underline"
                style={{ color: 'var(--color-info)' }}
              >
                {showSnapshot ? 'Ocultar' : 'Ver'} {cascade ? 'JSON completo' : `copia del registro ${isRemoval ? 'eliminado' : ''}`}
              </button>
              {showSnapshot && (
                <pre
                  className="mt-2 text-[11px] leading-relaxed rounded-lg p-3 overflow-x-auto"
                  style={{ background: 'var(--color-surface-sunken)', color: 'var(--color-text-secondary)' }}
                >
                  {JSON.stringify(item.snapshot, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const AuditList = ({ items = [], showEntity = true, loading = false, emptyLabel = 'Sin movimientos registrados' }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <div className="w-7 h-7 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Cargando historial...</p>
      </div>
    )
  }
  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <ScrollText size={36} style={{ color: 'var(--color-border)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{emptyLabel}</p>
      </div>
    )
  }
  return (
    <div>
      {items.map((item, i) => (
        <AuditRow key={item._id || i} item={item} showEntity={showEntity} />
      ))}
    </div>
  )
}

export default AuditList
