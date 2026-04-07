import apiServices from '@/api/apiServices'

const unitsService = {

  async getByProject(projectId, filters = {}) {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.type) params.append('type', filters.type)
    if (filters.search) params.append('search', filters.search)
    const query = params.toString()
    const { data } = await apiServices.get(`/units/project/${projectId}${query ? `?${query}` : ''}`)
    return data
  },

  async getById(id) {
    const { data } = await apiServices.get(`/units/${id}`)
    return data
  },

  async create(unitData) {
    const { data } = await apiServices.post('/units', unitData)
    return data
  },

  async update(id, unitData) {
    const { data } = await apiServices.patch(`/units/${id}`, unitData)
    return data
  },

  async delete(id) {
    const { data } = await apiServices.delete(`/units/${id}`)
    return data
  }
}

export default unitsService
