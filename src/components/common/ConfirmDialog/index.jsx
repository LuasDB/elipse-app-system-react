import { AlertTriangle, HelpCircle } from 'lucide-react'
import useLockBodyScroll from '@/hooks/useLockBodyScroll'

const VARIANTS = {
  danger: { iconBg: 'var(--color-danger-bg)', iconColor: 'var(--color-danger)', btnBg: 'var(--color-danger)', Icon: AlertTriangle },
  warning: { iconBg: 'var(--color-warning-bg)', iconColor: 'var(--color-warning)', btnBg: 'var(--color-warning)', Icon: AlertTriangle },
  primary: { iconBg: 'var(--color-accent-muted)', iconColor: 'var(--color-primary)', btnBg: 'var(--color-primary)', Icon: HelpCircle }
}

const ConfirmDialog = ({
  isOpen, onClose, onConfirm, title, message, loading,
  confirmText = 'Eliminar', loadingText, variant = 'danger'
}) => {
  useLockBodyScroll(isOpen)
  if (!isOpen) return null

  const v = VARIANTS[variant] || VARIANTS.danger
  const { Icon } = v

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-overlayIn" style={{ background: 'rgba(15,36,56,0.45)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-scaleIn">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: v.iconBg }}>
            <Icon size={20} style={{ color: v.iconColor }} />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: v.btnBg }}
          >
            {loading ? (loadingText || `${confirmText}...`) : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
