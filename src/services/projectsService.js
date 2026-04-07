import apiServices from '@/api/apiServices'

const projectsService = {

  async getAll(filters = {}) {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.type) params.append('type', filters.type)
    if (filters.search) params.append('search', filters.search)
    const query = params.toString()
    const { data } = await apiServices.get(`/projects${query ? `?${query}` : ''}`)
    return data
  },

  async getById(id) {
    const { data } = await apiServices.get(`/projects/${id}`)
    return data
  },

  async create(projectData) {
    const { data } = await apiServices.post('/projects', projectData)
    return data
  },

  async update(id, projectData) {
    const { data } = await apiServices.patch(`/projects/${id}`, projectData)
    return data
  },

  async delete(id) {
    const { data } = await apiServices.delete(`/projects/${id}`)
    return data
  }
}

export default projectsService
