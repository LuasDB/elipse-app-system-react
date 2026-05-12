import { CheckCircle2, Circle, Clock, Pencil, Hammer, AlertCircle } from 'lucide-react'
import { formatUSD, formatMXN, convertToMXN } from '@/utils/currency'
import { getMilestoneTrafficLight, MILESTONE_TRAFFIC } from '@/utils/contractConstants'
import TrafficLightBadge from '@/components/common/TrafficLightBadge'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'

const MilestoneTimeline = ({ milestones = [], exchangeRate, onComplete, onUncomplete, onEditCommitment, canManage = true }) => {
  if (!milestones.length) {
    return (
      <div className="p-6 text-center rounded-lg border-dashed border-2" style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-muted)' }}>
        <p className="text-sm">No hay hitos definidos para este contrato</p>
      </div>
    )
  }

  // Progreso global
  const completedCount = milestones.filter(m => m.milestoneStatus === 'completado').length
  const paidCount = milestones.filter(m => (m.paidAmount || 0) > 0).length
  const progressPct = Math.round((completedCount / milestones.length) * 100)

  // Conteos de semáforo (solo no completados)
  const pendingMilestones = milestones.filter(m => m.milestoneStatus !== 'completado')
  const trafficCounts = {
    red: pendingMilestones.filter(m => getMilestoneTrafficLight(m).value === 'red').length,
    yellow: pendingMilestones.filter(m => getMilestoneTrafficLight(m).value === 'yellow').length,
    green: pendingMilestones.filter(m => getMilestoneTrafficLight(m).value === 'green').length
  }

  return (
    <div className="space-y-4">
      {/* Header con progreso */}
      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--color-surface)' }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>Avance de obra</p>
          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            {paidCount} pagados · {completedCount} de {milestones.length} confirmados
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-accent)' }}>{progressPct}%</p>
          <div className="w-32 h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'var(--color-border-light)' }}>
            <div className="h-full transition-all duration-500" style={{ width: `${progressPct}%`, background: 'var(--color-accent)' }} />
          </div>
        </div>
      </div>

      {/* Semáforo agregado (solo si hay hitos pendientes con fechas) */}
      {pendingMilestones.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {['red', 'yellow', 'green'].map(key => {
            const config = MILESTONE_TRAFFIC[key]
            const count = trafficCounts[key]
            return (
              <div
                key={key}
                className="p-3 rounded-lg border flex items-center gap-3"
                style={{
                  borderColor: count > 0 ? config.color : 'var(--color-border-light)',
                  background: count > 0 ? config.bg : 'white'
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: config.color }}
                >
                  {key === 'red' ? <AlertCircle size={16} color="white" /> : key === 'yellow' ? <Clock size={16} color="white" /> : <CheckCircle2 size={16} color="white" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold tracking-tight" style={{ color: config.color }}>{count}</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>{config.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Timeline vertical */}
      <div className="relative">
        <div className="absolute left-[15px] top-0 bottom-0 w-0.5" style={{ background: 'var(--color-border-light)' }} />

        <div className="space-y-3">
          {milestones.map((m, idx) => {
            const isCompleted = m.milestoneStatus === 'completado'
            const paidAmount = m.paidAmount || 0
            const isFullyPaid = paidAmount >= (m.expectedAmount || 0) && paidAmount > 0
            const isPartiallyPaid = paidAmount > 0 && !isFullyPaid
            const hasAnyPayment = paidAmount > 0
            const traffic = getMilestoneTrafficLight(m)

            // Estado del dot (icono + color)
            let DotIcon, dotBg, dotColor
            if (isCompleted) {
              DotIcon = CheckCircle2; dotBg = traffic.color; dotColor = 'white'
            } else if (isFullyPaid) {
              DotIcon = Hammer; dotBg = 'var(--color-accent)'; dotColor = 'white'
            } else if (isPartiallyPaid) {
              DotIcon = Hammer; dotBg = 'var(--color-warning)'; dotColor = 'white'
            } else {
              DotIcon = Circle; dotBg = 'white'; dotColor = 'var(--color-text-muted)'
            }

            // Estado textual del pago
            let payStatusLabel, payStatusColor
            if (isCompleted) { payStatusLabel = 'Entregado'; payStatusColor = traffic.color }
            else if (isFullyPaid) { payStatusLabel = 'Listo para confirmar'; payStatusColor = 'var(--color-accent)' }
            else if (isPartiallyPaid) { payStatusLabel = 'Cobro parcial'; payStatusColor = 'var(--color-warning)' }
            else { payStatusLabel = 'Pendiente de cobro'; payStatusColor = 'var(--color-text-muted)' }

            return (
              <div key={m._id || idx} className="relative pl-10">
                <div
                  className="absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10"
                  style={{ background: dotBg, borderColor: dotBg === 'white' ? 'var(--color-border)' : dotBg }}
                >
                  <DotIcon size={14} style={{ color: dotColor }} />
                </div>

                <div
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: isCompleted ? traffic.color : (traffic.value === 'red' ? traffic.color : 'var(--color-border-light)'),
                    background: isCompleted ? `${traffic.color}08` : 'white'
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
                          Hito {m.milestoneOrder || idx + 1}
                        </span>
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{ background: `${payStatusColor}1A`, color: payStatusColor }}
                        >
                          {payStatusLabel}
                        </span>
                        {/* Semáforo */}
                        <TrafficLightBadge milestone={m} size="xs" />
                      </div>
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                        {m.milestoneName || m.concept}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{formatUSD(m.expectedAmount)}</p>
                      {exchangeRate && (
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          ≈ {formatMXN(convertToMXN(m.expectedAmount, exchangeRate))}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-[11px] mb-2 flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
                    {m.commitmentDate && (
                      <div className="flex items-center gap-1" style={{ color: traffic.color }}>
                        <Clock size={10} />
                        <span>Compromiso: {formatDate(m.commitmentDate)}</span>
                        {canManage && (
                          <button
                            onClick={() => onEditCommitment?.(m)}
                            className="ml-1 p-0.5 rounded hover:bg-white transition-colors"
                            title="Editar fecha compromiso"
                          >
                            <Pencil size={10} />
                          </button>
                        )}
                      </div>
                    )}
                    {hasAnyPayment && (
                      <span style={{ color: isFullyPaid ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        Cobrado: {formatUSD(paidAmount)} / {formatUSD(m.expectedAmount)}
                      </span>
                    )}
                  </div>

                  {/* Notas */}
                  {m.milestoneNotes && (
                    <p className="text-[11px] italic px-2 py-1 rounded mb-2" style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>
                      "{m.milestoneNotes}"
                    </p>
                  )}

                  {/* Acciones */}
                  {canManage && (
                    <div className="flex items-center gap-2 mt-2">
                      {!isCompleted && hasAnyPayment && (
                        <button
                          onClick={() => onComplete?.(m)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors"
                          style={{ background: 'var(--color-accent)', color: 'white' }}
                        >
                          ✓ Marcar como completado
                        </button>
                      )}
                      {!isCompleted && !hasAnyPayment && (
                        <p className="text-[10px] italic" style={{ color: 'var(--color-text-muted)' }}>
                          Registra al menos un pago para poder completar este hito
                        </p>
                      )}
                      {isCompleted && (
                        <button
                          onClick={() => onUncomplete?.(m)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors"
                          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                          title="Volver a pendiente (no afecta los pagos registrados)"
                        >
                          Revertir
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MilestoneTimeline