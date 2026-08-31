import apiServices, { withConfirm } from '@/api/apiServices'

const commissionsService = {

  async getByContract(contractId) {
    const { data } = await apiServices.get(`/commissions/contract/${contractId}`)
    return data
  },

  async addSeller(contractId, commissionData) {
    const { data } = await apiServices.post(`/commissions/contract/${contractId}/sellers`, commissionData)
    return data
  },

  async updateSeller(contractId, sellerId, commissionData) {
    const { data } = await apiServices.patch(`/commissions/contract/${contractId}/sellers/${sellerId}`, commissionData)
    return data
  },

  // Requiere la contraseña del admin (step-up auth). Con ella se permite incluso
  // si el vendedor ya tiene pagos de comisión registrados.
  async removeSeller(contractId, sellerId, password) {
    const { data } = await apiServices.delete(`/commissions/contract/${contractId}/sellers/${sellerId}`, withConfirm(password))
    return data
  },

  async registerPayment(contractId, sellerId, paymentData) {
    const { data } = await apiServices.post(`/commissions/contract/${contractId}/sellers/${sellerId}/payments`, paymentData)
    return data
  },

  async uploadVouchers(contractId, sellerId, movementId, filesOrFormData) {
    let formData
    if (filesOrFormData instanceof FormData) {
      formData = filesOrFormData
    } else {
      formData = new FormData()
      filesOrFormData.forEach(file => formData.append('vouchers', file))
    }

    const { data } = await apiServices.post(
      `/commissions/contract/${contractId}/sellers/${sellerId}/payments/${movementId}/vouchers`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data
  },

  async removeVoucher(contractId, sellerId, movementId, fileName) {
    const { data } = await apiServices.delete(`/commissions/contract/${contractId}/sellers/${sellerId}/payments/${movementId}/vouchers/${fileName}`)
    return data
  },

  async updateMovement(contractId, sellerId, movementId, updates) {
    const { data } = await apiServices.patch(`/commissions/contract/${contractId}/sellers/${sellerId}/payments/${movementId}`, updates)
    return data
  },

  // Requiere la contraseña del admin (step-up auth).
  async removeMovement(contractId, sellerId, movementId, password) {
    const { data } = await apiServices.delete(`/commissions/contract/${contractId}/sellers/${sellerId}/payments/${movementId}`, withConfirm(password))
    return data
  },

  async getBySeller(sellerId) {
    const { data } = await apiServices.get(`/commissions/seller/${sellerId}`)
    return data
  },

  async getSellerSummary(sellerId) {
    const { data } = await apiServices.get(`/commissions/seller/${sellerId}/summary`)
    return data
  },

  async getSummary() {
    const { data } = await apiServices.get('/commissions/summary')
    return data
  }
}

export default commissionsService
