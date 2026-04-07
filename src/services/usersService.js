import apiServices from '@/api/apiServices'

const usersService = {

  async getAll(filters = {}) {
    const params = new URLSearchParams()
    if (filters.role) params.append('role', filters.role)
    if (filters.active !== undefined) params.append('active', filters.active)
    if (filters.search) params.append('search', filters.search)

    const query = params.toString()
    const { data } = await apiServices.get(`/users${query ? `?${query}` : ''}`)
    return data
  },

  async getById(id) {
    const { data } = await apiServices.get(`/users/${id}`)
    return data
  },

  async create(userData) {
    const { data } = await apiServices.post('/auth/register', userData)
    return data
  },

  async update(id, userData) {
    const { data } = await apiServices.patch(`/users/${id}`, userData)
    return data
  },

  async delete(id) {
    const { data } = await apiServices.delete(`/users/${id}`)
    return data
  }
}

export default usersService
