import { AlertTriangle } from 'lucide-react'

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-overlayIn" style={{ background: 'rgba(15,36,56,0.45)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-scaleIn">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-danger-bg)' }}>
            <AlertTriangle size={20} style={{ color: 'var(--color-danger)' }} />
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
            style={{ background: 'var(--color-danger)' }}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
