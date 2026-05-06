import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, FileText, MoreHorizontal, Pencil, Trash2,
  ChevronDown, Eye, Building2, User, DollarSign, Calendar, Hammer
} from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import ContractFormModal from './ContractFormModal'
import ContractDetail from './ContractDetail'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Toast from '@/components/common/Toast'
import contractsService from '@/services/contractsService'
import { CONTRACT_STATUS, CONTRACT_MODALITIES } from '@/utils/contractConstants'
import { getStatusConfig } from '@/utils/projectConstants'
import DualPrice from '@/components/common/DualPrice'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const ContractsPage = () => {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingContract, setEditingContract] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingContract, setDeletingContract] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState(null)
  const [toast, setToast] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [activeTab, setActiveTab] = useState('monthly')

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await contractsService.getAll()
      setContracts(response.data || [])
    } catch (error) {
      setToast({ message: 'Error al cargar contratos', type: 'error' })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchContracts() }, [fetchContracts])

  const filtered = contracts.filter(c => {
    if (statusFilter && c.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return c.contractNumber?.toLowerCase().includes(q) ||
        c.buyerName?.toLowerCase().includes(q) ||
        c.unitIdentifier?.toLowerCase().includes(q) ||
        c.projectName?.toLowerCase().includes(q)
    }
    return true
  })

  // Filtrado por tab de modalidad
  const contractsByTab = filtered.filter(c => (c.modality || 'monthly') === activeTab)
  const monthlyCount = filtered.filter(c => (c.modality || 'monthly') === 'monthly').length
  const milestonesCount = filtered.filter(c => c.modality === 'milestones').length

  const handleSubmit = async (formData) => {
    setFormLoading(true)
    try {
      if (editingContract) {
        const res = await contractsService.update(editingContract._id, formData)
        if (res?.data?.shouldRegeneratePayments) {
          try {
            await contractsService.regenerateSchedule(editingContract._id)
            setToast({ message: 'Contrato actualizado y calendario de pagos regenerado', type: 'success' })
          } catch (regenErr) {
            setToast({ message: 'Contrato actualizado, pero falló la regeneración de pagos', type: 'warning' })
          }
        } else {
          setToast({ message: 'Contrato actualizado', type: 'success' })
        }
      } else {
        await contractsService.create(formData)
        setToast({ message: 'Contrato creado', type: 'success' })
      }
      setFormOpen(false)
      setEditingContract(null)
      fetchContracts()
    } catch (error) {
      setToast({ message: error.message || 'Error al guardar', type: 'error' })
    } finally { setFormLoading(false) }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await contractsService.delete(deletingContract._id)
      setToast({ message: 'Contrato eliminado y unidad liberada', type: 'success' })
      setDeleteOpen(false)
      setDeletingContract(null)
      fetchContracts()
    } catch (error) {
      setToast({ message: error.message || 'Error al eliminar', type: 'error' })
    } finally { setDeleteLoading(false) }
  }

  const openDetail = async (contract) => {
    try {
      const res = await contractsService.getById(contract._id)
      setSelectedContract(res.data)
      setDetailOpen(true)
    } catch (err) {
      setToast({ message: 'Error al cargar detalle', type: 'error' })
    }
    setOpenMenuId(null)
  }

  // Stats
  const stats = CONTRACT_STATUS.map(s => ({
    ...s,
    count: contracts.filter(c => c.status === s.value).length
  })).filter(s => s.count > 0)

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Contratos"
        subtitle="Gestión de contratos de compraventa"
        actions={
          <button
            onClick={() => { setEditingContract(null); setFormOpen(true) }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white transition-all hover:shadow-lg hover:shadow-[var(--color-primary)]/20 active:scale-[0.98]"
            style={{ background: 'var(--color-primary)' }}
          >
            <Plus size={18} /> Nuevo contrato
          </button>
        }
      />

      {/* Stats pills */}
      {stats.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${!statusFilter ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-gray-300'}`}
          >
            Todos ({contracts.length})
          </button>
          {stats.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(statusFilter === s.value ? '' : s.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${statusFilter === s.value ? 'text-white' : 'bg-white hover:border-gray-300'}`}
              style={statusFilter === s.value ? { background: s.color, borderColor: s.color } : { borderColor: 'var(--color-border)', color: s.color }}
            >
              {s.label} ({s.count})
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por contrato, comprador, unidad o proyecto..." className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all" style={{ borderColor: 'var(--color-border)' }} />
      </div>

      {/* Tabs de modalidad */}
      <div className="flex items-center gap-1 mb-4 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
        {CONTRACT_MODALITIES.map(m => {
          const isActive = activeTab === m.value
          const count = m.value === 'monthly' ? monthlyCount : milestonesCount
          const Icon = m.value === 'milestones' ? Hammer : Calendar
          return (
            <button
              key={m.value}
              onClick={() => setActiveTab(m.value)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${isActive ? '' : 'hover:bg-gray-50'}`}
              style={{
                color: isActive ? m.color : 'var(--color-text-muted)'
              }}
            >
              <Icon size={14} />
              <span>{m.label}</span>
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                style={{
                  background: isActive ? m.bg : 'var(--color-surface)',
                  color: isActive ? m.color : 'var(--color-text-muted)'
                }}>
                {count}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: m.color }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--color-surface-sunken)' }}>
                {['Contrato', 'Proyecto', 'Unidad', 'Comprador', 'Precio Venta (USD)', 'Estado', 'Fecha', ''].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-light)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Cargando contratos...</p>
                    </div>
                  </td>
                </tr>
              ) : contractsByTab.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-20">
                    <FileText size={40} className="mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      {contracts.length === 0 ? 'Aún no hay contratos registrados' : 'No hay contratos en esta modalidad'}
                    </p>
                  </td>
                </tr>
              ) : contractsByTab.map((contract, idx) => {
                const cStatus = getStatusConfig(CONTRACT_STATUS, contract.status)
                return (
                  <tr key={contract._id || idx} className="group hover:bg-[var(--color-surface)] transition-colors cursor-pointer" style={{ borderBottom: '1px solid var(--color-border-light)' }} onClick={() => openDetail(contract)}>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{contract.contractNumber || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{contract.projectName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{contract.unitIdentifier || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <User size={13} style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{contract.buyerName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <DualPrice usd={contract.salePrice} rate={contract.exchangeRate} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={cStatus.label} color={cStatus.color} bg={cStatus.bg} size="xs" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatDate(contract.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button onClick={() => setOpenMenuId(openMenuId === (contract._id || idx) ? null : (contract._id || idx))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                          <MoreHorizontal size={16} style={{ color: 'var(--color-text-muted)' }} />
                        </button>
                        {openMenuId === (contract._id || idx) && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white rounded-lg border shadow-lg py-1 animate-scaleIn origin-top-right" style={{ borderColor: 'var(--color-border)' }}>
                              <button onClick={() => openDetail(contract)} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-[var(--color-surface)] transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                                <Eye size={14} /> Ver detalle
                              </button>
                              <button onClick={() => { setEditingContract(contract); setFormOpen(true); setOpenMenuId(null) }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-[var(--color-surface)] transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                                <Pencil size={14} /> Editar
                              </button>
                              <button onClick={() => { setDeletingContract(contract); setDeleteOpen(true); setOpenMenuId(null) }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-red-50 transition-colors" style={{ color: 'var(--color-danger)' }}>
                                <Trash2 size={14} /> Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {contractsByTab.length > 0 && (
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border-light)', background: 'var(--color-surface-sunken)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Mostrando <strong>{contractsByTab.length}</strong> de <strong>{contracts.length}</strong> contratos</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ContractFormModal isOpen={formOpen} onClose={() => { setFormOpen(false); setEditingContract(null) }} onSubmit={handleSubmit} contract={editingContract} loading={formLoading} />
      <ConfirmDialog isOpen={deleteOpen} onClose={() => { setDeleteOpen(false); setDeletingContract(null) }} onConfirm={handleDelete} title="Eliminar contrato" message={`¿Eliminar el contrato ${deletingContract?.contractNumber}? La unidad asociada será liberada.`} loading={deleteLoading} />
      {detailOpen && selectedContract && <ContractDetail contract={selectedContract} onClose={() => { setDetailOpen(false); setSelectedContract(null) }} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default ContractsPage
