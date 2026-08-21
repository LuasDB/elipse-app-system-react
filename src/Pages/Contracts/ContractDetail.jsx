import { useState, useEffect } from 'react'
import useLockBodyScroll from '@/hooks/useLockBodyScroll'
import {
  X, Building2, Home, User, DollarSign, Calendar, FileText,
  Phone, Mail, MapPin, CheckCircle, Clock, AlertTriangle,
  ExternalLink, File, Paperclip, ChevronDown, ChevronUp,
  Hammer, Calendar as CalendarIcon, CheckCircle2, Lock,Pencil, Percent, Trash2
} from 'lucide-react'
import StatusBadge from '@/components/common/StatusBadge'
import { CONTRACT_STATUS, PAYMENT_SCHEMES, CONTRACT_MODALITIES, getModalityConfig } from '@/utils/contractConstants'
import { PAYMENT_STATUS, PAYMENT_METHODS } from '@/utils/paymentConstants'
import { getStatusConfig } from '@/utils/projectConstants'
import paymentsService from '@/services/paymentsService'
import { API_BASE_URL } from '@/api/axiosConfig'
import { formatUSD, formatMXN, convertToMXN, formatExchangeRate, formatExchangeRateDate } from '@/utils/currency'
import DualPrice from '@/components/common/DualPrice'
import MilestoneTimeline from '@/components/common/MilestoneTimeline'
import CompleteMilestoneModal from '@/components/common/CompleteMilestoneModal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import Toast from '@/components/common/Toast'
import RegisterPaymentModal from '@/Pages/Payments/RegisterPaymentModal'
import FileUploadZone from '@/components/common/FileUploadZone'
import contractsService from '@/services/contractsService'
import commissionsService from '@/services/commissionsService'
import usersService from '@/services/usersService'
import { getCommissionStatusConfig } from '@/utils/commissionConstants'
import AssignCommissionModal from '@/components/common/AssignCommissionModal'
import RegisterCommissionPaymentModal from '@/components/common/RegisterCommissionPaymentModal'
import EditCommissionPaymentModal from '@/components/common/EditCommissionPaymentModal'
import { useAuth } from '@/context/AuthContext'

const CLOSED_CONTRACT_STATUSES = ['entregado', 'cancelado']

const formatPrice = (n) => formatUSD(n)
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'
const formatDateShort = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const getMethodLabel = (value) => PAYMENT_METHODS.find(m => m.value === value)?.label || value || '—'
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

