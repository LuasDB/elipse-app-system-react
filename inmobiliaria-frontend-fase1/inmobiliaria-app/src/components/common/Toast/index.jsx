import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
}

const styles = {
  success: { bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: '#05966933' },
  error: { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '#DC262633' },
  warning: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: '#D9770633' },
}

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const Icon = icons[type]
  const s = styles[type]

  return (
    <div className="fixed top-6 right-6 z-[100] animate-fadeIn">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm"
        style={{ background: s.bg, borderColor: s.border }}
      >
        <Icon size={18} style={{ color: s.color }} className="flex-shrink-0" />
        <p className="text-sm font-medium flex-1" style={{ color: s.color }}>{message}</p>
        <button onClick={onClose} className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
          <X size={14} style={{ color: s.color }} />
        </button>
      </div>
    </div>
  )
}

export default Toast
