import { useState, useEffect } from 'react'
import useLockBodyScroll from '@/hooks/useLockBodyScroll'
import { X, FileText, DollarSign, Calendar, UserPlus, Search, TrendingUp, Hammer, Plus, Trash2, AlertCircle } from 'lucide-react'
import { CONTRACT_STATUS, PAYMENT_SCHEMES, CONTRACT_MODALITIES } from '@/utils/contractConstants'
import { convertToMXN, formatMXN, formatUSD } from '@/utils/currency'
import projectsService from '@/services/projectsService'
import unitsService from '@/services/unitsService'
import buyersService from '@/services/buyersService'
import usersService from '@/services/usersService'
import BuyerFormModal from './BuyerFormModal'

const todayISO = () => new Date().toISOString().slice(0, 10)

const initialForm = {
  projectId: '', unitId: '', buyerId: '', sellerId: '',
  contractNumber: '', status: 'promesa', paymentScheme: 'enganche_mensualidades',
  modality: 'monthly',
  salePrice: '', downPayment: '', monthlyPayment: '', totalPayments: '',
  milestonesTemplate: [],
  exchangeRate: '', exchangeRateDate: todayISO(),
  promiseDate: '', signDate: '', notaryDate: '', deliveryDate: '',
  notary: '', notes: ''
}

const emptyMilestone = () => ({ name: '', amount: '' })

