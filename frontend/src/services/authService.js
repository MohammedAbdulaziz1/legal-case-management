import api from './api'

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    return response
  },

  // Logout
  logout: async () => {
    await api.post('/auth/logout')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    return { data: { success: true } }
  },

  // Get current user
  getCurrentUser: async () => {
    return api.get('/auth/me')
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    return response
  }
}
