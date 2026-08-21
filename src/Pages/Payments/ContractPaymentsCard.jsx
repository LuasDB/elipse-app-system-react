import { useState } from 'react'
import {
  ChevronDown, ChevronUp, User, Home, DollarSign, CheckCircle, Clock,
  AlertTriangle, Hammer, Lock, Paperclip, CheckCircle2, Calendar, Pencil
} from 'lucide-react'
import StatusBadge from '@/components/common/StatusBadge'
import DualPrice from '@/components/common/DualPrice'
import TrafficLightBadge from '@/components/common/TrafficLightBadge'
import { CONTRACT_STATUS, getModalityConfig } from '@/utils/contractConstants'
import { PAYMENT_STATUS } from '@/utils/paymentConstants'
import { getStatusConfig } from '@/utils/projectConstants'
import { formatUSD, formatMXN, convertToMXN } from '@/utils/currency'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'

const ContractPaymentsCard = ({ contract, defaultOpen = false, highlighted = false, onRegisterPayment, onEditPayment, canEditPayments = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const cStatus = getStatusConfig(CONTRACT_STATUS, contract.status)
  const modalityCfg = getModalityConfig(contract.modality || 'monthly')
  const progressPct = contract.totalExpected > 0
    ? Math.round((contract.totalPaid / contract.totalExpected) * 100)
    : 0

  const payments = contract.payments || []

  return (
    <div
      id={`contract-${contract._id}`}
      className={`rounded-xl border bg-white overflow-hidden transition-all ${highlighted ? 'ring-2 ring-offset-2' : ''}`}
      style={{
        borderColor: highlighted ? 'var(--color-accent)' : (contract.overdueCount > 0 ? '#FCA5A5' : 'var(--color-border-light)'),
        boxShadow: 'var(--shadow-sm)',
        ...(highlighted ? { '--tw-ring-color': 'var(--color-accent)' } : {})
      }}
    >
      {/* Header de la card (siempre visible) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-[var(--color-surface)] transition-colors text-left"
      >
        {/* Avatar / Letra del comprador */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold uppercase"
          style={{ background: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}
        >
          {(contract.buyerName?.[0] || '?')}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {contract.buyerName || 'Comprador'}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              · {contract.unitIdentifier}
            </span>
            <StatusBadge label={cStatus.label} color={cStatus.color} bg={cStatus.bg} size="xs" />
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
              style={{ background: modalityCfg.bg, color: modalityCfg.color }}
            >
              {contract.modality === 'milestones' ? <Hammer size={9} /> : <Calendar size={9} />}
              {modalityCfg.shortLabel}
            </span>
          </div>
          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            {contract.contractNumber} · {contract.paymentsCount} pagos
            {contract.overdueCount > 0 && (
              <span className="ml-2 font-semibold" style={{ color: 'var(--color-danger)' }}>
                · {contract.overdueCount} vencidos
              </span>
            )}
          </p>
        </div>

        {/* Saldo + progreso */}
        <div className="text-right flex-shrink-0 hidden sm:block">
          <DualPrice usd={contract.totalBalance} rate={contract.exchangeRate} size="sm" color={contract.totalBalance > 0 ? 'var(--color-danger)' : 'var(--color-success)'} />
          <div className="flex items-center gap-1.5 mt-1 justify-end">
            <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-border-light)' }}>
              <div className="h-full" style={{ width: `${progressPct}%`, background: 'var(--color-success)' }} />
            </div>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--color-success)' }}>{progressPct}%</span>
          </div>
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Contenido expandible */}
      {isOpen && (
        <div className="border-t" style={{ borderColor: 'var(--color-border-light)' }}>
          {/* Summary cards */}
          <div className="px-5 py-3 grid grid-cols-4 gap-3" style={{ background: 'var(--color-surface)' }}>
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Total</p>
              <p className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{formatUSD(contract.totalExpected)}</p>
              {contract.exchangeRate && <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>≈ {formatMXN(convertToMXN(contract.totalExpected, contract.exchangeRate))}</p>}
            </div>
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Cobrado</p>
              <p className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>{formatUSD(contract.totalPaid)}</p>
              {contract.exchangeRate && <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>≈ {formatMXN(convertToMXN(contract.totalPaid, contract.exchangeRate))}</p>}
            </div>
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Saldo</p>
              <p className="text-sm font-bold" style={{ color: 'var(--color-warning)' }}>{formatUSD(contract.totalBalance)}</p>
              {contract.exchangeRate && <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>≈ {formatMXN(convertToMXN(contract.totalBalance, contract.exchangeRate))}</p>}
            </div>
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Vencidos</p>
              <p className="text-sm font-bold" style={{ color: 'var(--color-danger)' }}>{contract.overdueCount}</p>
              <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>de {contract.paymentsCount}</p>
            </div>
          </div>

          {/* Tabla de pagos */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--color-surface-sunken)' }}>
                  {['#', 'Concepto', 'Vencimiento', 'Esperado', 'Pagado', 'Saldo', 'Estado', ''].map((h, i) => (
                    <th key={i} className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      No hay pagos programados
                    </td>
                  </tr>
                ) : payments.map(p => {
                  const pStatus = getStatusConfig(PAYMENT_STATUS, p.status)
                  const isOverdue = p.status === 'vencido'
                  const isPaid = p.status === 'pagado'
                  const hasVouchers = p.vouchers && p.vouchers.length > 0

                  return (
                    <tr key={p._id} className={isOverdue ? 'bg-red-50/40' : 'hover:bg-[var(--color-surface)]'} style={{ borderTop: '1px solid var(--color-border-light)' }}>
                      <td className="px-4 py-2.5 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{p.paymentNumber}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {p.isMilestone && <Hammer size={10} style={{ color: 'var(--color-accent)' }} />}
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{p.concept}</span>
                          {hasVouchers && (
                            <span className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px]" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                              <Paperclip size={8} />{p.vouchers.length}
                            </span>
                          )}
                          {p.isMilestone && p.milestoneStatus === 'completado' && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold" style={{ color: 'var(--color-success)' }}>
                              <CheckCircle2 size={9} /> Completado
                            </span>
                          )}
                          {p.isMilestone && <TrafficLightBadge milestone={p} size="xs" showLabel={false} />}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs ${isOverdue ? 'font-semibold' : ''}`} style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                          {formatDate(p.dueDate)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{formatUSD(p.expectedAmount)}</td>
                      <td className="px-4 py-2.5 text-xs font-medium" style={{ color: 'var(--color-success)' }}>{formatUSD(p.paidAmount)}</td>
                      <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: p.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatUSD(p.balance)}</td>
                      <td className="px-4 py-2.5"><StatusBadge label={pStatus.label} color={pStatus.color} bg={pStatus.bg} size="xs" /></td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {!isPaid && (
                            <button
                              onClick={() => onRegisterPayment(p, contract)}
                              className="px-2.5 py-1 text-[11px] font-medium rounded-md text-white transition-all hover:shadow-sm"
                              style={{ background: 'var(--color-success)' }}
                            >
                              Registrar
                            </button>
                          )}
                          {isPaid && <span className="text-[11px] font-medium" style={{ color: 'var(--color-success)' }}>✓</span>}
                          {canEditPayments && (
                            <button
                              onClick={() => onEditPayment(p, contract)}
                              title="Editar pago"
                              className="p-1 rounded-md transition-colors hover:bg-[var(--color-surface)]"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              <Pencil size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContractPaymentsCard