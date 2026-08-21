import apiServices from '@/api/apiServices'

const sellersService = {

  async getAll() {
    const { data } = await apiServices.get('/sellers')
    return data
  },

  async getById(id) {
    const { data } = await apiServices.get(`/sellers/${id}`)
    return data
  },

  async getAttachments(id) {
    const { data } = await apiServices.get(`/sellers/${id}/attachments`)
    return data
  },

  async uploadAttachments(id, files) {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    const { data } = await apiServices.post(
      `/sellers/${id}/attachments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data
  },

  async deleteAttachment(id, attachmentId) {
    const { data } = await apiServices.delete(`/sellers/${id}/attachments/${attachmentId}`)
    return data
  },

  async getAuditLog(id) {
    const { data } = await apiServices.get(`/sellers/${id}/audit`)
    return data
  }
}

export default sellersService
