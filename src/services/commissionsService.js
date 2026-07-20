import apiServices from '@/api/apiServices'

const commissionsService = {

  async assign(contractId, commissionData) {
    const { data } = await apiServices.patch(`/commissions/contract/${contractId}`, commissionData)
    return data
  },

  async getByContract(contractId) {
    const { data } = await apiServices.get(`/commissions/contract/${contractId}`)
    return data
  },

  async registerPayment(contractId, paymentData) {
    const { data } = await apiServices.post(`/commissions/contract/${contractId}/payments`, paymentData)
    return data
  },

  async uploadVouchers(contractId, movementId, filesOrFormData) {
    let formData
    if (filesOrFormData instanceof FormData) {
      formData = filesOrFormData
    } else {
      formData = new FormData()
      filesOrFormData.forEach(file => formData.append('vouchers', file))
    }

    const { data } = await apiServices.post(
      `/commissions/contract/${contractId}/payments/${movementId}/vouchers`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data
  },

  async removeVoucher(contractId, movementId, fileName) {
    const { data } = await apiServices.delete(`/commissions/contract/${contractId}/payments/${movementId}/vouchers/${fileName}`)
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
