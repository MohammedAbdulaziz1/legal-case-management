import api from './api'

export const documentService = {
  // Get all documents with pagination, search, and sorting
  getAll: async (params = {}) => {
    // By default, only get general documents (not attached to cases)
    const defaultParams = { general_only: true, ...params }
    return api.get('/documents', { params: defaultParams })
  },

  // Get a single document by ID
  getById: async (id) => {
    return api.get(`/documents/${id}`)
  },

  // Upload a new document
  upload: async (file, name, description = null, documentableType = null, documentableId = null) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name)
    if (description) {
      formData.append('description', description)
    }
    if (documentableType && documentableId) {
      formData.append('documentable_type', documentableType)
      formData.append('documentable_id', documentableId)
    }

    // Axios will automatically set Content-Type with boundary for FormData
    // The interceptor removes Content-Type header when FormData is detected
    return api.post('/documents', formData, {
      headers: {
        'Accept': 'application/json',
      },
    })
  },

  // Get documents for a specific case
  getCaseDocuments: async (caseType, caseId) => {
    const typeMap = {
      'primary': 'App\\Models\\CaseRegistration',
      'appeal': 'App\\Models\\Appeal',
      'supreme': 'App\\Models\\SupremeCourt',
    }
    
    return api.get('/documents', {
      params: {
        documentable_type: typeMap[caseType],
        documentable_id: caseId,
        per_page: 100, // Get all documents for the case
      }
    })
  },

  // Update document metadata (name, description)
  update: async (id, data) => {
    const updateData = {}
    if (data.name !== undefined) {
      updateData.name = data.name
    }
    if (data.description !== undefined) {
      updateData.description = data.description
    }

    return api.put(`/documents/${id}`, updateData)
  },

  // Delete a document
  delete: async (id) => {
    return api.delete(`/documents/${id}`)
  },

  // Download a document file
  download: async (id) => {
    return api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    })
  },
}
