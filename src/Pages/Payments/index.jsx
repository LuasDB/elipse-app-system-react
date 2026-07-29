import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, Search, ChevronDown, DollarSign, AlertCircle } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import RegisterPaymentModal from './RegisterPaymentModal'
import ContractPaymentsCard from './ContractPaymentsCard'
import Toast from '@/components/common/Toast'
import paymentsService from '@/services/paymentsService'
import projectsService from '@/services/projectsService'
import { formatUSD, formatMXN, convertToMXN } from '@/utils/currency'

const Payments = () => {
  // Deep link desde el Dashboard: ?project=<id>&contract=<id> abre el proyecto
  // y resalta/expande el contrato correspondiente al pago que se dio click.
  const [searchParams] = useSearchParams()
  const targetContractId = searchParams.get('contract') || null

  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(searchParams.get('project') || '')
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const [registerOpen, setRegisterOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [selectedContract, setSelectedContract] = useState(null)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [toast, setToast] = useState(null)

  // Cargar proyectos
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await projectsService.getAll()
        setProjects(res.data || [])
      } catch (err) { console.error(err) }
    }
    loadProjects()
  }, [])

  // Cargar contratos abiertos cuando cambia el proyecto seleccionado
  const fetchContracts = useCallback(async () => {
    if (!selectedProject) {
      setContracts([])
      return
    }
    setLoading(true)
    try {
      const res = await paymentsService.getOpenContractsByProject(selectedProject)
      setContracts(res.data || [])
    } catch (err) {
      setToast({ message: 'Error al cargar contratos del proyecto', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [selectedProject])

  useEffect(() => { fetchContracts() }, [fetchContracts])

  // Al llegar desde el Dashboard con un contrato objetivo, hace scroll hasta su card
  // una vez que los contratos terminaron de cargar.
  useEffect(() => {
    if (!targetContractId || loading || contracts.length === 0) return
    const el = document.getElementById(`contract-${targetContractId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [targetContractId, loading, contracts])

  // Filtro por buscador (sobre los contratos cargados)
  const filteredContracts = contracts.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.buyerName?.toLowerCase().includes(q) ||
      c.unitIdentifier?.toLowerCase().includes(q) ||
      c.contractNumber?.toLowerCase().includes(q)
  })

  // Resumen agregado del proyecto
  const projectSummary = {
    totalExpected: contracts.reduce((s, c) => s + (c.totalExpected || 0), 0),
    totalPaid: contracts.reduce((s, c) => s + (c.totalPaid || 0), 0),
    totalBalance: contracts.reduce((s, c) => s + (c.totalBalance || 0), 0),
    overdueCount: contracts.reduce((s, c) => s + (c.overdueCount || 0), 0),
    contractsCount: contracts.length
  }

  const selectedProjectData = projects.find(p => p._id === selectedProject)
  // Usar el primer contrato con TC para calcular MXN agregado (asume TC consistente o aprox)
  const fallbackRate = contracts[0]?.exchangeRate

  const handleRegisterPayment = (payment, contract) => {
    setSelectedPayment(payment)
    setSelectedContract(contract)
    setRegisterOpen(true)
  }

  const handleSubmitPayment = async (formData) => {
    if (!selectedPayment) return
    setRegisterLoading(true)
    try {
      await paymentsService.registerPayment(selectedPayment._id, {
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        reference: formData.reference,
        notes: formData.notes,
        exchangeRate: Number(formData.exchangeRate),
        exchangeRateDate: formData.exchangeRateDate
      })

      if (formData.files && formData.files.length > 0) {
        const fd = new FormData()
        formData.files.forEach(f => fd.append('vouchers', f))
        await paymentsService.uploadVouchers(selectedPayment._id, fd)
      }

      setToast({ message: 'Pago registrado correctamente', type: 'success' })
      setRegisterOpen(false)
      setSelectedPayment(null)
      setSelectedContract(null)
      await fetchContracts()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al registrar el pago'
      setToast({ message: msg, type: 'error' })
    } finally {
      setRegisterLoading(false)
    }
  }

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Seguimiento de Pagos" subtitle="Gestión de cobranza por proyecto" />

      {/* Selector de proyecto */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        <div className="md:col-span-5">
          <label className="block text-[11px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Proyecto <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-sm rounded-lg border bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="">— Selecciona un proyecto —</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          </div>
        </div>

        {selectedProject && (
          <div className="md:col-span-7">
            <label className="block text-[11px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Buscar contrato
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por comprador, unidad o número de contrato..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Estado vacío: sin proyecto seleccionado */}
      {!selectedProject && (
        <div className="rounded-xl border-2 border-dashed p-12 text-center" style={{ borderColor: 'var(--color-border-light)' }}>
          <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
            <Building2 size={24} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Selecciona un proyecto</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Elige un proyecto del menú superior para ver el seguimiento de pagos de sus contratos abiertos.</p>
        </div>
      )}

      {/* Loading */}
      {selectedProject && loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
        </div>
      )}

      {/* Resumen del proyecto */}
      {selectedProject && !loading && contracts.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="p-4 rounded-xl border bg-white" style={{ borderColor: 'var(--color-border-light)' }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Contratos abiertos</p>
              <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-primary)' }}>{projectSummary.contractsCount}</p>
            </div>
            <div className="p-4 rounded-xl border bg-white" style={{ borderColor: 'var(--color-border-light)' }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Cobrado</p>
              <p className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-success)' }}>{formatUSD(projectSummary.totalPaid)}</p>
              {fallbackRate && <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>≈ {formatMXN(convertToMXN(projectSummary.totalPaid, fallbackRate))}</p>}
            </div>
            <div className="p-4 rounded-xl border bg-white" style={{ borderColor: 'var(--color-border-light)' }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Saldo total</p>
              <p className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-warning)' }}>{formatUSD(projectSummary.totalBalance)}</p>
              {fallbackRate && <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>≈ {formatMXN(convertToMXN(projectSummary.totalBalance, fallbackRate))}</p>}
            </div>
            <div className="p-4 rounded-xl border bg-white" style={{ borderColor: projectSummary.overdueCount > 0 ? 'var(--color-danger)' : 'var(--color-border-light)' }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Pagos vencidos</p>
              <p className="text-2xl font-bold tracking-tight" style={{ color: projectSummary.overdueCount > 0 ? 'var(--color-danger)' : 'var(--color-text)' }}>
                {projectSummary.overdueCount}
              </p>
            </div>
          </div>

          {/* Lista de contratos como cards */}
          <div className="space-y-3">
            {filteredContracts.length === 0 ? (
              <div className="rounded-xl border bg-white p-12 text-center" style={{ borderColor: 'var(--color-border-light)' }}>
                <AlertCircle size={28} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {contracts.length === 0
                    ? 'No hay contratos abiertos en este proyecto'
                    : 'Sin resultados para tu búsqueda'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {contracts.length === 0
                    ? 'Los contratos sin saldo pendiente no se muestran aquí.'
                    : 'Prueba con otro término de búsqueda.'}
                </p>
              </div>
            ) : (
              filteredContracts.map((c, idx) => (
                <ContractPaymentsCard
                  key={c._id}
                  contract={c}
                  defaultOpen={c._id === targetContractId || (idx === 0 && filteredContracts.length <= 3)}
                  highlighted={c._id === targetContractId}
                  onRegisterPayment={handleRegisterPayment}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Estado vacío: proyecto sin contratos */}
      {selectedProject && !loading && contracts.length === 0 && (
        <div className="rounded-xl border bg-white p-12 text-center" style={{ borderColor: 'var(--color-border-light)' }}>
          <DollarSign size={36} className="mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
            Sin contratos abiertos en {selectedProjectData?.name || 'este proyecto'}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Todos los contratos están cobrados o cancelados.
          </p>
        </div>
      )}

      {/* Modal de registro de pago */}
      <RegisterPaymentModal
        isOpen={registerOpen}
        onClose={() => { setRegisterOpen(false); setSelectedPayment(null); setSelectedContract(null) }}
        onSubmit={handleSubmitPayment}
        payment={selectedPayment}
        loading={registerLoading}
      />

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}

export default Payments