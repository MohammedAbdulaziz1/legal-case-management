import api from './api'

export const userService = {
  // Get all users
  getUsers: async (params = {}) => {
    return api.get('/users', { params })
  },

  // Get user by ID
  getUser: async (id) => {
    return api.get(`/users/${id}`)
  },

  // Create user
  createUser: async (data) => {
    return api.post('/users', data)
  },

  // Update user
  updateUser: async (id, data) => {
    return api.put(`/users/${id}`, data)
  },

  // Delete user
  deleteUser: async (id) => {
    return api.delete(`/users/${id}`)
  },

  // Get user permissions
  getUserPermissions: async (id) => {
    return api.get(`/users/${id}/permissions`)
  },

  // Update user permissions
  updateUserPermissions: async (id, permissions) => {
    return api.put(`/users/${id}/permissions`, { permissions })
  }
}