const ContractDetail = ({ contract, onClose,onEdit }) => {

  const { user } = useAuth()
  const canEdit = ['admin', 'gerente'].includes(user?.role)
  const canAssignCommission = user?.role === 'admin'
  const canRegisterCommissionPayment = ['admin', 'gerente'].includes(user?.role)
  const canEditCommissionPayment = user?.role === 'admin'

  const [commissions, setCommissions] = useState([])
  const [loadingCommission, setLoadingCommission] = useState(true)
  const [allSellers, setAllSellers] = useState([])
  const [assigningCommission, setAssigningCommission] = useState(false)
  const [assigningCommissionLoading, setAssigningCommissionLoading] = useState(false)
  const [registeringCommissionPaymentFor, setRegisteringCommissionPaymentFor] = useState(null)
  const [registeringCommissionPaymentLoading, setRegisteringCommissionPaymentLoading] = useState(false)
  const [editingCommissionMovement, setEditingCommissionMovement] = useState(null)
  const [editingCommissionMovementLoading, setEditingCommissionMovementLoading] = useState(false)
  const [deletingCommissionVoucher, setDeletingCommissionVoucher] = useState(null)
  const [deletingCommissionMovementId, setDeletingCommissionMovementId] = useState(null)

  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState(null)
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [expandedPayment, setExpandedPayment] = useState(null)
  // Estados para gestión de hitos (Línea 2)
  const [completingMilestone, setCompletingMilestone] = useState(null)
  const [completingLoading, setCompletingLoading] = useState(false)
  const [uncompleteMilestone, setUncompleteMilestone] = useState(null)

  const [editingCommitment, setEditingCommitment] = useState(null)
  const [editingCommitmentLoading, setEditingCommitmentLoading] = useState(false)
  const [toast, setToast] = useState(null)
  // Estados para registro de pagos
  const [registeringPayment, setRegisteringPayment] = useState(null)
  const [registerLoading, setRegisterLoading] = useState(false)
  // Para la subida de archivos
  const [contractFiles, setContractFiles] = useState(contract?.files || [])
  const [filesLoading, setFilesLoading] = useState(false)
  //Para la edición de contrato


  useEffect(() => {
    setContractFiles(contract?.files || [])
  }, [contract])

  const isMilestonesContract = contract?.modality === 'milestones'
  const milestonePayments = (payments || []).filter(p => p.isMilestone)
                                            .sort((a, b) => (a.milestoneOrder || 0) - (b.milestoneOrder || 0))
  useLockBodyScroll(!!contract)

  const loadPayments = async () => {
    if (!contract) return
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

  useEffect(() => {
    if (contract?._id) loadPayments()
  }, [contract?._id])

  const loadCommission = async () => {
    if (!contract) return
    try {
      setLoadingCommission(true)
      const res = await commissionsService.getByContract(contract._id)
      setCommissions(res.data || [])
    } catch (err) {
      console.error('Error al cargar las comisiones:', err)
    } finally {
      setLoadingCommission(false)
    }
  }

  useEffect(() => {
    if (contract?._id) loadCommission()
  }, [contract?._id])

  useEffect(() => {
    if (!canAssignCommission) return
    usersService.getAll({ role: 'vendedor' })
      .then(res => setAllSellers(res.data || []))
      .catch(err => console.error('Error al cargar vendedores:', err))
  }, [canAssignCommission])

  if (!contract) return null

  const cStatus = getStatusConfig(CONTRACT_STATUS, contract.status)
  const scheme = PAYMENT_SCHEMES.find(p => p.value === contract.paymentScheme)
  const modalityCfg = getModalityConfig(contract.modality || 'monthly')

  const togglePayment = (id) => {
    setExpandedPayment(expandedPayment === id ? null : id)
  }

  const handleCompleteMilestone = async ({ commitmentDate, notes }) => {
    if (!completingMilestone) return
    setCompletingLoading(true)
    try {
      await paymentsService.completeMilestone(completingMilestone._id, { commitmentDate, notes })
      setToast({ message: 'Hito marcado como completado', type: 'success' })
      setCompletingMilestone(null)
      await loadPayments()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al completar el hito'
      setToast({ message: msg, type: 'error' })
    } finally {
      setCompletingLoading(false)
    }
  }

  const handleUncompleteMilestone = async () => {
    if (!uncompleteMilestone) return
    try {
      await paymentsService.uncompleteMilestone(uncompleteMilestone._id)
      setToast({ message: 'Hito revertido a pendiente', type: 'success' })
      setUncompleteMilestone(null)
      await loadPayments()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al revertir el hito'
      setToast({ message: msg, type: 'error' })
    }
  }

  const handleEditCommitment = async ({ commitmentDate, notes }) => {
    if (!editingCommitment) return
    setEditingCommitmentLoading(true)
    try {
      await paymentsService.updateMilestoneCommitment(editingCommitment._id, { commitmentDate, notes })
      setToast({ message: 'Fecha compromiso actualizada', type: 'success' })
      setEditingCommitment(null)
      await loadPayments()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar'
      setToast({ message: msg, type: 'error' })
    } finally {
      setEditingCommitmentLoading(false)
    }
  }

  const handleRegisterPayment = async (formData) => {
    if (!registeringPayment) return
    setRegisterLoading(true)
    try {
      await paymentsService.registerPayment(registeringPayment._id, {
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
        await paymentsService.uploadVouchers(registeringPayment._id, fd)
      }

      setToast({ message: 'Pago registrado correctamente', type: 'success' })
      setRegisteringPayment(null)
      await loadPayments()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al registrar el pago'
      setToast({ message: msg, type: 'error' })
    } finally {
      setRegisterLoading(false)
    }
  }

  const handleAddSellerCommission = async ({ sellerId, amount, description }) => {
    setAssigningCommissionLoading(true)
    try {
      await commissionsService.addSeller(contract._id, { sellerId, amount, description })
      setToast({ message: 'Vendedor agregado al contrato', type: 'success' })
      await loadCommission()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al agregar el vendedor'
      setToast({ message: msg, type: 'error' })
    } finally {
      setAssigningCommissionLoading(false)
    }
  }

  const handleUpdateSellerCommission = async (sellerId, { amount, description }) => {
    setAssigningCommissionLoading(true)
    try {
      await commissionsService.updateSeller(contract._id, sellerId, { amount, description })
      setToast({ message: 'Comisión actualizada', type: 'success' })
      await loadCommission()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar la comisión'
      setToast({ message: msg, type: 'error' })
    } finally {
      setAssigningCommissionLoading(false)
    }
  }

  const handleRemoveSellerCommission = async (sellerId) => {
    if (!window.confirm('¿Quitar a este vendedor de la comisión del contrato?')) return
    setAssigningCommissionLoading(true)
    try {
      await commissionsService.removeSeller(contract._id, sellerId)
      setToast({ message: 'Vendedor quitado del contrato', type: 'success' })
      await loadCommission()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al quitar al vendedor'
      setToast({ message: msg, type: 'error' })
    } finally {
      setAssigningCommissionLoading(false)
    }
  }

  const handleRegisterCommissionPayment = async (formData) => {
    if (!registeringCommissionPaymentFor) return
    setRegisteringCommissionPaymentLoading(true)
    try {
      const sellerId = registeringCommissionPaymentFor.sellerId
      const result = await commissionsService.registerPayment(contract._id, sellerId, {
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        reference: formData.reference,
        notes: formData.notes,
        paymentDate: formData.paymentDate
      })

      if (formData.files && formData.files.length > 0) {
        const fd = new FormData()
        formData.files.forEach(f => fd.append('vouchers', f))
        await commissionsService.uploadVouchers(contract._id, sellerId, result.data.movement._id, fd)
      }

      setToast({ message: 'Pago de comisión registrado', type: 'success' })
      setRegisteringCommissionPaymentFor(null)
      await loadCommission()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al registrar el pago de comisión'
      setToast({ message: msg, type: 'error' })
    } finally {
      setRegisteringCommissionPaymentLoading(false)
    }
  }

  const handleEditCommissionMovement = (commission, movement) => {
    setEditingCommissionMovement({ commission, movement })
  }

  const handleSubmitEditCommissionMovement = async (formData) => {
    if (!editingCommissionMovement) return
    const { commission, movement } = editingCommissionMovement
    setEditingCommissionMovementLoading(true)
    try {
      const { files, ...updates } = formData
      await commissionsService.updateMovement(commission.contractId, commission.sellerId, movement._id, {
        amount: Number(updates.amount),
        paymentMethod: updates.paymentMethod,
        reference: updates.reference,
        notes: updates.notes,
        paymentDate: updates.paymentDate
      })

      if (files && files.length > 0) {
        const fd = new FormData()
        files.forEach(f => fd.append('vouchers', f))
        await commissionsService.uploadVouchers(commission.contractId, commission.sellerId, movement._id, fd)
      }

      setToast({ message: 'Pago de comisión actualizado', type: 'success' })
      setEditingCommissionMovement(null)
      await loadCommission()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar el pago de comisión'
      setToast({ message: msg, type: 'error' })
    } finally {
      setEditingCommissionMovementLoading(false)
    }
  }

  const handleDeleteCommissionVoucher = async (fileName) => {
    if (!editingCommissionMovement) return
    const { commission, movement } = editingCommissionMovement
    setDeletingCommissionVoucher(fileName)
    try {
      await commissionsService.removeVoucher(commission.contractId, commission.sellerId, movement._id, fileName)
      setEditingCommissionMovement(prev => prev ? { ...prev, movement: { ...prev.movement, vouchers: (prev.movement.vouchers || []).filter(v => v.fileName !== fileName) } } : prev)
      setToast({ message: 'Comprobante eliminado', type: 'success' })
      await loadCommission()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al eliminar el comprobante'
      setToast({ message: msg, type: 'error' })
    } finally {
      setDeletingCommissionVoucher(null)
    }
  }

  const handleDeleteCommissionMovement = async (commission, movement) => {
    if (!window.confirm('¿Eliminar este pago de comisión? Esta acción no se puede deshacer.')) return
    setDeletingCommissionMovementId(movement._id)
    try {
      await commissionsService.removeMovement(commission.contractId, commission.sellerId, movement._id)
      setToast({ message: 'Pago de comisión eliminado', type: 'success' })
      await loadCommission()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al eliminar el pago de comisión'
      setToast({ message: msg, type: 'error' })
    } finally {
      setDeletingCommissionMovementId(null)
    }
  }

  const handleUploadFiles = async (newFiles) => {
    if (!newFiles?.length) return
    setFilesLoading(true)
    try {
      const res = await contractsService.uploadFiles(contract._id, newFiles)
      // El backend devuelve { filesAdded, files: [...nuevos] }
      const added = res?.data?.files || []
      setContractFiles(prev => [...prev, ...added])
      setToast({ message: `${added.length} archivo(s) subido(s)`, type: 'success' })
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al subir archivos'
      setToast({ message: msg, type: 'error' })
    } finally {
      setFilesLoading(false)
    }
  }

  const handleRemoveFile = async (fileName) => {
    if (!window.confirm('¿Eliminar este archivo permanentemente?')) return
    try {
      await contractsService.removeFile(contract._id, fileName)
      setContractFiles(prev => prev.filter(f => f.fileName !== fileName))
      setToast({ message: 'Archivo eliminado', type: 'success' })
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al eliminar archivo'
      setToast({ message: msg, type: 'error' })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex h-[90vh] items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4"
    > <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl animate-scaleIn overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {contract.contractNumber || 'Contrato'}
              </h2>
              <StatusBadge label={cStatus.label} color="#fff" bg={`${cStatus.color}44`} size="xs" />
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ background: `${modalityCfg.color}88` }}
                title={modalityCfg.description}
              >
                {contract.modality === 'milestones' ? <Hammer size={10} /> : <CalendarIcon size={10} />}
                {modalityCfg.shortLabel}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">Detalle completo del contrato</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">

            {canAssignCommission && !CLOSED_CONTRACT_STATUSES.includes(contract.status) && (
              <button
                onClick={() => setAssigningCommission(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                title="Gestionar comisiones"
              >
                <Percent size={13} />
                <span className="hidden sm:inline">Comisiones</span>
              </button>
            )}

            {canEdit && (
              <button
                onClick={() => onEdit(contract)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                title="Editar contrato"
              >
                <Pencil size={13} />
                <span className="hidden sm:inline">Editar</span>
              </button>
            )}

            <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
              <X size={20} />
            </button>
          </div>
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

          {/* Comisiones */}
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>Comisiones</p>

            {loadingCommission ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
              </div>
            ) : commissions.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sin comisiones asignadas</p>
            ) : (
              <div className="space-y-3">
                {commissions.map((c) => {
                  const commStatus = getCommissionStatusConfig(c.status)
                  return (
                    <div key={c._id || c.sellerId} className="p-3 rounded-lg bg-white border" style={{ borderColor: 'var(--color-border-light)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{c.sellerName || 'Vendedor'}</p>
                        <div className="flex items-center gap-2">
                          <StatusBadge label={commStatus.label} color={commStatus.color} bg={commStatus.bg} size="xs" />
                          {canRegisterCommissionPayment && c.balance > 0 && (
                            <button
                              onClick={() => setRegisteringCommissionPaymentFor(c)}
                              className="px-2.5 py-1 text-[11px] font-medium rounded-md text-white transition-colors hover:opacity-90"
                              style={{ background: 'var(--color-primary)' }}
                            >
                              Registrar pago
                            </button>
                          )}
                        </div>
                      </div>
                      {c.description && <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>{c.description}</p>}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Monto</p>
                          <DualPrice usd={c.amount} rate={contract.exchangeRate} size="sm" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Pagado</p>
                          <DualPrice usd={c.paidAmount} rate={contract.exchangeRate} size="sm" color="var(--color-success)" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Saldo</p>
                          <DualPrice usd={c.balance} rate={contract.exchangeRate} size="sm" color={c.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)'} />
                        </div>
                      </div>

                      {c.movements && c.movements.length > 0 && (
                        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                          <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                            Historial de pagos ({c.movements.length})
                          </p>
                          <div className="space-y-1">
                            {c.movements.map((m, mi) => (
                              <div key={m._id || mi} className="px-3 py-2 rounded-md text-xs" style={{ background: 'var(--color-surface)' }}>
                                <div className="flex items-center justify-between gap-2">
                                  <span style={{ color: 'var(--color-text-secondary)' }}>
                                    {getMethodLabel(m.paymentMethod)} {m.reference ? `· ${m.reference}` : ''}
                                  </span>
                                  <span className="font-bold" style={{ color: 'var(--color-success)' }}>{formatUSD(m.amount)}</span>
                                  <span style={{ color: 'var(--color-text-muted)' }}>{formatDateShort(m.paymentDate || m.registeredAt)}</span>
                                  {canEditCommissionPayment && (
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <button
                                        onClick={() => handleEditCommissionMovement(c, m)}
                                        className="p-1 rounded-md hover:bg-white transition-colors"
                                        title="Editar pago"
                                      >
                                        <Pencil size={12} style={{ color: 'var(--color-text-muted)' }} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCommissionMovement(c, m)}
                                        disabled={deletingCommissionMovementId === m._id}
                                        className="p-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                                        title="Eliminar pago"
                                      >
                                        {deletingCommissionMovementId === m._id
                                          ? <span className="block w-3 h-3 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                                          : <Trash2 size={12} style={{ color: 'var(--color-danger)' }} />}
                                      </button>
                                    </div>
                                  )}
                                </div>
                                {m.vouchers?.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-1.5 pt-1.5 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                                    {m.vouchers.map((v, vi) => (
                                      <a
                                        key={vi}
                                        href={`${serverBase}/uploads/commissions/${c.contractId}/${c.sellerId}/${v.fileName}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white transition-colors"
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
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Condiciones económicas */}
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>Condiciones Económicas</p>
              {contract.exchangeRate && (
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>TC del contrato</p>
                  <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                    {formatExchangeRate(contract.exchangeRate)} <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>· {formatExchangeRateDate(contract.exchangeRateDate)}</span>
                  </p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex items-start gap-3 py-2">
                <DollarSign size={15} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Precio de venta</p>
                  <DualPrice usd={contract.salePrice} rate={contract.exchangeRate} size="md" />
                </div>
              </div>
              <div className="flex items-start gap-3 py-2">
                <DollarSign size={15} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Enganche</p>
                  <DualPrice usd={contract.downPayment} rate={contract.exchangeRate} size="md" />
                </div>
              </div>
              {!isMilestonesContract && (
                <>
                  <div className="flex items-start gap-3 py-2">
                    <DollarSign size={15} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Mensualidad</p>
                      <DualPrice usd={contract.monthlyPayment} rate={contract.exchangeRate} size="md" />
                    </div>
                  </div>
                  <InfoRow icon={FileText} label="Total de pagos" value={contract.totalPayments || '—'} />
                </>
              )}
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

          {/* Documentación del contrato */}
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>
                Documentación
              </p>
              {filesLoading && (
                <div className="w-4 h-4 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
              )}
            </div>
            <FileUploadZone
              existingFiles={contractFiles}
              pendingFiles={[]}
              onAddPending={handleUploadFiles}
              onRemoveExisting={handleRemoveFile}
              serverBase={serverBase}
              contractId={contract._id}
              disabled={filesLoading}
            />
          </div>

          {/* SECCIÓN DE PAGOS */}
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-accent)' }}>
              Seguimiento de Pagos
            </p>

            {/* Timeline de hitos (solo Línea 2) */}
            {isMilestonesContract && milestonePayments.length > 0 && (
              <div className="mb-6">
                <MilestoneTimeline
                  milestones={milestonePayments}
                  exchangeRate={contract.exchangeRate}
                  canManage={true}
                  onComplete={(m) => setCompletingMilestone(m)}
                  onUncomplete={(m) => setUncompleteMilestone(m)}
                  onEditCommitment={(m) => setEditingCommitment(m)}
                />
              </div>
            )}

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
                      { label: 'Total', value: formatUSD(summary.totalExpected), mxn: convertToMXN(summary.totalExpected, contract.exchangeRate), icon: DollarSign, color: 'var(--color-primary)' },
                      { label: 'Cobrado', value: formatUSD(summary.totalPaid), mxn: convertToMXN(summary.totalPaid, contract.exchangeRate), icon: CheckCircle, color: 'var(--color-success)' },
                      { label: 'Pendiente', value: formatUSD(summary.totalBalance), mxn: convertToMXN(summary.totalBalance, contract.exchangeRate), icon: Clock, color: 'var(--color-warning)' },
                      { label: 'Vencidos', value: summary.overdueCount, mxn: null, icon: AlertTriangle, color: 'var(--color-danger)' },
                    ].map((s, i) => (
                      <div key={i} className="text-center p-3 rounded-lg bg-white border" style={{ borderColor: 'var(--color-border-light)' }}>
                        <s.icon size={16} className="mx-auto mb-1" style={{ color: s.color }} />
                        <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
                        {s.mxn !== null && contract.exchangeRate && (
                          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>≈ {formatMXN(s.mxn)}</p>
                        )}
                        <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
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
                        <div
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                          onClick={() => togglePayment(p._id)}
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
                              {p.isMilestone && (
                                <Hammer size={11} style={{ color: 'var(--color-accent)' }} />
                              )}
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

                          {/* Botón Registrar (solo si no está pagado) */}
                          {!isPaid && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setRegisteringPayment(p) }}
                              className="px-2.5 py-1 text-[11px] font-medium rounded-md text-white transition-colors hover:opacity-90 flex-shrink-0"
                              style={{ background: 'var(--color-primary)' }}
                            >
                              Registrar
                            </button>
                          )}

                          {/* Chevron */}
                          <div className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>

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
                            {p.lastExchangeRate && (
                              <div className="grid grid-cols-2 gap-4 mb-3 p-2 rounded-md" style={{ background: 'var(--color-accent-muted)' }}>
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Último TC usado</p>
                                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{formatExchangeRate(p.lastExchangeRate)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Fecha TC</p>
                                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{formatExchangeRateDate(p.lastExchangeRateDate)}</p>
                                </div>
                              </div>
                            )}

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
                                    <div key={mi} className="px-3 py-2 rounded-md bg-[var(--color-surface)] text-xs">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle size={12} style={{ color: 'var(--color-success)' }} />
                                          <span style={{ color: 'var(--color-text-secondary)' }}>
                                            {m.paymentMethod || 'Pago'} {m.reference ? `· ${m.reference}` : ''}
                                          </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                          <span className="font-bold" style={{ color: 'var(--color-success)' }}>{formatUSD(m.amount)}</span>
                                          {m.mxnEquivalent && (
                                            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>≈ {formatMXN(m.mxnEquivalent)}</span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                                        <span>{m.exchangeRate ? `TC: ${formatExchangeRate(m.exchangeRate)}` : ''}</span>
                                        <span>{formatDateShort(m.registeredAt)}</span>
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

      {/* Modal: gestionar comisiones */}
      <AssignCommissionModal
        isOpen={assigningCommission}
        onClose={() => setAssigningCommission(false)}
        contract={contract}
        commissions={commissions}
        availableSellers={allSellers.filter(s => !commissions.some(c => c.sellerId === s._id))}
        onAdd={handleAddSellerCommission}
        onUpdate={handleUpdateSellerCommission}
        onRemove={handleRemoveSellerCommission}
        loading={assigningCommissionLoading}
      />

      {/* Modal: registrar pago de comisión */}
      <RegisterCommissionPaymentModal
        isOpen={!!registeringCommissionPaymentFor}
        onClose={() => setRegisteringCommissionPaymentFor(null)}
        onSubmit={handleRegisterCommissionPayment}
        commission={registeringCommissionPaymentFor}
        loading={registeringCommissionPaymentLoading}
      />

      {/* Modal: editar pago de comisión */}
      <EditCommissionPaymentModal
        isOpen={!!editingCommissionMovement}
        onClose={() => setEditingCommissionMovement(null)}
        onSubmit={handleSubmitEditCommissionMovement}
        commission={editingCommissionMovement?.commission}
        movement={editingCommissionMovement?.movement}
        loading={editingCommissionMovementLoading}
        onDeleteVoucher={handleDeleteCommissionVoucher}
        deletingVoucher={deletingCommissionVoucher}
      />

      {/* Modal: registrar pago */}
      <RegisterPaymentModal
        isOpen={!!registeringPayment}
        onClose={() => setRegisteringPayment(null)}
        onSubmit={handleRegisterPayment}
        payment={registeringPayment}
        loading={registerLoading}
      />

      {/* Modal: completar hito */}
      <CompleteMilestoneModal
        isOpen={!!completingMilestone}
        onClose={() => setCompletingMilestone(null)}
        onConfirm={handleCompleteMilestone}
        milestone={completingMilestone}
        loading={completingLoading}
      />

      {/* Modal: editar fecha compromiso */}
      <CompleteMilestoneModal
        isOpen={!!editingCommitment}
        onClose={() => setEditingCommitment(null)}
        onConfirm={handleEditCommitment}
        milestone={editingCommitment}
        loading={editingCommitmentLoading}
        mode="editCommitment"
      />

      {/* Confirm: revertir hito */}
      <ConfirmDialog
        isOpen={!!uncompleteMilestone}
        onClose={() => setUncompleteMilestone(null)}
        onConfirm={handleUncompleteMilestone}
        title="Revertir hito"
        message={`¿Confirmas revertir el hito "${uncompleteMilestone?.milestoneName || ''}" a pendiente? Solo es posible si no se han registrado pagos.`}
        confirmText="Revertir"
        variant="warning"
      />

      {/* Toast local */}
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

export default ContractDetail
