// Etiquetas y estilos para la bitácora de auditoría.

// Módulo / entidad
export const AUDIT_ENTITIES = {
  contract: { label: 'Contrato', plural: 'Contratos' },
  payment: { label: 'Pago', plural: 'Pagos' },
  commission: { label: 'Comisión', plural: 'Comisiones' },
  seller: { label: 'Vendedor', plural: 'Vendedores' },
  buyer: { label: 'Comprador', plural: 'Compradores' },
  project: { label: 'Proyecto', plural: 'Proyectos' },
  unit: { label: 'Unidad', plural: 'Unidades' },
  user: { label: 'Usuario', plural: 'Usuarios' },
}

export const getEntityConfig = (entity) =>
  AUDIT_ENTITIES[entity] || { label: entity || '—', plural: entity || '—' }

// Tipo de acción → etiqueta + color semántico
// kind: 'create' | 'update' | 'delete' | 'file' | 'money' | 'neutral'
const KIND_STYLE = {
  create: { color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  update: { color: 'var(--color-info)', bg: 'var(--color-info-bg)' },
  delete: { color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
  file: { color: 'var(--color-text-secondary)', bg: 'var(--color-surface-sunken)' },
  money: { color: 'var(--color-accent)', bg: 'var(--color-accent-muted)' },
  neutral: { color: 'var(--color-text-secondary)', bg: 'var(--color-surface-sunken)' },
}

export const AUDIT_ACTIONS = {
  created: { label: 'Creación', kind: 'create' },
  updated: { label: 'Edición', kind: 'update' },
  deleted: { label: 'Eliminación', kind: 'delete' },

  schedule_generated: { label: 'Calendario generado', kind: 'neutral' },
  schedule_partially_regenerated: { label: 'Calendario regenerado (parcial)', kind: 'neutral' },
  payments_deleted: { label: 'Pagos eliminados (masivo)', kind: 'delete' },

  payment_registered: { label: 'Pago registrado', kind: 'money' },
  payment_updated: { label: 'Pago editado', kind: 'update' },

  voucher_added: { label: 'Comprobante agregado', kind: 'file' },
  voucher_removed: { label: 'Comprobante eliminado', kind: 'file' },
  file_added: { label: 'Archivo agregado', kind: 'file' },
  file_removed: { label: 'Archivo eliminado', kind: 'file' },
  attachment_added: { label: 'Documento agregado', kind: 'file' },
  attachment_deleted: { label: 'Documento eliminado', kind: 'file' },

  milestone_completed: { label: 'Hito completado', kind: 'update' },
  milestone_uncompleted: { label: 'Hito revertido', kind: 'update' },
  milestone_commitment_updated: { label: 'Fecha compromiso editada', kind: 'update' },

  commission_assigned: { label: 'Comisión asignada', kind: 'create' },
  commission_updated: { label: 'Comisión editada', kind: 'update' },
  commission_removed: { label: 'Comisión eliminada', kind: 'delete' },
  commission_payment_registered: { label: 'Pago de comisión registrado', kind: 'money' },
  commission_payment_updated: { label: 'Pago de comisión editado', kind: 'update' },
  commission_payment_removed: { label: 'Pago de comisión eliminado', kind: 'delete' },
  commission_voucher_added: { label: 'Comprobante de comisión agregado', kind: 'file' },
  commission_voucher_removed: { label: 'Comprobante de comisión eliminado', kind: 'file' },

  // Registros anteriores a la unificación (compatibilidad)
  movement_updated: { label: 'Pago de comisión editado', kind: 'update' },
  movement_removed: { label: 'Pago de comisión eliminado', kind: 'delete' },
}

export const getActionConfig = (action) => {
  const base = AUDIT_ACTIONS[action] || { label: action || '—', kind: 'neutral' }
  return { ...base, ...KIND_STYLE[base.kind] }
}

// Nombres legibles para los campos que aparecen en los diffs
export const FIELD_LABELS = {
  salePrice: 'Precio de venta',
  downPayment: 'Enganche',
  monthlyPayment: 'Mensualidad',
  totalPayments: 'Plazo (meses)',
  exchangeRate: 'Tipo de cambio',
  exchangeRateDate: 'Fecha del TC',
  status: 'Estatus',
  modality: 'Modalidad',
  notes: 'Observaciones',
  concept: 'Concepto',
  expectedAmount: 'Monto esperado',
  paidAmount: 'Monto pagado',
  balance: 'Saldo',
  dueDate: 'Fecha de vencimiento',
  paidDate: 'Fecha de pago',
  paymentMethod: 'Método de pago',
  reference: 'Referencia',
  amount: 'Monto',
  description: 'Descripción',
  commitmentDate: 'Fecha compromiso',
  milestoneStatus: 'Estatus del hito',
  milestoneNotes: 'Notas del hito',
  name: 'Nombre',
  email: 'Correo',
  phone: 'Teléfono',
  rfc: 'RFC',
  role: 'Rol',
  active: 'Activo',
  address: 'Dirección',
  city: 'Ciudad',
  colony: 'Colonia',
  identifier: 'Identificador',
  listPrice: 'Precio de lista',
  finalPrice: 'Precio final',
  password: 'Contraseña',
}

export const getFieldLabel = (field) => FIELD_LABELS[field] || field
