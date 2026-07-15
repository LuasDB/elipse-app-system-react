import apiServices from '@/api/apiServices'

const reportsService = {

  async getSalesVsCollections(startDate, endDate, groupBy = 'month') {
    const params = new URLSearchParams({ startDate, endDate, groupBy })
    const { data } = await apiServices.get(`/reports/sales-vs-collections?${params.toString()}`)
    return data
  }
}

export default reportsService
