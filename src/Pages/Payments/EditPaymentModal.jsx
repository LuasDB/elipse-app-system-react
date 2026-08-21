import { useState, useEffect } from 'react'
import useLockBodyScroll from '@/hooks/useLockBodyScroll'
import { X, DollarSign, Pencil, Upload, Trash2, Paperclip, File, ExternalLink } from 'lucide-react'
import { PAYMENT_METHODS, PAYMENT_STATUS } from '@/utils/paymentConstants'
import { API_BASE_URL } from '@/api/axiosConfig'
import ConfirmDialog from '@/components/common/ConfirmDialog'

const toDateInput = (d) => d ? new Date(d).toISOString().slice(0, 10) : ''
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const EditPaymentModal = ({ isOpen, onClose, onSubmit, payment, loading, onDeleteVoucher, deletingVoucher = null }) => {
  const [form, setForm] = useState({
    concept: '', expectedAmount: '', paidAmount: '', dueDate: '',
    status: 'pendiente', paymentMethod: '', reference: '', notes: ''
  })
  const [errors, setErrors] = useState({})
  const [selectedFiles, setSelectedFiles] = useState([])
  const [pendingDeleteVoucher, setPendingDeleteVoucher] = useState(null)
  const [pendingSubmit, setPendingSubmit] = useState(null)
  useLockBodyScroll(isOpen)

  useEffect(() => {
    if (payment) {
      setForm({
        concept: payment.concept || '',
        expectedAmount: payment.expectedAmount ?? '',
        paidAmount: payment.paidAmount ?? '',
        dueDate: toDateInput(payment.dueDate),
        status: payment.status || 'pendiente',
        paymentMethod: payment.paymentMethod || '',
        reference: payment.reference || '',
        notes: payment.notes || ''
      })
    }
    setErrors({})
    setSelectedFiles([])
    setPendingDeleteVoucher(null)
    setPendingSubmit(null)
  }, [payment, isOpen])

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
    if (!form.concept.trim()) errs.concept = 'El concepto es requerido'
    if (form.expectedAmount === '' || Number(form.expectedAmount) < 0) errs.expectedAmount = 'Monto esperado inválido'
    if (form.paidAmount === '' || Number(form.paidAmount) < 0) errs.paidAmount = 'Monto pagado inválido'
    if (!form.dueDate) errs.dueDate = 'Fecha de vencimiento requerida'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const expectedAmount = Number(form.expectedAmount)
    const paidAmount = Number(form.paidAmount)
    const balance = Math.max(expectedAmount - paidAmount, 0)
    setPendingSubmit({
      concept: form.concept.trim(),
      expectedAmount,
      paidAmount,
      balance,
      dueDate: form.dueDate,
      status: form.status,
      paymentMethod: form.paymentMethod || null,
      reference: form.reference || null,
      notes: form.notes || null,
      files: selectedFiles
    })
  }

  if (!isOpen || !payment) return null

  const inputClass = (name) => `w-full px-3 py-2.5 text-sm rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] ${errors[name] ? 'border-red-300 bg-red-50/50' : 'border-[var(--color-border)] bg-white hover:border-gray-300'}`
  const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[var(--color-text-secondary)]"

  const existingVouchers = payment.vouchers || []
  const serverBase = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : ''

  return (
    <div className="fixed inset-0 z-50 flex h-[90vh] items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scaleIn overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, #C8A45A, #A8843F)' }}>
          <div className="flex items-center gap-2">
            <Pencil size={16} className="text-white" />
            <div>
              <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>Editar Pago</h2>
              <p className="text-xs text-amber-100 mt-0.5">Solo administradores — quedará registrado en el historial</p>
            </div>
          </div>
          <button onClick={onClose} className="text-amber-100 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className={labelClass}>Concepto <span className="text-red-400">*</span></label>
              <input type="text" name="concept" value={form.concept} onChange={handleChange} className={inputClass('concept')} />
              {errors.concept && <p className="text-xs text-red-500 mt-1">{errors.concept}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Monto esperado (USD) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" step="0.01" name="expectedAmount" value={form.expectedAmount} onChange={handleChange} className={`pl-10 ${inputClass('expectedAmount')}`} />
                </div>
                {errors.expectedAmount && <p className="text-xs text-red-500 mt-1">{errors.expectedAmount}</p>}
              </div>
              <div>
                <label className={labelClass}>Monto pagado (USD) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" step="0.01" name="paidAmount" value={form.paidAmount} onChange={handleChange} className={`pl-10 ${inputClass('paidAmount')}`} />
                </div>
                {errors.paidAmount && <p className="text-xs text-red-500 mt-1">{errors.paidAmount}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Vencimiento <span className="text-red-400">*</span></label>
                <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputClass('dueDate')} />
                {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputClass('status')}>
                  {PAYMENT_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Método de pago</label>
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className={inputClass('paymentMethod')}>
                  <option value="">— Sin especificar —</option>
                  {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Referencia / Folio</label>
                <input type="text" name="reference" value={form.reference} onChange={handleChange} className={inputClass('reference')} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Notas</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all resize-none" />
            </div>

            {/* Comprobantes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`${labelClass} mb-0`}>Comprobantes de pago</label>
                <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all hover:shadow-sm text-white" style={{ background: 'var(--color-primary)' }}>
                  <Upload size={13} />
                  Adjuntar
                  <input type="file" multiple onChange={handleFilesSelected} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" />
                </label>
              </div>

              {existingVouchers.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Ya adjuntados</p>
                  <div className="space-y-1.5">
                    {existingVouchers.map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-light)]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-success-bg)' }}>
                            <File size={12} style={{ color: 'var(--color-success)' }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{v.originalName}</p>
                            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{formatFileSize(v.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a
                            href={`${serverBase}/uploads/payments/${payment._id}/${v.fileName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md hover:bg-white transition-colors"
                            title="Abrir en nueva ventana"
                          >
                            <ExternalLink size={13} style={{ color: 'var(--color-info)' }} />
                          </a>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteVoucher(v.fileName)}
                            disabled={deletingVoucher === v.fileName}
                            className="p-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Eliminar comprobante"
                          >
                            {deletingVoucher === v.fileName
                              ? <span className="block w-3.5 h-3.5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                              : <Trash2 size={13} style={{ color: 'var(--color-danger)' }} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--color-accent)' }}>Nuevos archivos</p>
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
                </div>
              )}

              {existingVouchers.length === 0 && selectedFiles.length === 0 && (
                <div className="text-center py-4 rounded-lg border border-dashed" style={{ borderColor: 'var(--color-border)' }}>
                  <Paperclip size={18} className="mx-auto mb-1" style={{ color: 'var(--color-border)' }} />
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>PDF o imágenes del comprobante de pago</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border-light)]">
              <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium rounded-lg text-white transition-all hover:shadow-md disabled:opacity-50" style={{ background: '#C8A45A' }}>
                {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</span> : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!pendingDeleteVoucher}
        onClose={() => setPendingDeleteVoucher(null)}
        onConfirm={() => { onDeleteVoucher?.(pendingDeleteVoucher); setPendingDeleteVoucher(null) }}
        title="Eliminar comprobante"
        message="¿Eliminar este comprobante de pago? El archivo se borrará del servidor y no se podrá recuperar."
        confirmText="Eliminar"
      />

      <ConfirmDialog
        isOpen={!!pendingSubmit}
        onClose={() => setPendingSubmit(null)}
        onConfirm={() => { onSubmit(pendingSubmit); setPendingSubmit(null) }}
        title="Confirmar cambios del pago"
        message="¿Confirmas guardar estos cambios? Se modificarán los montos/estado del pago y quedará registrado en el historial de auditoría."
        confirmText="Guardar cambios"
        loadingText="Guardando..."
        loading={loading}
        variant="warning"
      />
    </div>
  )
}

export default EditPaymentModal
