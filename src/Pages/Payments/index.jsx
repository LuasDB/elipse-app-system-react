import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, DollarSign, ChevronDown, Calendar,
  AlertTriangle, CheckCircle, Clock, Building2, User,Paperclip
} from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import RegisterPaymentModal from './RegisterPaymentModal'
import Toast from '@/components/common/Toast'
import paymentsService from '@/services/paymentsService'
import contractsService from '@/services/contractsService'
import { PAYMENT_STATUS } from '@/utils/paymentConstants'
import { getStatusConfig } from '@/utils/projectConstants'
import { formatUSD, formatMXN, convertToMXN } from '@/utils/currency'
import DualPrice from '@/components/common/DualPrice'

const formatPrice = (n) => formatUSD(n)
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const PaymentsPage = () => {
  const [contracts, setContracts] = useState([])
  const [selectedContract, setSelectedContract] = useState('')
  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Modals
  const [registerOpen, setRegisterOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [toast, setToast] = useState(null)

  // Load contracts
  useEffect(() => {
    const load = async () => {
      try {
        const res = await contractsService.getAll()
        setContracts(res.data || [])
      } catch (err) { console.error(err) }
    }
    load()
  }, [])

  // Load payments when contract selected
  const fetchPayments = useCallback(async () => {
    if (!selectedContract) { setPayments([]); setSummary(null); return }
    setLoading(true)
    try {
      const [paymentsRes, summaryRes] = await Promise.all([
        paymentsService.getByContract(selectedContract),
        paymentsService.getSummary(selectedContract)
      ])
      setPayments(paymentsRes.data || [])
      setSummary(summaryRes.data || null)
    } catch (err) {
      setToast({ message: 'Error al cargar pagos', type: 'error' })
    } finally { setLoading(false) }
  }, [selectedContract])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  // Generate schedule
  const handleGenerate = async () => {
    if (!selectedContract) return
    try {
      const res = await paymentsService.generateSchedule(selectedContract)
      setToast({ message: res.message, type: 'success' })
      fetchPayments()
    } catch (err) {
      setToast({ message: err.message || 'Error al generar', type: 'error' })
    }
  }

  // Register payment
  const handleRegister = async (formData) => {
  setRegisterLoading(true)
  try {
    const { files, ...paymentData } = formData

    // 1. Registrar el pago
    await paymentsService.registerPayment(selectedPayment._id, paymentData)

    // 2. Subir comprobantes si hay
    if (files && files.length > 0) {
      await paymentsService.uploadVouchers(selectedPayment._id, files)
    }

    setToast({ message: 'Pago registrado exitosamente', type: 'success' })
    setRegisterOpen(false)
    setSelectedPayment(null)
    fetchPayments()
  } catch (err) {
    setToast({ message: err.message || 'Error al registrar', type: 'error' })
  } finally { setRegisterLoading(false) }
}

  // Filter
  const filtered = payments.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return p.concept?.toLowerCase().includes(q) || p.reference?.toLowerCase().includes(q)
    }
    return true
  })

  const selectedContractData = contracts.find(c => c._id === selectedContract)

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Pagos" subtitle="Control y seguimiento de cobranza" />

      {/* Contract selector */}
      <div className="p-4 rounded-xl border bg-white mb-6" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--color-text-secondary)]">Seleccionar contrato</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <select
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="">Seleccionar contrato...</option>
              {contracts.map(c => (
                <option key={c._id} value={c._id}>
                  {c.contractNumber} — {c.buyerName} — {c.unitIdentifier} ({c.projectName})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]" />
          </div>
          {selectedContract && payments.length === 0 && !loading && (
            <button onClick={handleGenerate} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white transition-all hover:shadow-md flex-shrink-0" style={{ background: 'var(--color-primary)' }}>
              <Calendar size={16} /> Generar calendario
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total contrato', value: formatPrice(summary.totalExpected), mxn: selectedContractData?.exchangeRate ? formatMXN(convertToMXN(summary.totalExpected, selectedContractData.exchangeRate)) : null, icon: DollarSign, color: 'var(--color-primary)', bg: 'var(--color-info-bg)' },
            { label: 'Cobrado', value: formatPrice(summary.totalPaid), mxn: selectedContractData?.exchangeRate ? formatMXN(convertToMXN(summary.totalPaid, selectedContractData.exchangeRate)) : null, icon: CheckCircle, color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
            { label: 'Saldo pendiente', value: formatPrice(summary.totalBalance), mxn: selectedContractData?.exchangeRate ? formatMXN(convertToMXN(summary.totalBalance, selectedContractData.exchangeRate)) : null, icon: Clock, color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
            { label: 'Vencidos', value: summary.overdueCount, mxn: null, icon: AlertTriangle, color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-white" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight" style={{ color: s.color }}>{s.value}</p>
                {s.mxn && <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>≈ {s.mxn}</p>}
                <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {summary && summary.totalExpected > 0 && (
        <div className="p-4 rounded-xl border bg-white mb-6" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between text-xs font-medium mb-2">
            <span style={{ color: 'var(--color-text-secondary)' }}>Progreso de cobranza: {summary.paidCount} de {summary.totalPayments} pagos</span>
            <span style={{ color: 'var(--color-accent)' }}>{Math.round(summary.totalPaid / summary.totalExpected * 100)}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.round(summary.totalPaid / summary.totalExpected * 100)}%`, background: 'linear-gradient(90deg, var(--color-success), #34d399)' }} />
          </div>
        </div>
      )}

      {/* Filters */}
      {payments.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por concepto o referencia..." className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setStatusFilter('')} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${!statusFilter ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
              Todos
            </button>
            {PAYMENT_STATUS.map(s => (
              <button key={s.value} onClick={() => setStatusFilter(statusFilter === s.value ? '' : s.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${statusFilter === s.value ? 'text-white' : 'bg-white'}`}
                style={statusFilter === s.value ? { background: s.color, borderColor: s.color } : { borderColor: 'var(--color-border)', color: s.color }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Payments table */}
      {selectedContract && (
        <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--color-surface-sunken)' }}>
                  {['#', 'Concepto', 'Vencimiento', 'Esperado (USD)', 'Pagado (USD)', 'Saldo (USD)', 'Estado', 'Acción'].map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-light)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-16">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto" />
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-16">
                    <DollarSign size={36} className="mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      {payments.length === 0 ? 'No hay pagos programados' : 'Sin resultados'}
                    </p>
                  </td>
                  
                  
                  </tr>
                ) : filtered.map((p, idx) => {
                  const pStatus = getStatusConfig(PAYMENT_STATUS, p.status)
                  const isOverdue = p.status === 'vencido'
                  return (
                    <tr key={p._id || idx} className={`group transition-colors ${isOverdue ? 'bg-red-50/40' : 'hover:bg-[var(--color-surface)]'}`} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{p.paymentNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{p.concept}</span>
                            {p.reference && <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Ref: {p.reference}</p>}
                          </div>
                          {p.vouchers && p.vouchers.length > 0 && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                              <Paperclip size={10} />{p.vouchers.length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${isOverdue ? 'font-semibold' : ''}`} style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                          {formatDate(p.dueDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <DualPrice usd={p.expectedAmount} rate={p.contractExchangeRate} size="sm" color="var(--color-text-secondary)" />
                      </td>
                      <td className="px-4 py-3">
                        <DualPrice usd={p.paidAmount} rate={p.lastExchangeRate || p.contractExchangeRate} size="sm" color="var(--color-success)" />
                      </td>
                      <td className="px-4 py-3">
                        <DualPrice usd={p.balance} rate={p.contractExchangeRate} size="sm" color={p.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)'} />
                      </td>
                      <td className="px-4 py-3"><StatusBadge label={pStatus.label} color={pStatus.color} bg={pStatus.bg} size="xs" /></td>
                      <td className="px-4 py-3">
                        {p.status !== 'pagado' && (
                          <button
                            onClick={() => { setSelectedPayment(p); setRegisterOpen(true) }}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-all hover:shadow-sm"
                            style={{ background: 'var(--color-success)' }}
                          >
                            Registrar pago
                          </button>
                        )}
                        {p.status === 'pagado' && (
                          <span className="text-xs font-medium" style={{ color: 'var(--color-success)' }}>✓ Pagado</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border-light)', background: 'var(--color-surface-sunken)' }}>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {payments.filter(p => p.status === 'pagado').length} de {payments.length} pagos completados
              </p>
            </div>
          )}
        </div>
      )}

      {/* No contract selected */}
      {!selectedContract && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed" style={{ borderColor: 'var(--color-border)' }}>
          <DollarSign size={48} style={{ color: 'var(--color-border)' }} />
          <p className="text-sm font-medium mt-4" style={{ color: 'var(--color-text-secondary)' }}>Selecciona un contrato para ver sus pagos</p>
        </div>
      )}

      {/* Modals */}
      <RegisterPaymentModal isOpen={registerOpen} onClose={() => { setRegisterOpen(false); setSelectedPayment(null) }} onSubmit={handleRegister} payment={selectedPayment} loading={registerLoading} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default PaymentsPage