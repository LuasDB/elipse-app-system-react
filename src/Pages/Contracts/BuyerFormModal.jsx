import { useState, useEffect } from 'react'
import useLockBodyScroll from '@/hooks/useLockBodyScroll'
import { X, User, Mail, Phone, FileText, MapPin } from 'lucide-react'

const initialForm = {
  name: '', email: '', phone: '', rfc: '',
  curp: '', address: '', city: '', state: '', notes: ''
}

const BuyerFormModal = ({ isOpen, onClose, onSubmit, buyer, loading }) => {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const isEditing = !!buyer
  useLockBodyScroll(isOpen)

  useEffect(() => {
    if (buyer) {
      setForm({
        name: buyer.name || '', email: buyer.email || '', phone: buyer.phone || '',
        rfc: buyer.rfc || '', curp: buyer.curp || '', address: buyer.address || '',
        city: buyer.city || '', state: buyer.state || '', notes: buyer.notes || ''
      })
    } else {
      setForm(initialForm)
    }
    setErrors({})
  }, [buyer, isOpen])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'El nombre es requerido'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Correo no válido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form)
  }

  if (!isOpen) return null

  const inputClass = (name) => `w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] ${errors[name] ? 'border-red-300 bg-red-50/50' : 'border-[var(--color-border)] bg-white hover:border-gray-300'}`
  const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[var(--color-text-secondary)]"

  return (
    <div
      className="fixed inset-0 z-50 flex h-[90vh] items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4"
    ><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scaleIn overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
          <div>
            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {isEditing ? 'Editar Comprador' : 'Nuevo Comprador'}
            </h2>
            <p className="text-xs text-emerald-200 mt-0.5">Datos del comprador</p>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className={labelClass}>Nombre completo <span className="text-red-400">*</span></label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nombre del comprador" className={inputClass('name')} />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="correo@email.com" className={inputClass('email')} />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="55 1234 5678" className={inputClass('phone')} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>RFC</label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" name="rfc" value={form.rfc} onChange={handleChange} placeholder="XXXX000000XXX" className={inputClass('rfc')} />
              </div>
            </div>
            <div>
              <label className={labelClass}>CURP</label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" name="curp" value={form.curp} onChange={handleChange} placeholder="XXXX000000XXXXXXX0" className={inputClass('curp')} />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Dirección</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Calle y número" className={inputClass('address')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ciudad</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="Ciudad" className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all" />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="Estado" className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notas</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Observaciones..." className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-light)]">
            <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium rounded-lg text-white transition-all hover:shadow-md disabled:opacity-50" style={{ background: '#059669' }}>
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</span> : isEditing ? 'Guardar cambios' : 'Registrar comprador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BuyerFormModal
