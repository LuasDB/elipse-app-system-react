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
import projectsService from '@/services/projectsService'

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

  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('') // '' = todos los proyectos

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
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await projectsService.getAll()
        setProjects(res.data || [])
      } catch (err) { console.error(err) }
    }
    loadProjects()
  }, [])

  const filtered = contracts.filter(c => {
    if (statusFilter && c.status !== statusFilter) return false
    if (selectedProject && c.projectId !== selectedProject) return false
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
        const stats = res?.data?.regenerationStats
        if (stats?.fullRegeneration) {
          setToast({ message: `Contrato actualizado · calendario regenerado (${stats.generated} pagos)`, type: 'success' })
        } else if (stats && stats.preserved > 0) {
          setToast({ message: `Contrato actualizado · se conservaron ${stats.preserved} pagos con cobros`, type: 'warning' })
        } else {
          setToast({ message: 'Contrato actualizado', type: 'success' })
        }
      } else {
        await contractsService.create(formData)
        setToast({ message: 'Contrato creado · calendario generado automáticamente', type: 'success' })
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
  <div className="animate-fadeIn px-4 sm:px-6 pb-6">

    {/* Header */}
    <PageHeader
      title="Contratos"
      subtitle="Gestión de contratos de compraventa"
      actions={
        <button
          onClick={() => { setEditingContract(null); setFormOpen(true) }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white transition-all hover:shadow-lg active:scale-[0.98]"
          style={{ background: 'var(--color-primary)' }}
        >
          <Plus size={18} /> Nuevo contrato
        </button>
      }
    />

    {/* Stats pills */}
    {stats.length > 0 && (
      <div className="flex overflow-x-auto gap-2 mb-5 pb-1">
        <button
          onClick={() => setStatusFilter('')}
          className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
            !statusFilter
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
              : 'bg-white border-[var(--color-border)] text-[var(--color-text-secondary)]'
          }`}
        >
          Todos ({contracts.length})
        </button>

        {stats.map(s => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(statusFilter === s.value ? '' : s.value)}
            className="whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full border transition-all"
            style={
              statusFilter === s.value
                ? { background: s.color, borderColor: s.color, color: 'white' }
                : { borderColor: 'var(--color-border)', color: s.color }
            }
          >
            {s.label} ({s.count})
          </button>
        ))}
      </div>
    )}

    {/* Search */}
    {/* Filtros: proyecto + buscador */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        <div className="md:col-span-4">
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="">Todos los proyectos</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          </div>
        </div>
        <div className="md:col-span-8 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por contrato, comprador o unidad..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
            style={{ borderColor: 'var(--color-border)' }}
          />
        </div>
      </div>

    {/* Tabs */}
    <div className="flex overflow-x-auto gap-1 mb-4 border-b pb-1"
      style={{ borderColor: 'var(--color-border-light)' }}
    >
      {CONTRACT_MODALITIES.map(m => {
        const isActive = activeTab === m.value
        const count = m.value === 'monthly' ? monthlyCount : milestonesCount
        const Icon = m.value === 'milestones' ? Hammer : Calendar

        return (
          <button
            key={m.value}
            onClick={() => setActiveTab(m.value)}
            className="relative flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap"
            style={{
              color: isActive ? m.color : 'var(--color-text-muted)'
            }}
          >
            <Icon size={14} />
            {m.label}
            <span
              className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
              style={{
                background: isActive ? m.bg : 'var(--color-surface)',
                color: isActive ? m.color : 'var(--color-text-muted)'
              }}
            >
              {count}
            </span>

            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: m.color }}
              />
            )}
          </button>
        )
      })}
    </div>

    {/* TABLE DESKTOP */}
    <div className="hidden md:block rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: 'var(--color-border-light)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--color-surface-sunken)' }}>
              {['Contrato', 'Proyecto', 'Unidad', 'Comprador', 'Precio', 'Estado', 'Fecha', ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-3 text-[11px] font-semibold uppercase"
                  style={{ color: 'var(--color-text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {contractsByTab.map((contract, idx) => {
              const cStatus = getStatusConfig(CONTRACT_STATUS, contract.status)

              return (
                <tr
                  key={contract._id || idx}
                  className="hover:bg-[var(--color-surface)] cursor-pointer"
                  onClick={() => openDetail(contract)}
                >
                  <td className="px-4 py-3 font-semibold text-[var(--color-primary)]">
                    {contract.contractNumber || '—'}
                  </td>
                  <td className="px-4 py-3">{contract.projectName}</td>
                  <td className="px-4 py-3">{contract.unitIdentifier}</td>
                  <td className="px-4 py-3">{contract.buyerName}</td>
                  <td className="px-4 py-3">
                    <DualPrice usd={contract.salePrice} rate={contract.exchangeRate} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge {...cStatus} size="xs" />
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {formatDate(contract.createdAt)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>

    {/* MOBILE CARDS */}
    <div className="md:hidden space-y-3">
      {contractsByTab.map((c, idx) => {
        const cStatus = getStatusConfig(CONTRACT_STATUS, c.status)

        return (
          <div
            key={c._id || idx}
            onClick={() => openDetail(c)}
            className="p-4 rounded-xl border bg-white shadow-sm"
            style={{ borderColor: 'var(--color-border-light)' }}
          >
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-[var(--color-primary)]">
                {c.contractNumber || '—'}
              </span>
              <StatusBadge {...cStatus} size="xs" />
            </div>

            <p className="text-sm">{c.projectName}</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {c.unitIdentifier} • {c.buyerName}
            </p>

            <div className="mt-2">
              <DualPrice usd={c.salePrice} rate={c.exchangeRate} size="sm" />
            </div>

            <p className="text-xs mt-2 text-[var(--color-text-muted)]">
              {formatDate(c.createdAt)}
            </p>
          </div>
        )
      })}
    </div>

    {/* MODALS */}
    <ContractFormModal
      isOpen={formOpen}
      onClose={() => { setFormOpen(false); setEditingContract(null) }}
      onSubmit={handleSubmit}
      contract={editingContract}
      loading={formLoading}
    />

    <ConfirmDialog
      isOpen={deleteOpen}
      onClose={() => { setDeleteOpen(false); setDeletingContract(null) }}
      onConfirm={handleDelete}
      title="Eliminar contrato"
      message={`¿Eliminar el contrato ${deletingContract?.contractNumber}?`}
      loading={deleteLoading}
    />

    {detailOpen && selectedContract && (
      <ContractDetail
        contract={selectedContract}
        onClose={() => { setDetailOpen(false); setSelectedContract(null) }}
      />
    )}

    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
      />
    )}
  </div>
)
}

export default ContractsPage
