import { useState, useEffect } from 'react'
import {
  X, Building2, Home, User, DollarSign, Calendar, FileText,
  Phone, Mail, MapPin, CheckCircle, Clock, AlertTriangle,
  ExternalLink, File, Paperclip, ChevronDown, ChevronUp
} from 'lucide-react'
import StatusBadge from '@/components/common/StatusBadge'
import { CONTRACT_STATUS, PAYMENT_SCHEMES } from '@/utils/contractConstants'
import { PAYMENT_STATUS } from '@/utils/paymentConstants'
import { getStatusConfig } from '@/utils/projectConstants'
import paymentsService from '@/services/paymentsService'
import { API_BASE_URL } from '@/api/axiosConfig'

const formatPrice = (n) => n ? `$${Number(n).toLocaleString('es-MX')}` : '—'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'
const formatDateShort = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const serverBase = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : ''

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2">
    <Icon size={15} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
    <div>
      <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{value || '—'}</p>
    </div>
  </div>
)

const VouchersList = ({ vouchers, paymentId }) => {
  if (!vouchers || vouchers.length === 0) return null

  return (
    <div className="mt-2 space-y-1">
      {vouchers.map((v, i) => (
        <a
          key={i}
          href={`${serverBase}/uploads/payments/${paymentId}/${v.fileName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white transition-colors group"
        >
          <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: v.mimetype?.includes('pdf') ? '#DC26261A' : '#2563EB1A' }}>
            <File size={11} style={{ color: v.mimetype?.includes('pdf') ? '#DC2626' : '#2563EB' }} />
          </div>
          <span className="text-[11px] font-medium truncate flex-1" style={{ color: 'var(--color-text-secondary)' }}>{v.originalName}</span>
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{formatFileSize(v.size)}</span>
          <ExternalLink size={11} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-info)' }} />
        </a>
      ))}
    </div>
  )
}

const ContractDetail = ({ contract, onClose }) => {
  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState(null)
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [expandedPayment, setExpandedPayment] = useState(null)

  if (!contract) return null

  const cStatus = getStatusConfig(CONTRACT_STATUS, contract.status)
  const scheme = PAYMENT_SCHEMES.find(p => p.value === contract.paymentScheme)

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoadingPayments(true)
        const [paymentsRes, summaryRes] = await Promise.all([
          paymentsService.getByContract(contract._id),
          paymentsService.getSummary(contract._id)
        ])
        setPayments(paymentsRes.data || [])
        setSummary(summaryRes.data || null)
      } catch (err) {
        console.error('Error al cargar pagos:', err)
      } finally {
        setLoadingPayments(false)
      }
    }
    loadPayments()
  }, [contract._id])

  const togglePayment = (id) => {
    setExpandedPayment(expandedPayment === id ? null : id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-overlayIn" style={{ background: 'rgba(15,36,56,0.45)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl animate-scaleIn overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {contract.contractNumber || 'Contrato'}
              </h2>
              <StatusBadge label={cStatus.label} color="#fff" bg={`${cStatus.color}44`} size="xs" />
            </div>
            <p className="text-xs text-slate-300 mt-0.5">Detalle completo del contrato</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Proyecto + Unidad */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>Proyecto</p>
              <InfoRow icon={Building2} label="Desarrollo" value={contract.project?.name} />
              <InfoRow icon={MapPin} label="Ubicación" value={[contract.project?.colony, contract.project?.city].filter(Boolean).join(', ')} />
            </div>
            <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>Unidad</p>
              <InfoRow icon={Home} label="Identificador" value={contract.unit?.identifier} />
              <InfoRow icon={Home} label="Tipo" value={contract.unit?.unitType} />
              <InfoRow icon={Home} label="Superficie" value={contract.unit?.totalArea ? `${contract.unit.totalArea} m²` : null} />
            </div>
          </div>

          {/* Comprador */}
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>Comprador</p>
            <div className="grid grid-cols-2 gap-x-6">
              <InfoRow icon={User} label="Nombre" value={contract.buyer?.name} />
              <InfoRow icon={Mail} label="Correo" value={contract.buyer?.email} />
              <InfoRow icon={Phone} label="Teléfono" value={contract.buyer?.phone} />
              <InfoRow icon={FileText} label="RFC" value={contract.buyer?.rfc} />
            </div>
          </div>

          {/* Vendedor */}
          {contract.seller && (
            <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>Vendedor Asignado</p>
              <InfoRow icon={User} label="Nombre" value={contract.seller?.name} />
              <InfoRow icon={Mail} label="Correo" value={contract.seller?.email} />
            </div>
          )}

          {/* Condiciones económicas */}
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>Condiciones Económicas</p>
            <div className="grid grid-cols-2 gap-x-6">
              <InfoRow icon={DollarSign} label="Precio de venta" value={formatPrice(contract.salePrice)} />
              <InfoRow icon={DollarSign} label="Enganche" value={formatPrice(contract.downPayment)} />
              <InfoRow icon={DollarSign} label="Mensualidad" value={formatPrice(contract.monthlyPayment)} />
              <InfoRow icon={FileText} label="Total de pagos" value={contract.totalPayments || '—'} />
              <InfoRow icon={FileText} label="Esquema de pago" value={scheme?.label} />
            </div>
          </div>

          {/* Fechas */}
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>Fechas Clave</p>
            <div className="grid grid-cols-2 gap-x-6">
              <InfoRow icon={Calendar} label="Firma de promesa" value={formatDate(contract.promiseDate)} />
              <InfoRow icon={Calendar} label="Contrato definitivo" value={formatDate(contract.signDate)} />
              <InfoRow icon={Calendar} label="Escrituración" value={formatDate(contract.notaryDate)} />
              <InfoRow icon={Calendar} label="Entrega" value={formatDate(contract.deliveryDate)} />
            </div>
            {contract.notary && <InfoRow icon={FileText} label="Notaría" value={contract.notary} />}
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* SECCIÓN DE PAGOS */}
          {/* ═══════════════════════════════════════ */}
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-accent)' }}>
              Seguimiento de Pagos
            </p>

            {loadingPayments ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-6">
                <DollarSign size={28} className="mx-auto mb-2" style={{ color: 'var(--color-border)' }} />
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No hay pagos programados para este contrato</p>
              </div>
            ) : (
              <>
                {/* Summary cards */}
                {summary && (
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Total', value: formatPrice(summary.totalExpected), icon: DollarSign, color: 'var(--color-primary)' },
                      { label: 'Cobrado', value: formatPrice(summary.totalPaid), icon: CheckCircle, color: 'var(--color-success)' },
                      { label: 'Pendiente', value: formatPrice(summary.totalBalance), icon: Clock, color: 'var(--color-warning)' },
                      { label: 'Vencidos', value: summary.overdueCount, icon: AlertTriangle, color: 'var(--color-danger)' },
                    ].map((s, i) => (
                      <div key={i} className="text-center p-3 rounded-lg bg-white border" style={{ borderColor: 'var(--color-border-light)' }}>
                        <s.icon size={16} className="mx-auto mb-1" style={{ color: s.color }} />
                        <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress bar */}
                {summary && summary.totalExpected > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                      <span style={{ color: 'var(--color-text-muted)' }}>{summary.paidCount} de {summary.totalPayments} pagos</span>
                      <span style={{ color: 'var(--color-success)' }}>{Math.round(summary.totalPaid / summary.totalExpected * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.round(summary.totalPaid / summary.totalExpected * 100)}%`, background: 'linear-gradient(90deg, var(--color-success), #34d399)' }} />
                    </div>
                  </div>
                )}

                {/* Payments list */}
                <div className="space-y-1.5">
                  {payments.map((p) => {
                    const pStatus = getStatusConfig(PAYMENT_STATUS, p.status)
                    const isOverdue = p.status === 'vencido'
                    const isPaid = p.status === 'pagado'
                    const hasVouchers = p.vouchers && p.vouchers.length > 0
                    const isExpanded = expandedPayment === p._id

                    return (
                      <div key={p._id} className={`rounded-lg border overflow-hidden transition-all ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-[var(--color-border-light)] bg-white'}`}>
                        {/* Row */}
                        <button
                          onClick={() => togglePayment(p._id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-surface)] transition-colors"
                        >
                          {/* Number */}
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                            style={{
                              background: isPaid ? 'var(--color-success-bg)' : isOverdue ? 'var(--color-danger-bg)' : 'var(--color-surface-sunken)',
                              color: isPaid ? 'var(--color-success)' : isOverdue ? 'var(--color-danger)' : 'var(--color-text-muted)'
                            }}
                          >
                            {isPaid ? '✓' : p.paymentNumber}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{p.concept}</span>
                              {hasVouchers && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                                  <Paperclip size={9} />{p.vouchers.length}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                              Vence: {formatDateShort(p.dueDate)}
                              {p.reference && ` · Ref: ${p.reference}`}
                            </span>
                          </div>

                          {/* Amount */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold" style={{ color: isPaid ? 'var(--color-success)' : isOverdue ? 'var(--color-danger)' : 'var(--color-text)' }}>
                              {formatPrice(p.expectedAmount)}
                            </p>
                            {p.paidAmount > 0 && !isPaid && (
                              <p className="text-[10px]" style={{ color: 'var(--color-success)' }}>Abonado: {formatPrice(p.paidAmount)}</p>
                            )}
                          </div>

                          {/* Status */}
                          <StatusBadge label={pStatus.label} color={pStatus.color} bg={pStatus.bg} size="xs" />

                          {/* Chevron */}
                          <div className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </button>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Monto esperado</p>
                                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{formatPrice(p.expectedAmount)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Pagado</p>
                                <p className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>{formatPrice(p.paidAmount)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Saldo</p>
                                <p className="text-sm font-bold" style={{ color: p.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatPrice(p.balance)}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Método</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{p.paymentMethod || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Referencia</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{p.reference || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Fecha de pago</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{p.paidDate ? formatDateShort(p.paidDate) : '—'}</p>
                              </div>
                            </div>

                            {p.notes && (
                              <div className="mb-3">
                                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Notas</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{p.notes}</p>
                              </div>
                            )}

                            {/* Movimientos */}
                            {p.movements && p.movements.length > 0 && (
                              <div className="mb-3">
                                <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                                  Historial de movimientos ({p.movements.length})
                                </p>
                                <div className="space-y-1">
                                  {p.movements.map((m, mi) => (
                                    <div key={mi} className="flex items-center justify-between px-3 py-2 rounded-md bg-[var(--color-surface)] text-xs">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle size={12} style={{ color: 'var(--color-success)' }} />
                                        <span style={{ color: 'var(--color-text-secondary)' }}>
                                          {m.paymentMethod || 'Pago'} {m.reference ? `· ${m.reference}` : ''}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="font-bold" style={{ color: 'var(--color-success)' }}>{formatPrice(m.amount)}</span>
                                        <span style={{ color: 'var(--color-text-muted)' }}>{formatDateShort(m.registeredAt)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Comprobantes */}
                            <div>
                              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
                                Comprobantes {hasVouchers ? `(${p.vouchers.length})` : ''}
                              </p>
                              {hasVouchers ? (
                                <VouchersList vouchers={p.vouchers} paymentId={p._id} />
                              ) : (
                                <p className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>Sin comprobantes adjuntos</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Archivos del contrato */}
          {contract.files && contract.files.length > 0 && (
            <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>
                Documentos del Contrato ({contract.files.length})
              </p>
              <div className="space-y-1.5">
                {contract.files.map((f, i) => (
                  <a
                    key={i}
                    href={`${serverBase}/uploads/contracts/${contract._id}/${f.fileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-[var(--color-border-light)] hover:border-gray-300 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: f.mimetype?.includes('pdf') ? '#DC26261A' : '#2563EB1A' }}>
                        <File size={14} style={{ color: f.mimetype?.includes('pdf') ? '#DC2626' : '#2563EB' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{f.originalName}</p>
                        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{formatFileSize(f.size)} · {formatDateShort(f.uploadedAt)}</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-info)' }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {contract.notes && (
            <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-accent)' }}>Observaciones</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{contract.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end border-t flex-shrink-0" style={{ borderColor: 'var(--color-border-light)' }}>
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors">Cerrar</button>
        </div>
      </div>
    </div>
  )
}

export default ContractDetail