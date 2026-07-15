import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LogIn,AlertCircle } from 'lucide-react'
import Logo from '@/assets/Logo-Elipse-blanco-1.webp'

const Login = ()=>{
    const navigate = useNavigate()
    const { login } = useAuth()
    const [formData,setFormData]=useState({
        email:'',
        password:''
    })
    const [error,setError]=useState('')
    const [loading,setLoading] = useState(false)

    const handleChange = (e)=>{
        const { name,value} = e.target

        setFormData({...formData,
            [name]:value
        })
        setError('')
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const loggedUser = await login(formData.email,formData.password)
            navigate(loggedUser?.role === 'vendedor' ? '/contratos' : '/dashboard')
        } catch (error) {
            setError(error.message || 'Error al iniciar sesión')
        }finally{
            setLoading(false)
        }
    }


   return (
    <div className="min-h-screen flex">
      
      {/* Lado izquierdo - imagen */}
      <div className="hidden md:flex w-1/2 bg-black">
        <img
          src={Logo}
          alt="arquitectura"
          className="object-cover w-[80%] h-full opacity-80"
        />
      </div>

      {/* Lado derecho - formulario */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white px-8">
        
        <div className="w-full max-w-md">
          
          {/* Logo / título */}
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Sistema de control y seguimiento a ventas
          </h1>
          <p className="text-gray-500 mb-8">
            Accede a tu cuenta
          </p>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                name='email'
                autoComplete="username"
                className="w-full border-b border-gray-300 focus:border-black outline-none py-2"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Contraseña</label>
              <input
                type="password"
                name='password'
                autoComplete="current-password"
                className="w-full border-b border-gray-300 focus:border-black outline-none py-2"
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 mt-6 hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogIn size={16} />
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

          </form>

        </div>
      </div>
    </div>
  )

}

export default Login