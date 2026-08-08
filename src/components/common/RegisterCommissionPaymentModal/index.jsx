import { useState, useEffect } from 'react'
import useLockBodyScroll from '@/hooks/useLockBodyScroll'
import { X, DollarSign, CreditCard, Calendar, Upload, Trash2, Paperclip } from 'lucide-react'
import { PAYMENT_METHODS } from '@/utils/paymentConstants'
import { formatUSD } from '@/utils/currency'

const todayISO = () => new Date().toISOString().slice(0, 10)
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const RegisterCommissionPaymentModal = ({ isOpen, onClose, onSubmit, commission, loading }) => {
  const [form, setForm] = useState({ amount: '', paymentMethod: 'transferencia', reference: '', notes: '', paymentDate: todayISO() })
  const [errors, setErrors] = useState({})
  const [selectedFiles, setSelectedFiles] = useState([])
  useLockBodyScroll(isOpen)

  useEffect(() => {
    if (commission) {
      setForm({ amount: commission.balance || '', paymentMethod: 'transferencia', reference: '', notes: '', paymentDate: todayISO() })
    }
    setErrors({})
    setSelectedFiles([])
  }, [commission, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(prev => [...prev, ...files])
    e.target.value = ''
  }

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const errs = {}
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Ingresa un monto válido'
    if (Number(form.amount) > (commission?.balance || 0)) errs.amount = 'El monto excede el saldo pendiente'
    if (!form.paymentMethod) errs.paymentMethod = 'Selecciona un método'
    if (!form.paymentDate) errs.paymentDate = 'Fecha del pago requerida'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ ...form, files: selectedFiles })
  }

  if (!isOpen || !commission) return null

  const inputClass = (name) => `w-full px-3 py-2.5 text-sm rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] ${errors[name] ? 'border-red-300 bg-red-50/50' : 'border-[var(--color-border)] bg-white hover:border-gray-300'}`
  const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[var(--color-text-secondary)]"

  return (
    <div className="fixed inset-0 z-50 flex h-[90vh] items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
          <div>
            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>Registrar Pago de Comisión</h2>
            <p className="text-xs text-emerald-200 mt-0.5">{commission.contractNumber}{commission.sellerName ? ` · ${commission.sellerName}` : ''}</p>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pt-5">
            <div className="grid grid-cols-3 gap-3 p-3 rounded-lg" style={{ background: 'var(--color-surface)' }}>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Comisión</p>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{formatUSD(commission.amount)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Pagado</p>
                <p className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>{formatUSD(commission.paidAmount)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Saldo</p>
                <p className="text-sm font-bold" style={{ color: commission.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatUSD(commission.balance)}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className={labelClass}>Monto a depositar (USD) <span className="text-red-400">*</span></label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="number" step="0.01" name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" className={`pl-10 ${inputClass('amount')}`} />
              </div>
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className={labelClass}>Fecha del pago <span className="text-red-400">*</span></label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} className={`pl-10 ${inputClass('paymentDate')}`} />
              </div>
              {errors.paymentDate && <p className="text-xs text-red-500 mt-1">{errors.paymentDate}</p>}
            </div>

            <div>
              <label className={labelClass}>Método de pago <span className="text-red-400">*</span></label>
              <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className={inputClass('paymentMethod')}>
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Referencia / Folio</label>
              <div className="relative">
                <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" name="reference" value={form.reference} onChange={handleChange} placeholder="No. de transferencia, cheque, etc." className={`pl-10 ${inputClass('reference')}`} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Notas</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Observaciones del pago..." className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all resize-none" />
            </div>

            {/* Voucher upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`${labelClass} mb-0`}>Comprobante de pago</label>
                <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all hover:shadow-sm text-white" style={{ background: 'var(--color-primary)' }}>
                  <Upload size={13} />
                  Adjuntar
                  <input type="file" multiple onChange={handleFilesSelected} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" />
                </label>
              </div>

              {selectedFiles.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-dashed" style={{ borderColor: 'var(--color-accent)', background: 'var(--color-accent-muted)' }}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-accent)' + '22' }}>
                          <Paperclip size={12} style={{ color: 'var(--color-accent)' }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{file.name}</p>
                          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeSelectedFile(i)} className="p-1.5 rounded-md hover:bg-red-50 transition-colors flex-shrink-0">
                        <Trash2 size={13} style={{ color: 'var(--color-danger)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 rounded-lg border border-dashed" style={{ borderColor: 'var(--color-border)' }}>
                  <Paperclip size={18} className="mx-auto mb-1" style={{ color: 'var(--color-border)' }} />
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>PDF o imágenes del comprobante de pago</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border-light)]">
              <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium rounded-lg text-white transition-all hover:shadow-md disabled:opacity-50" style={{ background: '#059669' }}>
                {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registrando...</span> : 'Registrar pago'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterCommissionPaymentModal
