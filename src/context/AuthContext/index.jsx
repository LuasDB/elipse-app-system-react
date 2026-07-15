import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import authService from '@/services/authService'
import { getUser } from '@/utils/storage'

const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        const storedUser = getUser()
        if(storedUser){
        setUser(storedUser)
        }
        setLoading(false)
    },[])

    const login =async(email,password)=>{
        try {
            const response = await authService.login(email,password)
            setUser(response.user)
            return response.user
        } catch (error) {
            throw new Error(error.message || 'Error al iniciar sesión')
        }
    }
    const logout = ()=>{
        authService.logout()
        setUser(null)
    }

    const value = useMemo(() => ({
            login,
            logout,
            user,
            loading,
            isAuthenticated: !!user
        }), [user, loading])


    return (
        <AuthContext.Provider value={value}>
        {!loading && children}
        </AuthContext.Provider>
    )
}

const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe usarse con un AuthProvider')
    }
    return context
}

export { AuthProvider, useAuth }
