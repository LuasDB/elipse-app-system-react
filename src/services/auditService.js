import apiServices from '@/api/apiServices'

// Bitácora de auditoría — todos los endpoints son solo para el rol admin.
const auditService = {
  // Bitácora global con filtros y paginación.
  // params: { entity, entityId, actorId, action, from, to, search, page, limit }
  async list(params = {}) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') qs.append(key, value)
    })
    const query = qs.toString()
    const { data } = await apiServices.get(`/audit${query ? `?${query}` : ''}`)
    return data
  },

  // Valores disponibles para poblar los filtros (acciones, módulos, usuarios).
  async options() {
    const { data } = await apiServices.get('/audit/options')
    return data
  },

  // Historial de un registro concreto: byEntity('contract', id, { limit, skip })
  // Devuelve { success, message, data: { items, total, limit, skip } }
  async byEntity(entity, id, params = {}) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') qs.append(key, value)
    })
    const query = qs.toString()
    const { data } = await apiServices.get(`/audit/${entity}/${id}${query ? `?${query}` : ''}`)
    return data
  },
}

export default auditService
