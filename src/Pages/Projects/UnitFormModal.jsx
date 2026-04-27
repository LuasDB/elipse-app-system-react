import { useState, useEffect } from 'react'
import { X, Home, Ruler, Car, DollarSign, Hash } from 'lucide-react'
import { UNIT_TYPES, UNIT_STATUS, ORIENTATIONS } from '@/utils/projectConstants'

const initialForm = {
  identifier: '', unitType: 'departamento', floor: '', orientation: '',
  totalArea: '', builtArea: '', coveredArea: '', openArea: '',
  bedrooms: '', bathrooms: '', halfBathrooms: '',
  parkingSpaces: '', parkingNumbers: '',
  hasStorage: false, storageNumber: '', storageArea: '',
  hasTerrace: false, terraceArea: '', hasGarden: false, gardenArea: '',
  listPrice: '', finalPrice: '', status: 'disponible', notes: '',
}

const UnitFormModal = ({ isOpen, onClose, onSubmit, unit, loading }) => {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const isEditing = !!unit

  useEffect(() => {
    if (unit) {
      setForm({
        identifier: unit.identifier || '', unitType: unit.unitType || 'departamento',
        floor: unit.floor || '', orientation: unit.orientation || '',
        totalArea: unit.totalArea || '', builtArea: unit.builtArea || '',
        coveredArea: unit.coveredArea || '', openArea: unit.openArea || '',
        bedrooms: unit.bedrooms || '', bathrooms: unit.bathrooms || '', halfBathrooms: unit.halfBathrooms || '',
        parkingSpaces: unit.parkingSpaces || '', parkingNumbers: unit.parkingNumbers || '',
        hasStorage: unit.hasStorage || false, storageNumber: unit.storageNumber || '', storageArea: unit.storageArea || '',
        hasTerrace: unit.hasTerrace || false, terraceArea: unit.terraceArea || '',
        hasGarden: unit.hasGarden || false, gardenArea: unit.gardenArea || '',
        listPrice: unit.listPrice || '', finalPrice: unit.finalPrice || '',
        status: unit.status || 'disponible', notes: unit.notes || '',
      })
    } else {
      setForm(initialForm)
    }
    setErrors({})
  }, [unit, isOpen])

  const validate = () => {
    const errs = {}
    if (!form.identifier.trim()) errs.identifier = 'El identificador es requerido'
    if (!form.unitType) errs.unitType = 'Selecciona un tipo'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form)
  }

  if (!isOpen) return null

  const inputClass = (err) => `w-full px-3 py-2.5 text-sm rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] ${err ? 'border-red-300 bg-red-50/50' : 'border-[var(--color-border)] bg-white hover:border-gray-300'}`
  const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[var(--color-text-secondary)]"
  const sectionLabel = (text) => <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>{text}</p>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-overlayIn" style={{ background: 'rgba(15,36,56,0.45)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scaleIn overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}>
          <div>
            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {isEditing ? 'Editar Unidad' : 'Nueva Unidad'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">{isEditing ? 'Modifica los datos de la unidad' : 'Registra una nueva unidad en el proyecto'}</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"><X size={20} /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Identificación */}
          {sectionLabel('Identificación')}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Identificador <span className="text-red-400">*</span></label>
              <input type="text" name="identifier" value={form.identifier} onChange={handleChange} placeholder='Ej: A-401, Casa 12' className={inputClass(errors.identifier)} />
              {errors.identifier && <p className="text-xs text-red-500 mt-1">{errors.identifier}</p>}
            </div>
            <div>
              <label className={labelClass}>Tipo de unidad <span className="text-red-400">*</span></label>
              <select name="unitType" value={form.unitType} onChange={handleChange} className={inputClass(errors.unitType)}>
                {UNIT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Piso / Nivel</label>
              <input type="number" name="floor" value={form.floor} onChange={handleChange} placeholder="Ej: 4" className={inputClass()} />
            </div>
            <div>
              <label className={labelClass}>Orientación</label>
              <select name="orientation" value={form.orientation} onChange={handleChange} className={inputClass()}>
                <option value="">Sin definir</option>
                {ORIENTATIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputClass()}>
                {UNIT_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Características */}
          {sectionLabel('Características Físicas')}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Superficie total (m²)</label>
              <input type="number" step="0.01" name="totalArea" value={form.totalArea} onChange={handleChange} placeholder="120.5" className={inputClass()} />
            </div>
            <div>
              <label className={labelClass}>Superficie construida (m²)</label>
              <input type="number" step="0.01" name="builtArea" value={form.builtArea} onChange={handleChange} placeholder="95.0" className={inputClass()} />
            </div>
            <div>
              <label className={labelClass}>Recámaras</label>
              <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} placeholder="3" className={inputClass()} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Baños completos</label>
              <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} placeholder="2" className={inputClass()} />
            </div>
            <div>
              <label className={labelClass}>Medios baños</label>
              <input type="number" name="halfBathrooms" value={form.halfBathrooms} onChange={handleChange} placeholder="1" className={inputClass()} />
            </div>
            <div />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Superficie techada (m²)</label>
              <input type="number" step="0.01" name="coveredArea" value={form.coveredArea} onChange={handleChange} placeholder="80.0" className={inputClass()} />
            </div>
            <div>
              <label className={labelClass}>Superficie abierta (m²)</label>
              <input type="number" step="0.01" name="openArea" value={form.openArea} onChange={handleChange} placeholder="40.5" className={inputClass()} />
            </div>
          </div>

          {/* Espacios adicionales */}
          {sectionLabel('Espacios Adicionales')}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cajones de estacionamiento</label>
              <input type="number" name="parkingSpaces" value={form.parkingSpaces} onChange={handleChange} placeholder="2" className={inputClass()} />
            </div>
            <div>
              <label className={labelClass}>Números de cajón</label>
              <input type="text" name="parkingNumbers" value={form.parkingNumbers} onChange={handleChange} placeholder="E-15, E-16" className={inputClass()} />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            {/* Bodega */}
            <div className="p-3 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="hasStorage" checked={form.hasStorage} onChange={handleChange} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[var(--color-success)] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
                  </label>
                  <span className="text-sm font-medium text-[var(--color-text)]">Bodega</span>
                </div>
                {form.hasStorage && (
                  <div className="flex items-center gap-2">
                    <input type="text" name="storageNumber" value={form.storageNumber} onChange={handleChange} placeholder="No. bodega" className="w-32 px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30" />
                    <div className="relative">
                      <input type="number" step="0.01" name="storageArea" value={form.storageArea} onChange={handleChange} placeholder="m²" className="w-24 px-3 py-1.5 pr-8 text-sm rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30" />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>m²</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Terraza */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface)]">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="hasTerrace" checked={form.hasTerrace} onChange={handleChange} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[var(--color-success)] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
                </label>
                <span className="text-sm font-medium text-[var(--color-text)]">Terraza / Balcón</span>
              </div>
              {form.hasTerrace && (
                <input type="number" step="0.01" name="terraceArea" value={form.terraceArea} onChange={handleChange} placeholder="m²" className="w-24 px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30" />
              )}
            </div>
            {/* Jardín */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface)]">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="hasGarden" checked={form.hasGarden} onChange={handleChange} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[var(--color-success)] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
                </label>
                <span className="text-sm font-medium text-[var(--color-text)]">Jardín</span>
              </div>
              {form.hasGarden && (
                <input type="number" step="0.01" name="gardenArea" value={form.gardenArea} onChange={handleChange} placeholder="m²" className="w-24 px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30" />
              )}
            </div>
          </div>

          {/* Precios */}
          {sectionLabel('Datos Comerciales (USD)')}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Precio de lista (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" step="0.01" name="listPrice" value={form.listPrice} onChange={handleChange} placeholder="150,000" className={`pl-8 ${inputClass()}`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Precio de venta final (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" step="0.01" name="finalPrice" value={form.finalPrice} onChange={handleChange} placeholder="Se llena al cerrar" className={`pl-8 ${inputClass()}`} />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className={labelClass}>Observaciones</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Notas adicionales sobre la unidad..." className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all resize-none" />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-light)]">
            <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium rounded-lg text-white transition-all hover:shadow-md disabled:opacity-50" style={{ background: 'var(--color-primary)' }}>
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</span> : isEditing ? 'Guardar cambios' : 'Crear unidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UnitFormModal
