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
            const message = error.message || 'Error al registrar usuario'
            throw new Error(message)
            }
    },
    async login(email,password){
        try {
            const { data } = await apiServices.post('/auth/login',{email,password})
            if(data.success){
                const { token, user } = data.data
                saveToken(token)
                saveUser(user)
            }
            return data.data
        } catch (error) {
            const message = error.message || 'Error al intentar autenticar al usuario'
            throw new Error(message)
        }
    },
    // Pre-valida la contraseña del usuario en sesión antes de una acción sensible.
    // La autorización real la revuelve a checar el backend en cada endpoint
    // destructivo (header X-Confirm-Password).
    async verifyPassword(password){
        try {
            const { data } = await apiServices.post('/auth/verify-password', { password })
            return data
        } catch (error) {
            throw new Error(error.message || 'No se pudo verificar la contraseña')
        }
    },
    logout(){
        clearStorage()
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