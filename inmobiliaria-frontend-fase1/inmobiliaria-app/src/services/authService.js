import apiServices from '@/api/apiServices'
import { saveToken,saveUser,clearStorage } from '@/utils/storage'

const authService ={
    
    async register(userData){
        try {
            const {data} = await apiServices.post('/auth/register',userData)
            if(data.success){
                const { token, user } = data.data
                saveToken(token)
                saveUser(user)
            }
            return data

        } catch (error) {
            const message =
            error.response?.data?.message ||
            'Error al registrar usuario'
            throw new Error(message)
            }
    },
    async login(email,password){
        try {
            console.log('Enviados',email,password)

            const { data } = await apiServices.post('/auth/login',{email,password})
            if(data.success){
                const { token, user } = data.data
                saveToken(token)
                saveUser(user)
            }
            return data.data
        } catch (error) {
            const message =
            error.response?.data?.message ||
            'Error al intentar autenticar al usuario'
            throw new Error(message)
        }
    },
    logout(){
        clearStorage()
        window.location.href('/login')
    },
    isAuthenticated(){
        return !!localStorage.getItem('token')
    },
    getCurrentUser(){
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    }
}

export default authService