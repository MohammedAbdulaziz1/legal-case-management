import api from './api'

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    return api.get('/dashboard/stats')
  }
}

