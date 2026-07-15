import { useState, useEffect } from 'react'
import useLockBodyScroll from '@/hooks/useLockBodyScroll'
import { X, Percent } from 'lucide-react'
import DualPrice from '@/components/common/DualPrice'

const AssignCommissionModal = ({ isOpen, onClose, onConfirm, contract, currentCommission, loading }) => {
  const [percentage, setPercentage] = useState('')
  const [notes, setNotes] = useState('')
  useLockBodyScroll(isOpen)

  useEffect(() => {
    if (isOpen) {
      setPercentage(currentCommission?.percentage ?? '')
      setNotes('')
    }
  }, [isOpen, currentCommission])

  if (!isOpen || !contract) return null

  const pct = Number(percentage) || 0
  const previewAmount = (Number(contract.salePrice) || 0) * pct / 100

  const handleConfirm = () => {
    onConfirm({ percentage: pct, notes: notes.trim() || null })
  }

  const isValid = percentage !== '' && pct >= 0 && pct <= 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-overlayIn" style={{ background: 'rgba(15, 23, 42, 0.55)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{
          background: 'linear-gradient(135deg, var(--color-accent), #B89248)',
          color: 'white'
        }}>
          <div className="flex items-center gap-2">
            <Percent size={18} />
            <h3 className="text-sm font-semibold">Asignar comisión</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 rounded-md p-1 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Info del contrato */}
          <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface)' }}>
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Contrato</p>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{contract.contractNumber}</p>
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              <span>Vendedor: {contract.seller?.name || '—'}</span>
              <span>Precio de venta: {contract.salePrice ? `$${Number(contract.salePrice).toLocaleString('en-US')}` : '$0'}</span>
            </div>
          </div>

          {/* Porcentaje */}
          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Porcentaje de comisión (%) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="Ej: 5"
              className="w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          {/* Preview del monto */}
          <div className="p-3 rounded-lg" style={{ background: 'var(--color-accent-muted)' }}>
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Monto de comisión estimado</p>
            <DualPrice usd={previewAmount} rate={contract.exchangeRate} size="lg" />
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
              placeholder="Motivo del ajuste, condiciones especiales, etc."
              className="w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 resize-none"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          {currentCommission && (
            <div className="p-2.5 rounded-lg text-[11px]" style={{ background: 'var(--color-info-bg)', color: 'var(--color-text-secondary)' }}>
              Este contrato ya tiene una comisión asignada del {currentCommission.percentage}%. Al confirmar se actualizará y se conservará el historial anterior.
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
            disabled={loading || !isValid}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
            style={{ background: 'var(--color-accent)' }}
          >
            {loading ? 'Guardando...' : (<><Percent size={13} /> Confirmar</>)}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssignCommissionModal
