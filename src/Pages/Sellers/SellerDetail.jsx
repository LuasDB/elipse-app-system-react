import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Mail, Phone, FileText, DollarSign,
  ChevronDown, ChevronUp, Lock, Paperclip, ExternalLink
} from 'lucide-react'
import { API_BASE_URL } from '@/api/axiosConfig'
import RoleBadge from '@/components/common/RoleBadge'
import StatusBadge from '@/components/common/StatusBadge'
import DualPrice from '@/components/common/DualPrice'
import Toast from '@/components/common/Toast'
import RegisterCommissionPaymentModal from '@/components/common/RegisterCommissionPaymentModal'
import sellersService from '@/services/sellersService'
import commissionsService from '@/services/commissionsService'
import { useAuth } from '@/context/AuthContext'
import { getStatusConfig } from '@/utils/projectConstants'
import { CONTRACT_STATUS } from '@/utils/contractConstants'
import { getCommissionStatusConfig } from '@/utils/commissionConstants'
import { formatUSD } from '@/utils/currency'
import { PAYMENT_METHODS } from '@/utils/paymentConstants'

const formatDateShort = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const getMethodLabel = (value) => PAYMENT_METHODS.find(m => m.value === value)?.label || value || '—'

const SellerDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedContract, setExpandedContract] = useState(null)
  const [registeringPaymentFor, setRegisteringPaymentFor] = useState(null)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const forbidden = user?.role === 'vendedor' && user?._id !== id
  const canRegisterCommissionPayment = ['admin', 'gerente'].includes(user?.role)

  const fetchData = useCallback(async () => {
    if (forbidden) { setLoading(false); return }
    try {
      setLoading(true)
      const res = await sellersService.getById(id)
      setSeller(res.data)
    } catch (error) {
      setToast({ message: error.message || 'Error al cargar el perfil del vendedor', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [id, forbidden])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRegisterPayment = async (formData) => {
    if (!registeringPaymentFor) return
    setRegisterLoading(true)
    try {
      const contractId = registeringPaymentFor.contractId
      const result = await commissionsService.registerPayment(contractId, {
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        reference: formData.reference,
        notes: formData.notes,
        paymentDate: formData.paymentDate
      })

      if (formData.files && formData.files.length > 0) {
        const fd = new FormData()
        formData.files.forEach(f => fd.append('vouchers', f))
        await commissionsService.uploadVouchers(contractId, result.data.movement._id, fd)
      }

      setToast({ message: 'Pago de comisión registrado', type: 'success' })
      setRegisteringPaymentFor(null)
      await fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al registrar el pago de comisión'
      setToast({ message: msg, type: 'error' })
    } finally {
      setRegisterLoading(false)
    }
  }

  if (forbidden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
        <Lock size={40} className="mb-4" style={{ color: 'var(--color-border)' }} />
        <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>No autorizado</h2>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>Solo puedes ver tu propio perfil de vendedor</p>
      </div>
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
    </div>
  )

  if (!seller) return null

  const stats = seller.stats || {}
  const contracts = seller.contracts || []
  const serverBase = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : ''

  return (
    <div className="animate-fadeIn">
      <button onClick={() => navigate('/vendedores')} className="flex items-center gap-2 text-sm font-medium mb-4 transition-colors hover:text-[var(--color-accent)]" style={{ color: 'var(--color-text-secondary)' }}>
        <ArrowLeft size={16} /> Volver a vendedores
      </button>

      {/* Header */}
      <div className="rounded-xl border bg-white p-6 mb-6" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-light))` }}
          >
            {seller.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>{seller.name}</h1>
              <RoleBadge role={seller.role} />
            </div>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="flex items-center gap-1.5"><Mail size={13} />{seller.email}</span>
              {seller.phone && <span className="flex items-center gap-1.5"><Phone size={13} />{seller.phone}</span>}
            </div>
          </div>
        </div>

        {/* Stats row: estado de cuenta general */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-5 border-t border-[var(--color-border-light)]">
          {[
            { label: 'Contratos', value: stats.contractsCount || 0, isMoney: false, color: 'var(--color-primary)' },
            { label: 'Ventas totales', value: stats.totalSales, isMoney: true, color: 'var(--color-text)' },
            { label: 'Comisión asignada', value: stats.commissionAssigned, isMoney: true, color: 'var(--color-text)' },
            { label: 'Comisión pagada', value: stats.commissionPaid, isMoney: true, color: 'var(--color-success)' },
            { label: 'Comisión pendiente', value: stats.commissionPending, isMoney: true, color: stats.commissionPending > 0 ? 'var(--color-danger)' : 'var(--color-success)' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.isMoney ? formatUSD(s.value) : s.value}</p>
              <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de contratos asignados */}
      <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>Contratos y comisiones</p>
        </div>

        {contracts.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={36} className="mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Este vendedor aún no tiene contratos asignados</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
            {contracts.map((contract) => {
              const cStatus = getStatusConfig(CONTRACT_STATUS, contract.status)
              const commission = contract.commission
              const commStatus = getCommissionStatusConfig(commission?.status)
              const isExpanded = expandedContract === contract._id

              return (
                <div key={contract._id}>
                  <div
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                    onClick={() => setExpandedContract(isExpanded ? null : contract._id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{contract.contractNumber}</p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>{contract.buyerName} · {contract.unitIdentifier}</p>
                    </div>
                    <StatusBadge label={cStatus.label} color={cStatus.color} bg={cStatus.bg} size="xs" />
                    <div className="text-right w-28 flex-shrink-0">
                      <DualPrice usd={contract.salePrice} rate={contract.exchangeRate} size="sm" />
                    </div>
                    <div className="text-right w-20 flex-shrink-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{commission ? `${commission.percentage}%` : '—'}</p>
                    </div>
                    <div className="text-right w-28 flex-shrink-0">
                      {commission ? <DualPrice usd={commission.commissionAmount} rate={contract.exchangeRate} size="sm" /> : <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sin asignar</span>}
                    </div>
                    <div className="w-24 flex-shrink-0">
                      {commission && <StatusBadge label={commStatus.label} color={commStatus.color} bg={commStatus.bg} size="xs" />}
                    </div>
                    <div className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1" style={{ background: 'var(--color-surface)' }}>
                      {!commission ? (
                        <p className="text-xs py-3" style={{ color: 'var(--color-text-muted)' }}>Sin comisión asignada para este contrato</p>
                      ) : (
                        <>
                          <div className="grid grid-cols-3 gap-4 py-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Comisión total</p>
                              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{formatUSD(commission.commissionAmount)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Pagado</p>
                              <p className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>{formatUSD(commission.paidAmount)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Saldo</p>
                              <p className="text-sm font-bold" style={{ color: commission.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatUSD(commission.balance)}</p>
                            </div>
                          </div>

                          {canRegisterCommissionPayment && commission.balance > 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setRegisteringPaymentFor(commission) }}
                              className="mb-3 px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors hover:opacity-90 flex items-center gap-1.5"
                              style={{ background: 'var(--color-primary)' }}
                            >
                              <DollarSign size={13} /> Registrar pago
                            </button>
                          )}

                          <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                            Historial de pagos de comisión {commission.movements?.length ? `(${commission.movements.length})` : ''}
                          </p>
                          {!commission.movements || commission.movements.length === 0 ? (
                            <p className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>Aún no se han registrado depósitos</p>
                          ) : (
                            <div className="space-y-1">
                              {commission.movements.map((m, mi) => (
                                <div key={m._id || mi} className="px-3 py-2 rounded-md bg-white text-xs">
                                  <div className="flex items-center justify-between">
                                    <span style={{ color: 'var(--color-text-secondary)' }}>
                                      {getMethodLabel(m.paymentMethod)} {m.reference ? `· ${m.reference}` : ''}
                                    </span>
                                    <span className="font-bold" style={{ color: 'var(--color-success)' }}>{formatUSD(m.amount)}</span>
                                    <span style={{ color: 'var(--color-text-muted)' }}>{formatDateShort(m.paymentDate || m.registeredAt)}</span>
                                  </div>
                                  {m.vouchers?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-1.5 pt-1.5 border-t border-[var(--color-border-light)]">
                                      {m.vouchers.map((v, vi) => (
                                        <a
                                          key={vi}
                                          href={`${serverBase}/uploads/commissions/${commission.contractId}/${v.fileName}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-[var(--color-surface)] transition-colors"
                                          style={{ color: 'var(--color-info)' }}
                                          title={v.originalName}
                                        >
                                          <Paperclip size={11} />
                                          <span className="truncate max-w-[100px]">{v.originalName}</span>
                                          <ExternalLink size={10} />
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <RegisterCommissionPaymentModal
        isOpen={!!registeringPaymentFor}
        onClose={() => setRegisteringPaymentFor(null)}
        onSubmit={handleRegisterPayment}
        commission={registeringPaymentFor}
        loading={registerLoading}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default SellerDetail
