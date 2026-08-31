import apiServices, { withConfirm } from '@/api/apiServices'

const contractsService = {

  async getAll(filters = {}) {
    const params = new URLSearchParams()
    if (filters.projectId) params.append('projectId', filters.projectId)
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    const query = params.toString()
    const { data } = await apiServices.get(`/contracts${query ? `?${query}` : ''}`)
    return data
  },

  async getById(id) {
    const { data } = await apiServices.get(`/contracts/${id}`)
    return data
  },

  async create(contractData) {
    const { data } = await apiServices.post('/contracts', contractData)
    return data
  },

  async update(id, contractData) {
    const { data } = await apiServices.patch(`/contracts/${id}`, contractData)
    return data
  },

  async regenerateSchedule(contractId) {
    // Re-genera el calendario de pagos del contrato (al cambiar modalidad o hitos)
    const { data } = await apiServices.post(`/payments/generate/${contractId}`)
    return data
  },

  // Baja del contrato con cascada (pagos, comisiones y liberación de la unidad).
  // Requiere la contraseña del admin como autorización (step-up auth).
  async delete(id, password) {
    const { data } = await apiServices.delete(`/contracts/${id}`, withConfirm(password))
    return data
  },

  async uploadFiles(contractId, files) {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))

  const { data } = await apiServices.post(
    `/contracts/${contractId}/files`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
  },

  async removeFile(contractId, fileName) {
    const { data } = await apiServices.delete(`/contracts/${contractId}/files/${fileName}`)
    return data
  }
}

export default contractsService
