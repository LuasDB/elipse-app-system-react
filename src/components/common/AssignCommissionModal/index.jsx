import { useState, useEffect } from 'react'
import useLockBodyScroll from '@/hooks/useLockBodyScroll'
import { X, Coins, Plus, Pencil, Trash2, Check, XCircle } from 'lucide-react'
import { formatUSD } from '@/utils/currency'
import { getCommissionStatusConfig } from '@/utils/commissionConstants'
import StatusBadge from '@/components/common/StatusBadge'

const emptyForm = { sellerId: '', amount: '', description: '' }

const AssignCommissionModal = ({ isOpen, onClose, contract, commissions, availableSellers, onAdd, onUpdate, onRemove, loading }) => {
  const [adding, setAdding] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm)
  const [editingSellerId, setEditingSellerId] = useState(null)
  const [editForm, setEditForm] = useState({ amount: '', description: '' })
  useLockBodyScroll(isOpen)

  useEffect(() => {
    if (isOpen) {
      setAdding(false)
      setAddForm(emptyForm)
      setEditingSellerId(null)
    }
  }, [isOpen])

  if (!isOpen || !contract) return null

  const list = commissions || []
  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"

  const startEdit = (c) => {
    setEditingSellerId(c.sellerId)
    setEditForm({ amount: c.amount, description: c.description || '' })
  }

  const submitAdd = async () => {
    const amount = Number(addForm.amount)
    if (!addForm.sellerId || !amount || amount <= 0 || !addForm.description.trim()) return
    await onAdd({ sellerId: addForm.sellerId, amount, description: addForm.description.trim() })
    setAdding(false)
    setAddForm(emptyForm)
  }

  const submitEdit = async (sellerId) => {
    const amount = Number(editForm.amount)
    if (!amount || amount <= 0 || !editForm.description.trim()) return
    await onUpdate(sellerId, { amount, description: editForm.description.trim() })
    setEditingSellerId(null)
  }

  const isAddValid = addForm.sellerId && Number(addForm.amount) > 0 && addForm.description.trim()
  const isEditValid = Number(editForm.amount) > 0 && editForm.description.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-overlayIn" style={{ background: 'rgba(15, 23, 42, 0.55)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-scaleIn overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{
          background: 'linear-gradient(135deg, var(--color-accent), #B89248)',
          color: 'white'
        }}>
          <div className="flex items-center gap-2">
            <Coins size={18} />
            <div>
              <h3 className="text-sm font-semibold">Comisiones del contrato</h3>
              <p className="text-[11px] text-white/80">{contract.contractNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 rounded-md p-1 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          {list.length === 0 && !adding && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>Ningún vendedor tiene comisión asignada en este contrato</p>
          )}

          {list.map((c) => {
            const status = getCommissionStatusConfig(c.status)
            const isEditing = editingSellerId === c.sellerId
            return (
              <div key={c.sellerId} className="p-3 rounded-lg border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{c.sellerName || 'Vendedor'}</p>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge label={status.label} color={status.color} bg={status.bg} size="xs" />
                    {!isEditing && (
                      <>
                        <button onClick={() => startEdit(c)} className="p-1 rounded-md hover:bg-black/5 transition-colors" title="Editar monto">
                          <Pencil size={13} style={{ color: 'var(--color-text-secondary)' }} />
                        </button>
                        <button
                          onClick={() => onRemove(c.sellerId)}
                          disabled={c.paidAmount > 0}
                          title={c.paidAmount > 0 ? 'No se puede quitar: ya tiene pagos registrados' : 'Quitar vendedor'}
                          className="p-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={13} style={{ color: 'var(--color-danger)' }} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="number" min="0" step="0.01"
                      value={editForm.amount}
                      onChange={(e) => setEditForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="Monto (USD)"
                      className={inputClass}
                    />
                    <textarea
                      rows={2}
                      value={editForm.description}
                      onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Descripción de la comisión"
                      className={`${inputClass} resize-none`}
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingSellerId(null)} className="px-2.5 py-1.5 text-xs rounded-lg border" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                        <XCircle size={13} className="inline mr-1" />Cancelar
                      </button>
                      <button
                        onClick={() => submitEdit(c.sellerId)}
                        disabled={loading || !isEditValid}
                        className="px-2.5 py-1.5 text-xs rounded-lg text-white disabled:opacity-50"
                        style={{ background: 'var(--color-accent)' }}
                      >
                        <Check size={13} className="inline mr-1" />Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>{formatUSD(c.amount)}</p>
                    <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>{c.description}</p>
                    <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      <span>Pagado: <strong style={{ color: 'var(--color-success)' }}>{formatUSD(c.paidAmount)}</strong></span>
                      <span>Saldo: <strong style={{ color: c.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatUSD(c.balance)}</strong></span>
                    </div>
                  </>
                )}
              </div>
            )
          })}

          {/* Agregar vendedor */}
          {adding ? (
            <div className="p-3 rounded-lg border border-dashed space-y-2" style={{ borderColor: 'var(--color-accent)' }}>
              <select
                value={addForm.sellerId}
                onChange={(e) => setAddForm(f => ({ ...f, sellerId: e.target.value }))}
                className={inputClass}
              >
                <option value="">Selecciona un vendedor</option>
                {(availableSellers || []).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input
                type="number" min="0" step="0.01"
                value={addForm.amount}
                onChange={(e) => setAddForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="Monto de comisión (USD)"
                className={inputClass}
              />
              <textarea
                rows={2}
                value={addForm.description}
                onChange={(e) => setAddForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descripción (motivo, condiciones, etc.)"
                className={`${inputClass} resize-none`}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setAdding(false); setAddForm(emptyForm) }} className="px-2.5 py-1.5 text-xs rounded-lg border" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  Cancelar
                </button>
                <button
                  onClick={submitAdd}
                  disabled={loading || !isAddValid}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-white disabled:opacity-50"
                  style={{ background: 'var(--color-accent)' }}
                >
                  Agregar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              disabled={!(availableSellers || []).length}
              className="w-full py-2.5 text-xs font-semibold rounded-lg border border-dashed flex items-center justify-center gap-1.5 transition-colors hover:bg-[var(--color-accent-muted)] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
            >
              <Plus size={14} /> Agregar vendedor
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex items-center justify-end gap-2 flex-shrink-0" style={{ borderTop: '1px solid var(--color-border-light)', background: 'var(--color-surface)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg border transition-colors"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssignCommissionModal
