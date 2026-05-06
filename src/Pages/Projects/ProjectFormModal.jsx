import { useState, useEffect } from 'react'
import useLockBodyScroll from '@/hooks/useLockBodyScroll'
import { X, Building2, MapPin, Calendar, Hash, FileText } from 'lucide-react'
import { PROJECT_TYPES, PROJECT_STATUS } from '@/utils/projectConstants'

const initialForm = {
  name: '',
  description: '',
  type: 'residencial_vertical',
  status: 'en_preventa',
  totalUnits: '',
  averagePrice: '',
  street: '',
  colony: '',
  city: '',
  state: '',
  zipCode: '',
  startDate: '',
  estimatedDelivery: '',
}

const ProjectFormModal = ({ isOpen, onClose, onSubmit, project, loading }) => {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const isEditing = !!project
  useLockBodyScroll(isOpen)
  useEffect(() => {
    if (project) {
      setForm({
        name: project.name || '',
        description: project.description || '',
        type: project.type || 'residencial_vertical',
        status: project.status || 'en_preventa',
        totalUnits: project.totalUnits || '',
        averagePrice: project.averagePrice || '',
        street: project.street || '',
        colony: project.colony || '',
        city: project.city || '',
        state: project.state || '',
        zipCode: project.zipCode || '',
        startDate: project.startDate?.slice(0, 10) || '',
        estimatedDelivery: project.estimatedDelivery?.slice(0, 10) || '',
      })
    } else {
      setForm(initialForm)
    }
    setErrors({})
  }, [project, isOpen])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'El nombre es requerido'
    if (!form.type) errs.type = 'Selecciona un tipo'
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

  const inputClass = (name) => `
    w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]
    ${errors[name] ? 'border-red-300 bg-red-50/50' : 'border-[var(--color-border)] bg-white hover:border-gray-300'}
  `

  const selectClass = (name) => `
    w-full px-3 py-2.5 text-sm rounded-lg border transition-all duration-200 appearance-none cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]
    ${errors[name] ? 'border-red-300 bg-red-50/50' : 'border-[var(--color-border)] bg-white hover:border-gray-300'}
  `

  const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[var(--color-text-secondary)]"

  return (
    <div
      className="fixed inset-0 z-50 flex h-[90vh] items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4"
    ><div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scaleIn overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}>
          <div>
            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {isEditing ? 'Modifica los datos del desarrollo' : 'Registra un nuevo desarrollo inmobiliario'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Form scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Sección: Información General */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>Información General</p>
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className={labelClass}>Nombre del desarrollo <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder='Ej: Residencial Los Álamos' className={inputClass('name')} />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Descripción */}
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Descripción general del desarrollo..." className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all resize-none" />
              </div>

              {/* Tipo + Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tipo de desarrollo <span className="text-red-400">*</span></label>
                  <select name="type" value={form.type} onChange={handleChange} className={selectClass('type')}>
                    {PROJECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
                </div>
                <div>
                  <label className={labelClass}>Estado</label>
                  <select name="status" value={form.status} onChange={handleChange} className={selectClass('status')}>
                    {PROJECT_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Unidades + Precio promedio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Total de unidades</label>
                  <div className="relative">
                    <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" name="totalUnits" value={form.totalUnits} onChange={handleChange} placeholder="Ej: 48" className={inputClass('totalUnits')} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Precio promedio (MXN)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" name="averagePrice" value={form.averagePrice} onChange={handleChange} placeholder="Ej: 2500000" className="w-full pl-8 pr-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Ubicación */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>Ubicación</p>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Calle y número</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="street" value={form.street} onChange={handleChange} placeholder="Av. Reforma 500" className={inputClass('street')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Colonia</label>
                  <input type="text" name="colony" value={form.colony} onChange={handleChange} placeholder="Col. Centro" className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all" />
                </div>
                <div>
                  <label className={labelClass}>Ciudad / Municipio</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="Ciudad de México" className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Estado</label>
                  <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="CDMX" className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all" />
                </div>
                <div>
                  <label className={labelClass}>Código Postal</label>
                  <input type="text" name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="06600" className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Fechas */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>Fechas</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Fecha de inicio</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className={inputClass('startDate')} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Entrega estimada</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" name="estimatedDelivery" value={form.estimatedDelivery} onChange={handleChange} className={inputClass('estimatedDelivery')} />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-light)]">
            <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium rounded-lg text-white transition-all hover:shadow-md disabled:opacity-50" style={{ background: 'var(--color-primary)' }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : isEditing ? 'Guardar cambios' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectFormModal
