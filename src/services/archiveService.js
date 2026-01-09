import api from './api'

export const archiveService = {
  // Get archive entries
  getArchiveEntries: async (params = {}) => {
    return api.get('/archive', { params })
  },

  // Get archive entry by ID
  getArchiveEntry: async (id) => {
    return api.get(`/archive/${id}`)
  },

  // Get case history
  getCaseHistory: async (caseId, caseType) => {
    return api.get(`/archive/case/${caseType}/${caseId}`)
  },

  // Export archive
  exportArchive: async (params = {}) => {
    return api.get('/archive/export', { params, responseType: 'blob' })
  }
}
