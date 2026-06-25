import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [rol, setRol] = useState(() => localStorage.getItem('rol'))
  const [email, setEmail] = useState(() => localStorage.getItem('email'))

  const login = useCallback((newToken, newRol, newEmail) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('rol', newRol)
    localStorage.setItem('email', newEmail)
    setToken(newToken)
    setRol(newRol)
    setEmail(newEmail)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('rol')
    localStorage.removeItem('email')
    setToken(null)
    setRol(null)
    setEmail(null)
  }, [])

  useEffect(() => {
    const handleForceLogout = () => logout()
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [logout])

  return (
    <AuthContext.Provider value={{ token, rol, email, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
