import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ShieldAlert, Eye, EyeOff } from 'lucide-react'
import useLockBodyScroll from '@/hooks/useLockBodyScroll'

/**
 * Diálogo de re-autenticación para acciones sensibles (bajas en cascada,
 * reversión de pagos, ediciones fuera del flujo normal).
 *
 * `onConfirm(password)` debe ser async y LANZAR un Error si la autorización
 * falla: el diálogo se queda abierto y muestra el mensaje. Si resuelve, el
 * componente padre es responsable de cerrarlo.
 *
 * Debe montarse condicionalmente (`{open && <PasswordConfirmDialog .../>}`) para
 * que cada apertura arranque con el estado limpio.
 */
const PasswordConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirma tu identidad',
  message = 'Esta acción es sensible. Ingresa tu contraseña para autorizarla.',
  warning,
  confirmText = 'Autorizar y continuar',
  loadingText = 'Verificando...',
}) => {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useLockBodyScroll(isOpen)

  if (!isOpen) return null

  const submit = async (e) => {
    e?.preventDefault()
    if (!password) {
      setError('Ingresa tu contraseña')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onConfirm(password)
      // Éxito: el padre desmonta el diálogo. Se deja `loading` en true para
      // evitar un doble envío en el parpadeo previo al cierre.
    } catch (err) {
      setError(err?.message || 'No se pudo autorizar la acción')
      setLoading(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-overlayIn"
      style={{ background: 'rgba(15,36,56,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <form onSubmit={submit} className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-scaleIn">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-danger-bg)' }}
          >
            <ShieldAlert size={20} style={{ color: 'var(--color-danger)' }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
          </div>
        </div>

        {warning && (
          <p
            className="text-sm mt-3 px-3 py-2 rounded-lg"
            style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}
          >
            {warning}
          </p>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
            Contraseña
          </label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              autoFocus
              autoComplete="current-password"
              disabled={loading}
              className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: error ? 'var(--color-danger)' : 'var(--color-border)' }}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="text-sm mt-1" style={{ color: 'var(--color-danger)' }}>{error}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !password}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--color-danger)' }}
          >
            {loading ? loadingText : confirmText}
          </button>
        </div>
      </form>
    </div>,
    document.body
  )
}

export default PasswordConfirmDialog
