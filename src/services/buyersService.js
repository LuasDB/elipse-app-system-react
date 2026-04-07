import apiServices from '@/api/apiServices'

const buyersService = {

  async getAll(filters = {}) {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    const query = params.toString()
    const { data } = await apiServices.get(`/buyers${query ? `?${query}` : ''}`)
    return data
  },

  async getById(id) {
    const { data } = await apiServices.get(`/buyers/${id}`)
    return data
  },

  async create(buyerData) {
    const { data } = await apiServices.post('/buyers', buyerData)
    return data
  },

  async update(id, buyerData) {
    const { data } = await apiServices.patch(`/buyers/${id}`, buyerData)
    return data
  },

  async delete(id) {
    const { data } = await apiServices.delete(`/buyers/${id}`)
    return data
  }
}

export default buyersService
