import apiServices from '@/api/apiServices'

const sellersService = {

  async getAll() {
    const { data } = await apiServices.get('/sellers')
    return data
  },

  async getById(id) {
    const { data } = await apiServices.get(`/sellers/${id}`)
    return data
  }
}

export default sellersService
