import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [isAuthenticated, setIsAuthenticated] = useState(!!user)

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
      setIsAuthenticated(true)
    } else {
      localStorage.removeItem('user')
      setIsAuthenticated(false)
    }
  }, [user])

  // Load user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token && !user) {
      authService.getCurrentUser()
        .then(response => {
          if (response.data.success && response.data.user) {
            setUser(response.data.user)
          }
        })
        .catch(() => {
          // Token might be invalid, clear it
          localStorage.removeItem('auth_token')
        })
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      if (response.data.success && response.data.user) {
        setUser(response.data.user)
        return { success: true, user: response.data.user }
      }
      throw new Error('Login failed')
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Even if API call fails, clear local state
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
