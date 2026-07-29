import { useNavigate } from 'react-router-dom'
import { ChevronRight, CheckCircle } from 'lucide-react'
import Modal from '@/components/common/Modal'
import { formatUSD } from '@/utils/currency'

// Config visual por tipo de alerta (color, icono de urgencia, textos)
const TYPE_CONFIG = {
  overdue: {
    title: 'Pagos vencidos',
    color: 'var(--color-danger)',
    bg: 'var(--color-danger-bg)',
    emptyText: 'Sin pagos vencidos'
  },
  dueThisMonth: {
    title: 'Vencen este mes',
    color: 'var(--color-warning)',
    bg: 'var(--color-warning-bg)',
    emptyText: 'Sin pagos pendientes este mes'
  },
  upcoming: {
    title: 'Próximos 30 días',
    color: 'var(--color-info)',
    bg: 'var(--color-info-bg)',
    emptyText: 'Sin pagos próximos a vencer'
  }
}

const daysUntil = (dueDate) => {
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due - today) / 86400000)
}

const dueDateLabel = (dueDate) => {
  const diff = daysUntil(dueDate)
  if (diff < 0) return `Venció hace ${Math.abs(diff)} día${Math.abs(diff) === 1 ? '' : 's'}`
  if (diff === 0) return 'Vence hoy'
  return `Vence en ${diff} día${diff === 1 ? '' : 's'}`
}

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?'

// Card de persona/pago para la lista. Al hacer click navega al detalle de
// pagos del contrato correspondiente (página de Pagos, contrato expandido).
const PersonCard = ({ item, config, onClick }) => {
  const diff = daysUntil(item.dueDate)
  const isLate = diff < 0

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl border bg-white hover:shadow-md transition-all flex items-center gap-3 active:scale-[0.99]"
      style={{ borderColor: 'var(--color-border-light)' }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm"
        style={{ background: config.bg, color: config.color }}
      >
        {initials(item.buyerName)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>{item.buyerName || 'Sin nombre'}</p>
        <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {item.unitIdentifier} · {item.concept}
        </p>
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <span
            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
            style={{
              background: isLate ? 'var(--color-danger-bg)' : config.bg,
              color: isLate ? 'var(--color-danger)' : config.color
            }}
          >
            {dueDateLabel(item.dueDate)}
          </span>
          <p className="text-sm font-bold flex-shrink-0" style={{ color: config.color }}>{formatUSD(item.balance)}</p>
        </div>
      </div>

      <ChevronRight size={16} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
    </button>
  )
}

const PaymentAlertModal = ({ isOpen, onClose, type, alerts }) => {
  const navigate = useNavigate()

  if (!isOpen || !type) return null

  const config = TYPE_CONFIG[type]
  const items = alerts?.[type]?.items || []

  const title = (
    <span className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ background: config.color }} />
      {config.title} ({items.length})
    </span>
  )

  // Navega al detalle de pagos del contrato del pago seleccionado y cierra el modal.
  const goToContract = (item) => {
    const params = new URLSearchParams()
    if (item.projectId) params.set('project', item.projectId)
    if (item.contractId) params.set('contract', item.contractId)
    onClose()
    navigate(`/pagos?${params.toString()}`)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      {items.length === 0 ? (
        <div className="py-12 text-center">
          <CheckCircle size={28} className="mx-auto mb-2" style={{ color: 'var(--color-success)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{config.emptyText}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <PersonCard key={item._id} item={item} config={config} onClick={() => goToContract(item)} />
          ))}
        </div>
      )}
    </Modal>
  )
}

export default PaymentAlertModal
