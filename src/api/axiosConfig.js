import axios from 'axios'
import { getToken, removeToken } from '../utils/storage'  

const rawApiUrl = import.meta.env.VITE_API_URL || ''
const serverUrl = import.meta.env.VITE_SERVER_URL || ''

const API_BASE_URL = rawApiUrl.startsWith('http://') || rawApiUrl.startsWith('https://')
    ? rawApiUrl
    : rawApiUrl
        ? `http://${rawApiUrl}`
        : ''

const SERVER_BASE_URL = serverUrl.startsWith('http://') || serverUrl.startsWith('https://')
    ? serverUrl
    : serverUrl
        ? `http://${serverUrl}`
        : ''

const apiClient = axios.create({
    baseURL:API_BASE_URL,
    timeout:10000,
    headers:{
        'Content-Type':'application/json'
    }
})

//Interceptors
apiClient.interceptors.request.use(
    (config) => {
        const token = getToken()  
        if (token) {
        config.headers.Authorization = `Bearer ${token}`  
        }
        return config  
    },
    (error) => {
        return Promise.reject(error)  
    }
)  

apiClient.interceptors.response.use(
    (response) => {
        return response  
    },
    (error) => {
        if (error.response && error.response.status === 401) {
        removeToken()  
        window.location.href = '/login'  
    }
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Error en la petición'  

    return Promise.reject({
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data
    })  
    }
)  



export default apiClient
export { API_BASE_URL , SERVER_BASE_URL}