const ContractFormModal = ({ isOpen, onClose, onSubmit, contract, loading }) => {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const isEditing = !!contract

  // Lookups
  const [projects, setProjects] = useState([])
  const [units, setUnits] = useState([])
  const [buyers, setBuyers] = useState([])
  const [sellers, setSellers] = useState([])
  const [buyerSearch, setBuyerSearch] = useState('')
  const [buyerModalOpen, setBuyerModalOpen] = useState(false)
  const [buyerLoading, setBuyerLoading] = useState(false)

  // Load lookups
  useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      try {
        const [projRes, buyersRes, sellersRes] = await Promise.all([
          projectsService.getAll(),
          buyersService.getAll(),
          usersService.getAll({ role: 'vendedor' })
        ])
        setProjects(projRes.data || [])
        setBuyers(buyersRes.data || [])
        const allUsers = sellersRes.data || []
        setSellers(allUsers)
      } catch (err) { console.error(err) }
    }
    load()
  }, [isOpen])

  // Load units when project changes
  useEffect(() => {
    if (!form.projectId) { setUnits([]); return }
    const loadUnits = async () => {
      try {
        const res = await unitsService.getByProject(form.projectId)
        const available = (res.data || []).filter(u =>
          u.status === 'disponible' || u.status === 'apartada' ||
          (isEditing && u._id === contract?.unitId)
        )
        setUnits(available)
      } catch (err) { console.error(err) }
    }
    loadUnits()
  }, [form.projectId, isEditing, contract?.unitId])

  // Populate form when editing
  useEffect(() => {
    if (contract) {
      setForm({
        projectId: contract.projectId || '', unitId: contract.unitId || '',
        buyerId: contract.buyerId || '', sellerId: contract.sellerId || '',
        contractNumber: contract.contractNumber || '', status: contract.status || 'promesa',
        paymentScheme: contract.paymentScheme || 'enganche_mensualidades',
        modality: contract.modality || 'monthly',
        salePrice: contract.salePrice || '', downPayment: contract.downPayment || '',
        monthlyPayment: contract.monthlyPayment || '', totalPayments: contract.totalPayments || '',
        milestonesTemplate: (contract.milestonesTemplate || []).map(m => ({
          name: m.name || '',
          amount: m.amount || ''
        })),
        exchangeRate: contract.exchangeRate || '',
        exchangeRateDate: contract.exchangeRateDate?.slice(0, 10) || todayISO(),
        promiseDate: contract.promiseDate?.slice(0, 10) || '',
        signDate: contract.signDate?.slice(0, 10) || '',
        notaryDate: contract.notaryDate?.slice(0, 10) || '',
        deliveryDate: contract.deliveryDate?.slice(0, 10) || '',
        notary: contract.notary || '', notes: contract.notes || ''
      })
    } else {
      setForm(initialForm)
    }
    setErrors({})
    setBuyerSearch('')
  }, [contract, isOpen])

  const validate = () => {
    const errs = {}
    if (!form.projectId) errs.projectId = 'Selecciona un proyecto'
    if (!form.unitId) errs.unitId = 'Selecciona una unidad'
    if (!form.buyerId) errs.buyerId = 'Selecciona un comprador'
    if (!form.salePrice) errs.salePrice = 'El precio de venta es requerido'
    if (!form.exchangeRate || Number(form.exchangeRate) <= 0) errs.exchangeRate = 'El tipo de cambio es requerido'
    if (!form.exchangeRateDate) errs.exchangeRateDate = 'La fecha del TC es requerida'

    if (form.modality === 'milestones') {
      if (!form.milestonesTemplate || form.milestonesTemplate.length === 0) {
        errs.milestones = 'Debes agregar al menos un hito de obra'
      } else {
        form.milestonesTemplate.forEach((m, idx) => {
          if (!m.name?.trim()) errs[`milestone_${idx}_name`] = 'Nombre requerido'
          if (!m.amount || Number(m.amount) <= 0) errs[`milestone_${idx}_amount`] = 'Monto inválido'
        })
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'projectId') setForm(prev => ({ ...prev, unitId: '' }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  // === Handlers de hitos (Línea 2) ===
  const handleModalityChange = (modality) => {
    setForm(prev => {
      const next = { ...prev, modality }
      if (modality === 'milestones' && (!prev.milestonesTemplate || prev.milestonesTemplate.length === 0)) {
        next.milestonesTemplate = [emptyMilestone()]
      }
      return next
    })
  }

  const addMilestone = () => {
    setForm(prev => ({
      ...prev,
      milestonesTemplate: [...(prev.milestonesTemplate || []), emptyMilestone()]
    }))
  }

  const removeMilestone = (index) => {
    setForm(prev => ({
      ...prev,
      milestonesTemplate: prev.milestonesTemplate.filter((_, i) => i !== index)
    }))
  }

  const updateMilestone = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      milestonesTemplate: prev.milestonesTemplate.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }))
  }

  // === Cálculos derivados ===
  const milestonesTotal = (form.milestonesTemplate || [])
    .reduce((acc, m) => acc + (Number(m.amount) || 0), 0)
  const downPaymentNum = Number(form.downPayment) || 0
  const salePriceNum = Number(form.salePrice) || 0
  const milestonesPlusDown = milestonesTotal + downPaymentNum
  const milestonesDelta = salePriceNum - milestonesPlusDown
  const milestonesMatch = salePriceNum > 0 && Math.abs(milestonesDelta) < 0.01

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (!validate()) return

    const payload = { ...form }

    if (payload.modality === 'monthly') {
      payload.milestonesTemplate = []
    } else {
      payload.monthlyPayment = 0
      payload.totalPayments = 0
      payload.milestonesTemplate = payload.milestonesTemplate.map((m, i) => ({
        name: m.name.trim(),
        amount: Number(m.amount),
        order: i + 1
      }))
    }

    await onSubmit(payload)
  }

  // Buyer creation inline
  const handleCreateBuyer = async (buyerData) => {
    setBuyerLoading(true)
    try {
      const res = await buyersService.create(buyerData)
      const newBuyer = res.data
      setBuyers(prev => [...prev, newBuyer])
      setForm(prev => ({ ...prev, buyerId: newBuyer._id }))
      setBuyerModalOpen(false)
    } catch (err) {
      console.error(err)
    } finally { setBuyerLoading(false) }
  }

  const filteredBuyers = buyers.filter(b => {
    if (!buyerSearch) return true
    const q = buyerSearch.toLowerCase()
    return b.name?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q) || b.phone?.includes(q)
  })
  useLockBodyScroll(isOpen)
  if (!isOpen) return null
  
  const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[var(--color-text-secondary)]"
  const selectClass = (name) => `w-full px-3 py-2.5 text-sm rounded-lg border transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] ${errors[name] ? 'border-red-300 bg-red-50/50' : 'border-[var(--color-border)] bg-white hover:border-gray-300'}`
  const inputClass = (name) => `w-full px-3 py-2.5 text-sm rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] ${errors[name] ? 'border-red-300 bg-red-50/50' : 'border-[var(--color-border)] bg-white hover:border-gray-300'}`
  const sectionLabel = (text) => <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>{text}</p>

  const selectedBuyer = buyers.find(b => b._id === form.buyerId)

  return (
    <>
      <div
      className="fixed inset-0 z-50 flex h-[90vh] items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4"
    >
        <div className="bg-white w-full sm:max-w-3xl h-[95vh] sm:h-[95vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn">
    {/* Header */}
           <div
          className="px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))'
          }}
        >
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white">
              {isEditing ? 'Editar Contrato' : 'Nuevo Contrato'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              {isEditing
                ? 'Modifica los datos del contrato'
                : 'Genera un nuevo contrato de venta'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

          {/* Form */}
          <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5"
        >

            {/* Proyecto y Unidad */}
            {sectionLabel('Proyecto y Unidad')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Proyecto <span className="text-red-400">*</span></label>
                <select name="projectId" value={form.projectId} onChange={handleChange} className={selectClass('projectId')} disabled={isEditing}>
                  <option value="">Selecciona...</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
                {errors.projectId && <p className="text-xs text-red-500 mt-1">{errors.projectId}</p>}
              </div>
              <div>
                <label className={labelClass}>Unidad <span className="text-red-400">*</span></label>
                <select name="unitId" value={form.unitId} onChange={handleChange} className={selectClass('unitId')} disabled={!form.projectId || isEditing}>
                  <option value="">{form.projectId ? 'Selecciona...' : 'Primero un proyecto'}</option>
                  {units.map(u => <option key={u._id} value={u._id}>{u.identifier} — {u.unitType} {u.status !== 'disponible' ? `(${u.status})` : ''}</option>)}
                </select>
                {errors.unitId && <p className="text-xs text-red-500 mt-1">{errors.unitId}</p>}
              </div>
            </div>

            {/* Comprador */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`${labelClass} mb-0`}>Comprador <span className="text-red-400">*</span></label>
                <button type="button" onClick={() => setBuyerModalOpen(true)} className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-[var(--color-success)]" style={{ color: 'var(--color-text-muted)' }}>
                  <UserPlus size={13} /> Nuevo comprador
                </button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-[11px] text-gray-400" />
                <input
                  type="text"
                  value={selectedBuyer ? selectedBuyer.name : buyerSearch}
                  onChange={(e) => { setBuyerSearch(e.target.value); if (form.buyerId) setForm(prev => ({ ...prev, buyerId: '' })) }}
                  placeholder="Buscar comprador por nombre, correo o teléfono..."
                  className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 ${errors.buyerId ? 'border-red-300' : 'border-[var(--color-border)]'}`}
                />
                {buyerSearch && !form.buyerId && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto" style={{ borderColor: 'var(--color-border)' }}>
                    {filteredBuyers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
                        No encontrado — <button type="button" onClick={() => setBuyerModalOpen(true)} className="underline" style={{ color: 'var(--color-success)' }}>crear nuevo</button>
                      </div>
                    ) : filteredBuyers.slice(0, 8).map(b => (
                      <button key={b._id} type="button" onClick={() => { setForm(prev => ({ ...prev, buyerId: b._id })); setBuyerSearch('') }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-surface)] transition-colors flex items-center justify-between">
                        <span className="font-medium" style={{ color: 'var(--color-text)' }}>{b.name}</span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{b.email || b.phone || ''}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.buyerId && <p className="text-xs text-red-500 mt-1">{errors.buyerId}</p>}
            </div>

            {/* Vendedor asignado */}
            <div>
              <label className={labelClass}>Vendedor asignado</label>
              <select name="sellerId" value={form.sellerId} onChange={handleChange} className={selectClass('sellerId')}>
                <option value="">Sin asignar</option>
                {sellers.map(s => <option key={s._id} value={s._id}>{s.name} ({s.role})</option>)}
              </select>
            </div>

            {/* Datos del contrato */}
            {sectionLabel('Datos del Contrato')}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>No. de contrato</label>
                <input type="text" name="contractNumber" value={form.contractNumber} onChange={handleChange} placeholder="Auto-generado" className={inputClass('contractNumber')} />
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <select name="status" value={form.status} onChange={handleChange} className={selectClass('status')}>
                  {CONTRACT_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Esquema de pago</label>
                <select name="paymentScheme" value={form.paymentScheme} onChange={handleChange} className={selectClass('paymentScheme')}>
                  {PAYMENT_SCHEMES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>

            {/* Tipo de cambio */}
            {sectionLabel('Tipo de Cambio')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} style={{ color: 'var(--color-accent)' }} />
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                  Los montos se capturan en USD y se convierten a MXN con este TC
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tipo de cambio (MXN/USD) <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" step="0.0001" name="exchangeRate" value={form.exchangeRate} onChange={handleChange} placeholder="17.5000" className={`pl-8 ${inputClass('exchangeRate')}`} />
                  </div>
                  {errors.exchangeRate && <p className="text-xs text-red-500 mt-1">{errors.exchangeRate}</p>}
                </div>
                <div>
                  <label className={labelClass}>Fecha del TC <span className="text-red-400">*</span></label>
                  <input type="date" name="exchangeRateDate" value={form.exchangeRateDate} onChange={handleChange} className={inputClass('exchangeRateDate')} />
                  {errors.exchangeRateDate && <p className="text-xs text-red-500 mt-1">{errors.exchangeRateDate}</p>}
                </div>
              </div>
            </div>

            {/* Modalidad de seguimiento */}
            {sectionLabel('Modalidad de Seguimiento')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONTRACT_MODALITIES.map(m => {
                const isActive = form.modality === m.value
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => handleModalityChange(m.value)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${isActive ? 'shadow-md' : 'hover:border-gray-300'}`}
                    style={{
                      borderColor: isActive ? m.color : 'var(--color-border-light)',
                      background: isActive ? m.bg : 'white'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: m.bg }}>
                        {m.value === 'milestones'
                          ? <Hammer size={14} style={{ color: m.color }} />
                          : <Calendar size={14} style={{ color: m.color }} />}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{m.label}</span>
                      {isActive && <span className="ml-auto w-2 h-2 rounded-full" style={{ background: m.color }} />}
                    </div>
                    <p className="text-[11px] leading-snug" style={{ color: 'var(--color-text-muted)' }}>{m.description}</p>
                  </button>
                )
              })}
            </div>
            {contract && form.modality !== contract.modality && (
              <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'var(--color-warning-bg)' }}>
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-warning)' }} />
                <p className="text-[11px]" style={{ color: 'var(--color-text)' }}>
                  Cambiar la modalidad regenerará el calendario de pagos. Los pagos previos del contrato se eliminarán y se crearán nuevos según la nueva configuración.
                </p>
              </div>
            )}

            {/* Montos */}
            {sectionLabel('Condiciones Económicas (USD)')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Precio de venta (USD) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="number" step="0.01" name="salePrice" value={form.salePrice} onChange={handleChange} placeholder="150,000" className={`pl-8 ${inputClass('salePrice')}`} />
                </div>
                {form.exchangeRate && form.salePrice && (
                  <p className="text-[11px] mt-1" style={{ color: 'var(--color-success)' }}>
                    ≈ {formatMXN(convertToMXN(form.salePrice, form.exchangeRate))}
                  </p>
                )}
                {errors.salePrice && <p className="text-xs text-red-500 mt-1">{errors.salePrice}</p>}
              </div>
              <div>
                <label className={labelClass}>Enganche (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="number" step="0.01" name="downPayment" value={form.downPayment} onChange={handleChange} placeholder="30,000" className={`pl-8 ${inputClass('downPayment')}`} />
                </div>
                {form.exchangeRate && form.downPayment && (
                  <p className="text-[11px] mt-1" style={{ color: 'var(--color-success)' }}>
                    ≈ {formatMXN(convertToMXN(form.downPayment, form.exchangeRate))}
                  </p>
                )}
              </div>
            </div>

            {/* Mensualidades — solo Línea 1 */}
            {form.modality === 'monthly' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Mensualidad (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" step="0.01" name="monthlyPayment" value={form.monthlyPayment} onChange={handleChange} placeholder="1,500" className={`pl-8 ${inputClass('monthlyPayment')}`} />
                  </div>
                  {form.exchangeRate && form.monthlyPayment && (
                    <p className="text-[11px] mt-1" style={{ color: 'var(--color-success)' }}>
                      ≈ {formatMXN(convertToMXN(form.monthlyPayment, form.exchangeRate))}/mes
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Total de pagos</label>
                  <input type="number" name="totalPayments" value={form.totalPayments} onChange={handleChange} placeholder="Ej: 36" className={inputClass('totalPayments')} />
                </div>
              </div>
            )}

            {/* Hitos de obra — solo Línea 2 */}
            {form.modality === 'milestones' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hammer size={14} style={{ color: 'var(--color-accent)' }} />
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>Hitos de Obra</p>
                  </div>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                    style={{ background: 'var(--color-accent)', color: 'white' }}
                  >
                    <Plus size={12} /> Agregar hito
                  </button>
                </div>

                {errors.milestones && (
                  <p className="text-xs text-red-500">{errors.milestones}</p>
                )}

                <div className="space-y-2">
                  {(form.milestonesTemplate || []).map((m, idx) => (
                    <div key={idx} className="p-3 rounded-lg border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold" style={{ background: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>
                          {idx + 1}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Hito {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeMilestone(idx)}
                          className="ml-auto p-1 rounded hover:bg-red-50 transition-colors"
                          title="Eliminar hito"
                        >
                          <Trash2 size={12} className="text-red-500" />
                        </button>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-7">
                          <input
                            type="text"
                            value={m.name}
                            onChange={(e) => updateMilestone(idx, 'name', e.target.value)}
                            placeholder="Nombre (ej: Cimentación)"
                            className={`w-full px-2.5 py-1.5 text-sm rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 ${errors[`milestone_${idx}_name`] ? 'border-red-400' : 'border-[var(--color-border)]'}`}
                          />
                        </div>
                        <div className="col-span-5">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={m.amount}
                              onChange={(e) => updateMilestone(idx, 'amount', e.target.value)}
                              placeholder="USD"
                              className={`w-full pl-6 pr-2 py-1.5 text-sm rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 ${errors[`milestone_${idx}_amount`] ? 'border-red-400' : 'border-[var(--color-border)]'}`}
                            />
                          </div>
                          {form.exchangeRate && m.amount && (
                            <p className="text-[9px] mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                              ≈ {formatMXN(convertToMXN(m.amount, form.exchangeRate))}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumen de hitos */}
                {form.milestonesTemplate.length > 0 && (
                  <div className="p-3 rounded-lg border-2" style={{
                    borderColor: milestonesMatch ? 'var(--color-success)' : (salePriceNum > 0 ? 'var(--color-warning)' : 'var(--color-border-light)'),
                    background: milestonesMatch ? 'var(--color-success-bg)' : (salePriceNum > 0 ? 'var(--color-warning-bg)' : 'var(--color-surface)')
                  }}>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Enganche</p>
                        <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{formatUSD(downPaymentNum)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Σ Hitos</p>
                        <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{formatUSD(milestonesTotal)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Total</p>
                        <p className="text-xs font-bold" style={{ color: milestonesMatch ? 'var(--color-success)' : 'var(--color-warning)' }}>
                          {formatUSD(milestonesPlusDown)}
                        </p>
                      </div>
                    </div>
                    {salePriceNum > 0 && !milestonesMatch && (
                      <p className="text-[11px] text-center mt-2 font-medium" style={{ color: 'var(--color-warning)' }}>
                        {milestonesDelta > 0
                          ? `⚠ Faltan ${formatUSD(milestonesDelta)} para igualar el precio de venta`
                          : `⚠ Excede ${formatUSD(Math.abs(milestonesDelta))} sobre el precio de venta`}
                      </p>
                    )}
                    {milestonesMatch && (
                      <p className="text-[11px] text-center mt-2 font-medium" style={{ color: 'var(--color-success)' }}>
                        ✓ Los hitos suman exactamente el precio de venta
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Fechas */}
            {sectionLabel('Fechas Clave')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Firma de promesa</label>
                <input type="date" name="promiseDate" value={form.promiseDate} onChange={handleChange} className={inputClass('promiseDate')} />
              </div>
              <div>
                <label className={labelClass}>Firma de contrato definitivo</label>
                <input type="date" name="signDate" value={form.signDate} onChange={handleChange} className={inputClass('signDate')} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Fecha de escrituración</label>
                <input type="date" name="notaryDate" value={form.notaryDate} onChange={handleChange} className={inputClass('notaryDate')} />
              </div>
              <div>
                <label className={labelClass}>Fecha de entrega</label>
                <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} className={inputClass('deliveryDate')} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Notaría</label>
              <input type="text" name="notary" value={form.notary} onChange={handleChange} placeholder="Nombre de la notaría" className={inputClass('notary')} />
            </div>

            {/* Notas */}
            <div>
              <label className={labelClass}>Observaciones</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Condiciones especiales, notas..." className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all resize-none" />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-light)]">
              <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium rounded-lg text-white transition-all hover:shadow-md disabled:opacity-50" style={{ background: 'var(--color-primary)' }}>
                {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</span> : isEditing ? 'Guardar cambios' : 'Crear contrato'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Buyer modal (stacked on top) */}
      <BuyerFormModal
      isOpen={buyerModalOpen}
      onClose={() => setBuyerModalOpen(false)}
      onSubmit={handleCreateBuyer}
      buyer={null}
      loading={buyerLoading}
    />
    </>
  )
}

export default ContractFormModal
