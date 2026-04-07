export const PROJECT_TYPES = [
  { value: 'residencial_horizontal', label: 'Residencial Horizontal' },
  { value: 'residencial_vertical', label: 'Residencial Vertical' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'mixto', label: 'Mixto' },
  { value: 'uso_suelo', label: 'Uso de Suelo' },
]

export const PROJECT_STATUS = [
  { value: 'en_planeacion', label: 'En Planeación', color: '#6B7280', bg: '#6B72801A' },
  { value: 'en_preventa', label: 'En Preventa', color: '#7C3AED', bg: '#7C3AED1A' },
  { value: 'en_venta', label: 'En Venta', color: '#2563EB', bg: '#2563EB1A' },
  { value: 'en_construccion', label: 'En Construcción', color: '#D97706', bg: '#D977061A' },
  { value: 'entregado', label: 'Entregado', color: '#059669', bg: '#0596691A' },
  { value: 'cancelado', label: 'Cancelado', color: '#DC2626', bg: '#DC26261A' },
]

export const UNIT_TYPES = [
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'loft', label: 'Loft' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'local_comercial', label: 'Local Comercial' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'bodega', label: 'Bodega' },
]

export const UNIT_STATUS = [
  { value: 'disponible', label: 'Disponible', color: '#059669', bg: '#0596691A' },
  { value: 'apartada', label: 'Apartada', color: '#D97706', bg: '#D977061A' },
  { value: 'en_escrituracion', label: 'En Escrituración', color: '#7C3AED', bg: '#7C3AED1A' },
  { value: 'vendida', label: 'Vendida', color: '#2563EB', bg: '#2563EB1A' },
  { value: 'entregada', label: 'Entregada', color: '#1B3A5C', bg: '#1B3A5C1A' },
  { value: 'cancelada', label: 'Cancelada', color: '#DC2626', bg: '#DC26261A' },
]

export const ORIENTATIONS = [
  { value: 'norte', label: 'Norte' },
  { value: 'sur', label: 'Sur' },
  { value: 'este', label: 'Este' },
  { value: 'oeste', label: 'Oeste' },
  { value: 'noreste', label: 'Noreste' },
  { value: 'noroeste', label: 'Noroeste' },
  { value: 'sureste', label: 'Sureste' },
  { value: 'suroeste', label: 'Suroeste' },
]

export const getStatusConfig = (statusList, value) => {
  return statusList.find(s => s.value === value) || { value, label: value, color: '#6B7280', bg: '#6B72801A' }
}
