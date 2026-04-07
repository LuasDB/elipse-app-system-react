import { X, Building2, Home, User, DollarSign, Calendar, FileText, Phone, Mail, MapPin } from 'lucide-react'
import StatusBadge from '@/components/common/StatusBadge'
import { CONTRACT_STATUS, PAYMENT_SCHEMES } from '@/utils/contractConstants'
import { getStatusConfig } from '@/utils/projectConstants'

const formatPrice = (n) => n ? `$${Number(n).toLocaleString('es-MX')}` : '—'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2">
    <Icon size={15} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
    <div>
      <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{value || '—'}</p>
    </div>
  </div>
)

const ContractDetail = ({ contract, onClose }) => {
  if (!contract) return null

  const cStatus = getStatusConfig(CONTRACT_STATUS, contract.status)
  const scheme = PAYMENT_SCHEMES.find(p => p.value === contract.paymentScheme)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-overlayIn" style={{ background: 'rgba(15,36,56,0.45)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl animate-scaleIn overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {contract.contractNumber || 'Contrato'}
              </h2>
              <StatusBadge label={cStatus.label} color="#fff" bg={`${cStatus.color}44`} size="xs" />
            </div>
            <p className="text-xs text-slate-300 mt-0.5">Detalle del contrato de compraventa</p>
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

          {/* Notas */}
          {contract.notes && (
            <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-accent)' }}>Observaciones</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{contract.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end border-t" style={{ borderColor: 'var(--color-border-light)' }}>
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors">Cerrar</button>
        </div>
      </div>
    </div>
  )
}

export default ContractDetail
