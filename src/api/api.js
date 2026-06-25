import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://asuneventos-api2.onrender.com/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('rol')
      localStorage.removeItem('email')
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(error)
  }
)

export default api
