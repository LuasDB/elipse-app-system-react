export const ROLES = [
  { value: 'admin', label: 'Administrador', color: '#C8A45A', bg: '#C8A45A1A' },
  { value: 'gerente', label: 'Gerente de Ventas', color: '#7C3AED', bg: '#7C3AED1A' },
  { value: 'vendedor', label: 'Vendedor', color: '#2563EB', bg: '#2563EB1A' },
  { value: 'cobranza', label: 'Cobranza', color: '#059669', bg: '#0596691A' },
]

export const getRoleConfig = (role) => {
  return ROLES.find(r => r.value === role) || { value: role, label: role, color: '#6B7280', bg: '#6B72801A' }
}
