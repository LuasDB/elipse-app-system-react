import { useState, useEffect } from 'react'
import { X, CheckCircle2, Calendar } from 'lucide-react'
import { formatUSD } from '@/utils/currency'

const todayISO = () => new Date().toISOString().slice(0, 10)

const CompleteMilestoneModal = ({ isOpen, onClose, onConfirm, milestone, loading, mode = 'complete' }) => {
  // mode: 'complete' (marcar nuevo) | 'editCommitment' (solo editar fecha)
  const [notes, setNotes] = useState('')
  const [commitmentDate, setCommitmentDate] = useState(todayISO())

  useEffect(() => {
    if (isOpen && milestone) {
      if (mode === 'editCommitment') {
        // Pre-cargar valores actuales
        setNotes(milestone.milestoneNotes || '')
        setCommitmentDate(milestone.commitmentDate?.slice(0, 10) || todayISO())
      } else {
        setNotes('')
        setCommitmentDate(todayISO())
      }
    }
  }, [isOpen, milestone, mode])

  if (!isOpen || !milestone) return null

  const handleConfirm = () => {
    onConfirm({ commitmentDate, notes: notes.trim() || null })
  }

  const isEdit = mode === 'editCommitment'
  const title = isEdit ? 'Editar fecha compromiso' : 'Marcar hito como completado'
  const Icon = isEdit ? Calendar : CheckCircle2
  const ctaLabel = isEdit ? 'Guardar' : 'Confirmar'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-overlayIn" style={{ background: 'rgba(15, 23, 42, 0.55)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{
          background: 'linear-gradient(135deg, var(--color-accent), #B89248)',
          color: 'white'
        }}>
          <div className="flex items-center gap-2">
            <Icon size={18} />
            <h3 className="text-sm font-semibold">{title}</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 rounded-md p-1 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Info del hito */}
          <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface)' }}>
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Hito</p>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{milestone.milestoneName || milestone.concept}</p>
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              <span>Monto: {formatUSD(milestone.expectedAmount)}</span>
              <span>Pagado: {formatUSD(milestone.paidAmount)}</span>
            </div>
          </div>

          {/* Fecha compromiso */}
          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Fecha compromiso de entrega <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={commitmentDate}
              onChange={(e) => setCommitmentDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
              style={{ borderColor: 'var(--color-border)' }}
            />
            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Fecha en que el desarrollador se compromete a entregar este hito
            </p>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Notas <span style={{ color: 'var(--color-text-muted)' }}>(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ej: Entrega prevista al cierre del trimestre. Considera tiempo de tramitología y permisos."
              className="w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 resize-none"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          {/* Aviso */}
          {!isEdit && (
            <div className="p-2.5 rounded-lg text-[11px]" style={{ background: 'var(--color-info-bg)', color: 'var(--color-text-secondary)' }}>
              El hito quedará marcado como completado. Podrás editar la fecha compromiso o revertirlo más adelante.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex items-center justify-end gap-2" style={{ borderTop: '1px solid var(--color-border-light)', background: 'var(--color-surface)' }}>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !commitmentDate}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
            style={{ background: 'var(--color-accent)' }}
          >
            {loading ? 'Guardando...' : (<><Icon size={13} /> {ctaLabel}</>)}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompleteMilestoneModal