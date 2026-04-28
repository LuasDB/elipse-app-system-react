export const CONTRACT_STATUS = [
  { value: 'promesa', label: 'Promesa', color: '#D97706', bg: '#D977061A' },
  { value: 'definitivo', label: 'Definitivo', color: '#2563EB', bg: '#2563EB1A' },
  { value: 'escriturado', label: 'Escriturado', color: '#7C3AED', bg: '#7C3AED1A' },
  { value: 'entregado', label: 'Entregado', color: '#059669', bg: '#0596691A' },
  { value: 'cancelado', label: 'Cancelado', color: '#DC2626', bg: '#DC26261A' },
]

export const PAYMENT_SCHEMES = [
  { value: 'contado', label: 'Contado' },
  { value: 'enganche_mensualidades', label: 'Enganche + Mensualidades' },
  { value: 'credito_bancario', label: 'Crédito Bancario' },
  { value: 'credito_directo', label: 'Crédito Directo' },
  { value: 'otro', label: 'Otro' },
]

// Modalidad del contrato (línea de seguimiento)
export const CONTRACT_MODALITIES = [
  {
    value: 'monthly',
    label: 'Por mensualidades',
    shortLabel: 'Mensualidades',
    description: 'Enganche + N mensualidades a tiempo',
    color: '#2563EB',
    bg: '#2563EB1A'
  },
  {
    value: 'milestones',
    label: 'Por avance de obra',
    shortLabel: 'Avance de obra',
    description: 'Pagos atados a hitos de construcción',
    color: '#C8A45A',
    bg: '#C8A45A1A'
  },
]

export const getModalityConfig = (modality) => {
  return CONTRACT_MODALITIES.find(m => m.value === modality) || CONTRACT_MODALITIES[0]
}

// Estados de hitos (Línea 2)
export const MILESTONE_STATUS = [
  { value: 'pendiente', label: 'Pendiente', color: '#6B7280', bg: '#6B72801A' },
  { value: 'completado', label: 'Completado', color: '#059669', bg: '#0596691A' },
]