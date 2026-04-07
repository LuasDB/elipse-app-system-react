import { useState, useEffect, useCallback } from 'react'
import { X, FileText, DollarSign, Calendar, UserPlus, Search } from 'lucide-react'
import { CONTRACT_STATUS, PAYMENT_SCHEMES } from '@/utils/contractConstants'
import projectsService from '@/services/projectsService'
import unitsService from '@/services/unitsService'
import buyersService from '@/services/buyersService'
import usersService from '@/services/usersService'
import BuyerFormModal from './BuyerFormModal'

const initialForm = {
  projectId: '', unitId: '', buyerId: '', sellerId: '',
  contractNumber: '', status: 'promesa', paymentScheme: 'enganche_mensualidades',
  salePrice: '', downPayment: '', monthlyPayment: '', totalPayments: '',
  promiseDate: '', signDate: '', notaryDate: '', deliveryDate: '',
  notary: '', notes: ''
}

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
        // Incluir vendedores + gerentes
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
        // Solo mostrar disponibles y apartadas (o la unidad actual si estamos editando)
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
        salePrice: contract.salePrice || '', downPayment: contract.downPayment || '',
        monthlyPayment: contract.monthlyPayment || '', totalPayments: contract.totalPayments || '',
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
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'projectId') setForm(prev => ({ ...prev, unitId: '' }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form)
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

  // Filtered buyers
  const filteredBuyers = buyers.filter(b => {
    if (!buyerSearch) return true
    const q = buyerSearch.toLowerCase()
    return b.name?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q) || b.phone?.includes(q)
  })

  if (!isOpen) return null

  const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[var(--color-text-secondary)]"
  const selectClass = (name) => `w-full px-3 py-2.5 text-sm rounded-lg border transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] ${errors[name] ? 'border-red-300 bg-red-50/50' : 'border-[var(--color-border)] bg-white hover:border-gray-300'}`
  const inputClass = (name) => `w-full px-3 py-2.5 text-sm rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] ${errors[name] ? 'border-red-300 bg-red-50/50' : 'border-[var(--color-border)] bg-white hover:border-gray-300'}`
  const sectionLabel = (text) => <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>{text}</p>

  const selectedBuyer = buyers.find(b => b._id === form.buyerId)

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-overlayIn" style={{ background: 'rgba(15,36,56,0.45)', backdropFilter: 'blur(4px)' }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl animate-scaleIn overflow-hidden max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}>
            <div>
              <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {isEditing ? 'Editar Contrato' : 'Nuevo Contrato'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">{isEditing ? 'Modifica los datos del contrato' : 'Vincula una unidad con un comprador'}</p>
            </div>
            <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"><X size={20} /></button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

            {/* Vinculación */}
            {sectionLabel('Vinculación')}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Proyecto <span className="text-red-400">*</span></label>
                <select name="projectId" value={form.projectId} onChange={handleChange} className={selectClass('projectId')} disabled={isEditing}>
                  <option value="">Seleccionar proyecto...</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
                {errors.projectId && <p className="text-xs text-red-500 mt-1">{errors.projectId}</p>}
              </div>
              <div>
                <label className={labelClass}>Unidad <span className="text-red-400">*</span></label>
                <select name="unitId" value={form.unitId} onChange={handleChange} className={selectClass('unitId')} disabled={!form.projectId || isEditing}>
                  <option value="">{form.projectId ? 'Seleccionar unidad...' : 'Selecciona un proyecto primero'}</option>
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
              {/* Buyer selector with search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-[11px] text-gray-400" />
                <input
                  type="text"
                  value={selectedBuyer ? selectedBuyer.name : buyerSearch}
                  onChange={(e) => { setBuyerSearch(e.target.value); if (form.buyerId) setForm(prev => ({ ...prev, buyerId: '' })) }}
                  placeholder="Buscar comprador por nombre, correo o teléfono..."
                  className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 ${errors.buyerId ? 'border-red-300' : 'border-[var(--color-border)]'}`}
                />
                {/* Dropdown */}
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
            <div className="grid grid-cols-3 gap-4">
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

            {/* Montos */}
            {sectionLabel('Condiciones Económicas')}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Precio de venta (MXN) <span className="text-red-400">*</span></label>
                <input type="number" name="salePrice" value={form.salePrice} onChange={handleChange} placeholder="2,500,000" className={inputClass('salePrice')} />
                {errors.salePrice && <p className="text-xs text-red-500 mt-1">{errors.salePrice}</p>}
              </div>
              <div>
                <label className={labelClass}>Enganche (MXN)</label>
                <input type="number" name="downPayment" value={form.downPayment} onChange={handleChange} placeholder="500,000" className={inputClass('downPayment')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Mensualidad (MXN)</label>
                <input type="number" name="monthlyPayment" value={form.monthlyPayment} onChange={handleChange} placeholder="25,000" className={inputClass('monthlyPayment')} />
              </div>
              <div>
                <label className={labelClass}>Total de pagos</label>
                <input type="number" name="totalPayments" value={form.totalPayments} onChange={handleChange} placeholder="Ej: 36" className={inputClass('totalPayments')} />
              </div>
            </div>

            {/* Fechas */}
            {sectionLabel('Fechas Clave')}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Firma de promesa</label>
                <input type="date" name="promiseDate" value={form.promiseDate} onChange={handleChange} className={inputClass('promiseDate')} />
              </div>
              <div>
                <label className={labelClass}>Firma de contrato definitivo</label>
                <input type="date" name="signDate" value={form.signDate} onChange={handleChange} className={inputClass('signDate')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
      <BuyerFormModal isOpen={buyerModalOpen} onClose={() => setBuyerModalOpen(false)} onSubmit={handleCreateBuyer} buyer={null} loading={buyerLoading} />
    </>
  )
}

export default ContractFormModal
