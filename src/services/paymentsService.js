import apiServices from '@/api/apiServices'

const paymentsService = {

  async getAlerts() {
    const { data } = await apiServices.get('/payments/alerts')
    return data
  },

  async getCollectionsByPeriod(startDate, endDate) {
    const params = new URLSearchParams()
    params.append('startDate', startDate)
    params.append('endDate', endDate)
    const { data } = await apiServices.get(`/payments/collections-by-period?${params.toString()}`)
    return data
  },

  async completeMilestone(paymentId, data = {}) {
    const { data: response } = await apiServices.patch(`/payments/${paymentId}/milestone/complete`, data)
    return response
  },

  async uncompleteMilestone(paymentId) {
    const { data: response } = await apiServices.patch(`/payments/${paymentId}/milestone/uncomplete`, {})
    return response
  },

  async getByContract(contractId) {
    const { data } = await apiServices.get(`/payments/contract/${contractId}`)
    return data
  },

  async getSummary(contractId) {
    const { data } = await apiServices.get(`/payments/summary/${contractId}`)
    return data
  },

  async generateSchedule(contractId) {
    const { data } = await apiServices.post(`/payments/generate/${contractId}`)
    return data
  },

  async registerPayment(paymentId, paymentData) {
    const { data } = await apiServices.post(`/payments/register/${paymentId}`, paymentData)
    return data
  },

  async update(paymentId, paymentData) {
    const { data } = await apiServices.patch(`/payments/${paymentId}`, paymentData)
    return data
  },

  async getAuditLog(paymentId) {
    const { data } = await apiServices.get(`/payments/${paymentId}/audit`)
    return data
  },

  async delete(id) {
    const { data } = await apiServices.delete(`/payments/${id}`)
    return data
  },

  async deleteByContract(contractId) {
    const { data } = await apiServices.delete(`/payments/contract/${contractId}`)
    return data
  },

  async uploadVouchers(paymentId, filesOrFormData) {
    let formData
    if (filesOrFormData instanceof FormData) {
      formData = filesOrFormData
    } else {
      formData = new FormData()
      filesOrFormData.forEach(file => formData.append('vouchers', file))
    }

    const { data } = await apiServices.post(
      `/payments/${paymentId}/vouchers`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data
  },

  async removeVoucher(paymentId, fileName) {
    const { data } = await apiServices.delete(`/payments/${paymentId}/vouchers/${fileName}`)
    return data
  },
  async updateMilestoneCommitment(paymentId, data = {}) {
    const { data: response } = await apiServices.patch(`/payments/${paymentId}/milestone/commitment`, data)
    return response
  },
  async getOpenContractsByProject(projectId) {
    const { data } = await apiServices.get(`/payments/by-project/${projectId}`)
    return data
  },
}

export default paymentsService