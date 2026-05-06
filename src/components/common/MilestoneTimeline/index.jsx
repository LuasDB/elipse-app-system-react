import { CheckCircle2, Circle, AlertTriangle, Clock } from 'lucide-react'
import { formatUSD, formatMXN, convertToMXN } from '@/utils/currency'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'

/**
 * Timeline visual horizontal de hitos de obra.
 * Recibe los pagos tipo milestone ordenados.
 */
const MilestoneTimeline = ({ milestones = [], exchangeRate, onComplete, onUncomplete, canManage = true }) => {
  if (!milestones.length) {
    return (
      <div className="p-6 text-center rounded-lg border-dashed border-2" style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-muted)' }}>
        <p className="text-sm">No hay hitos definidos para este contrato</p>
      </div>
    )
  }

  const now = new Date()

  // Calcular progreso global
  const completedCount = milestones.filter(m => m.milestoneStatus === 'completado').length
  const paidCount = milestones.filter(m => m.status === 'pagado').length
  const progressPct = Math.round((completedCount / milestones.length) * 100)

  return (
    <div className="space-y-4">
      {/* Header con resumen */}
      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--color-surface)' }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>Avance de obra</p>
          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            {completedCount} de {milestones.length} hitos completados · {paidCount} cobrados
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-accent)' }}>{progressPct}%</p>
          <div className="w-32 h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'var(--color-border-light)' }}>
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: 'var(--color-accent)' }}
            />
          </div>
        </div>
      </div>

      {/* Timeline vertical */}
      <div className="relative">
        {/* Línea vertical conectora */}
        <div className="absolute left-[15px] top-0 bottom-0 w-0.5" style={{ background: 'var(--color-border-light)' }} />

        <div className="space-y-3">
          {milestones.map((m, idx) => {
            const isCompleted = m.milestoneStatus === 'completado'
            const isPaid = m.status === 'pagado'
            const isPartial = m.status === 'parcial'
            const isOverdue = m.estimatedDate && new Date(m.estimatedDate) < now && !isCompleted

            // Estado visual
            let dotColor, dotBg, Icon, statusLabel, statusColor
            if (isPaid) {
              dotColor = 'white'; dotBg = 'var(--color-success)'; Icon = CheckCircle2
              statusLabel = 'Cobrado'; statusColor = 'var(--color-success)'
            } else if (isCompleted) {
              dotColor = 'white'; dotBg = 'var(--color-accent)'; Icon = CheckCircle2
              statusLabel = isPartial ? 'Completado · Cobro parcial' : 'Completado · Pendiente cobro'
              statusColor = 'var(--color-accent)'
            } else if (isOverdue) {
              dotColor = 'white'; dotBg = 'var(--color-danger)'; Icon = AlertTriangle
              statusLabel = 'Atrasado'; statusColor = 'var(--color-danger)'
            } else {
              dotColor = 'var(--color-text-muted)'; dotBg = 'white'; Icon = Circle
              statusLabel = 'Pendiente'; statusColor = 'var(--color-text-muted)'
            }

            return (
              <div key={m._id || idx} className="relative pl-10">
                {/* Dot */}
                <div
                  className="absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10"
                  style={{
                    background: dotBg,
                    borderColor: dotBg === 'white' ? 'var(--color-border)' : dotBg
                  }}
                >
                  <Icon size={14} style={{ color: dotColor }} />
                </div>

                {/* Card */}
                <div
                  className={`p-3 rounded-lg border ${isOverdue ? 'ring-1 ring-red-100' : ''}`}
                  style={{
                    borderColor: isCompleted ? statusColor : 'var(--color-border-light)',
                    background: isCompleted ? `${statusColor}08` : 'white'
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
                          Hito {m.milestoneOrder || idx + 1}
                        </span>
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{ background: `${statusColor}1A`, color: statusColor }}
                        >
                          {statusLabel}
                        </span>
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
                  <div className="flex items-center gap-4 text-[11px] mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    {m.estimatedDate && (
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span>Estimado: {formatDate(m.estimatedDate)}</span>
                      </div>
                    )}
                    {m.milestoneCompletedAt && (
                      <div className="flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                        <CheckCircle2 size={10} />
                        <span>Completado: {formatDate(m.milestoneCompletedAt)}</span>
                      </div>
                    )}
                    {isPartial && (
                      <span style={{ color: 'var(--color-warning)' }}>
                        Cobrado: {formatUSD(m.paidAmount)} / {formatUSD(m.expectedAmount)}
                      </span>
                    )}
                  </div>

                  {/* Notas del hito */}
                  {m.milestoneNotes && (
                    <p className="text-[11px] italic px-2 py-1 rounded mb-2" style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>
                      "{m.milestoneNotes}"
                    </p>
                  )}

                  {/* Acciones */}
                  {canManage && (
                    <div className="flex items-center gap-2 mt-2">
                      {!isCompleted && (
                        <button
                          onClick={() => onComplete?.(m)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors"
                          style={{ background: 'var(--color-accent)', color: 'white' }}
                        >
                          ✓ Marcar como completado
                        </button>
                      )}
                      {isCompleted && !isPaid && m.paidAmount === 0 && (
                        <button
                          onClick={() => onUncomplete?.(m)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors"
                          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                          title="Solo si no hay pagos registrados"
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
