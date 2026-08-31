import apiClient from './axiosConfig'

const apiServices = {
    get:(endpoint, config={})=>apiClient.get(endpoint,config),
    post:(endpoint,data,config={})=>apiClient.post(endpoint,data,config),
    patch:(endpoint,data,config={})=>apiClient.patch(endpoint, data, config),
    delete:(endpoint,config={})=>apiClient.delete(endpoint,config)
}

// Adjunta la contraseña de autorización ("step-up auth") a una petición.
// Uso:  apiServices.delete(`/contracts/${id}`, withConfirm(password))
export const withConfirm = (password, config = {}) => ({
    ...config,
    headers: {
        ...(config.headers || {}),
        'X-Confirm-Password': password ?? ''
    }
})

export default apiServices
