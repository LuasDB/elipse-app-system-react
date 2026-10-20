import apiServices from '@/api/apiServices'

const reportsService = {

  async getSalesVsCollections(startDate, endDate, groupBy = 'month') {
    const params = new URLSearchParams({ startDate, endDate, groupBy })
    const { data } = await apiServices.get(`/reports/sales-vs-collections?${params.toString()}`)
    return data
  },

  // Descarga el Excel con todos los contratos y lo guarda en el navegador
  async downloadContractsExcel() {
    const response = await apiServices.get('/reports/contracts/export', {
      responseType: 'blob',
      timeout: 60000
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = `contratos-${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }
}

export default reportsService
