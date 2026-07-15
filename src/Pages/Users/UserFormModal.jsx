import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Shield, Eye, EyeOff } from 'lucide-react'
import { ROLES } from '@/utils/roles'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  role: 'vendedor',
  password: '',
  active: true,
}

const UserFormModal = ({ isOpen, onClose, onSubmit, user, loading }) => {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const isEditing = !!user

  useLockBodyScroll(isOpen)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'vendedor',
        password: '',
        active: user.active !== undefined ? user.active : true,
      })
    } else {
      setForm(initialForm)
    }
    setErrors({})
    setShowPassword(false)
  }, [user, isOpen])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'El nombre es requerido'
    if (!form.email.trim()) errs.email = 'El correo es requerido'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Correo no válido'
    if (!isEditing && !form.password) errs.password = 'La contraseña es requerida'
    if (form.password && form.password.length < 6) errs.password = 'Mínimo 6 caracteres'
    if (!form.role) errs.role = 'Selecciona un rol'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const payload = { ...form }
    if (isEditing && !payload.password) delete payload.password
    onSubmit(payload)
  }

  if (!isOpen) return null

  const fieldClass = (name) => `
    w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]
    ${errors[name] ? 'border-red-300 bg-red-50/50' : 'border-[var(--color-border)] bg-white hover:border-gray-300'}
  `

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-overlayIn"
      style={{ background: 'rgba(15,36,56,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scaleIn overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
        >
          <div>
            <h2
              className="text-lg font-semibold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {isEditing ? 'Modifica los datos del usuario' : 'Completa los datos para registrar'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Nombre completo <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                className={fieldClass('name')}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Correo electrónico <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className={fieldClass('email')}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Teléfono
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="55 1234 5678"
                className={fieldClass('phone')}
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Rol <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className={fieldClass('role')}
              >
                <option value="">Seleccionar rol...</option>
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Contraseña {!isEditing && <span className="text-red-400">*</span>}
              {isEditing && <span className="text-gray-400 normal-case tracking-normal font-normal"> (dejar vacío para no cambiar)</span>}
            </label>
            <div className="relative">
              <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={isEditing ? '••••••••' : 'Mínimo 6 caracteres'}
                className={`${fieldClass('password')} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between pt-2 pb-1">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Estado activo</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>El usuario puede acceder al sistema</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-10 h-[22px] bg-gray-200 peer-focus:ring-2 peer-focus:ring-[var(--color-accent)]/30 rounded-full peer peer-checked:bg-[var(--color-success)] transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-[18px] after:shadow-sm" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium rounded-lg border transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium rounded-lg text-white transition-all hover:shadow-md disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : isEditing ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserFormModal
