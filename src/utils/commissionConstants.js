export const COMMISSION_STATUS = [
  { value: 'pendiente', label: 'Pendiente', color: '#6B7280', bg: '#6B72801A' },
  { value: 'parcial', label: 'Parcial', color: '#D97706', bg: '#D977061A' },
  { value: 'pagado', label: 'Pagado', color: '#059669', bg: '#0596691A' },
]

export const getCommissionStatusConfig = (status) => {
  return COMMISSION_STATUS.find(s => s.value === status) || { value: status, label: status || 'Sin asignar', color: '#6B7280', bg: '#6B72801A' }
}
