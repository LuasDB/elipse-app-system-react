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
  { value: 'avance_obra', label: 'Avance de obra' },
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

// Semáforo de hitos
export const MILESTONE_TRAFFIC = {
  red: {
    value: 'red',
    label: 'Vencido',
    color: '#DC2626',
    bg: '#DC26261A',
    dotColor: '#DC2626',
    description: 'La fecha compromiso ya pasó'
  },
  yellow: {
    value: 'yellow',
    label: 'Por vencer',
    color: '#D97706',
    bg: '#D977061A',
    dotColor: '#D97706',
    description: 'Vence en los próximos 15 días'
  },
  green: {
    value: 'green',
    label: 'A tiempo',
    color: '#059669',
    bg: '#0596691A',
    dotColor: '#059669',
    description: 'Más de 15 días para la fecha compromiso'
  },
  delivered: {
    value: 'delivered',
    label: 'Entregado',
    color: '#7C3AED',
    bg: '#7C3AED1A',
    dotColor: '#7C3AED',
    description: 'Hito completado'
  }
}

/**
 * Calcula el color de semáforo para un hito según su fecha compromiso.
 * - Si está completado → 'delivered'
 * - Si no tiene fecha → 'green' (default)
 * - Si fecha pasada → 'red'
 * - Si fecha en próximos 15 días → 'yellow'
 * - Si fecha > 15 días → 'green'
 */
export const getMilestoneTrafficLight = (milestone) => {
  if (!milestone) return MILESTONE_TRAFFIC.green
  if (milestone.milestoneStatus === 'completado') return MILESTONE_TRAFFIC.delivered
  if (!milestone.commitmentDate) return MILESTONE_TRAFFIC.green

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const commitment = new Date(milestone.commitmentDate)
  commitment.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((commitment - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return MILESTONE_TRAFFIC.red
  if (diffDays <= 15) return MILESTONE_TRAFFIC.yellow
  return MILESTONE_TRAFFIC.green
}

// Campos cuya edición dispara regeneración del calendario de pagos
export const CRITICAL_CONTRACT_FIELDS = [
  'modality',
  'salePrice',
  'downPayment',
  'monthlyPayment',
  'totalPayments',
  'milestonesTemplate',
  'signDate',
  'promiseDate'
]

// Campos que NO se pueden modificar después de creado (integridad referencial)
export const LOCKED_CONTRACT_FIELDS = [
  'projectId',
  'unitId',
  'buyerId'
]