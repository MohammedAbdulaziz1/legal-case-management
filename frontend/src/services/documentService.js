import api from './api'

export const documentService = {
  // Get all documents with pagination, search, and sorting
  getAll: async (params = {}) => {
    return api.get('/documents', { params })
  },

  // Get a single document by ID
  getById: async (id) => {
    return api.get(`/documents/${id}`)
  },

  // Upload a new document
  upload: async (file, name, description = null) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name)
    if (description) {
      formData.append('description', description)
    }

    // Axios will automatically set Content-Type with boundary for FormData
    // The interceptor removes Content-Type header when FormData is detected
    return api.post('/documents', formData, {
      headers: {
        'Accept': 'application/json',
      },
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
