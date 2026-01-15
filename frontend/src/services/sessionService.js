import api from './api'

const isIsoDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

const normalizeIsoDate = (value) => {
  if (value === null || value === undefined) return undefined

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    // Fallback: if a Date object ever gets passed, normalize it.
    return value.toISOString().slice(0, 10)
  }

  const v = typeof value === 'string' ? value.trim() : value
  if (!v) return undefined
  if (typeof v === 'string' && isIsoDate(v)) return v

  // If it's not ISO, do not send invalid formats to backend.
  return undefined
}

export const sessionService = {
  getSessions: async (params = {}) => {
    return api.get('/sessions', { params })
  },

  getSession: async (id) => {
    return api.get(`/sessions/${id}`)
  },

  createSession: async (data) => {
    const sessionDate = normalizeIsoDate(data.sessionDate)
    const backendData = {
      case_type: data.caseType,
      case_number: typeof data.caseNumber === 'string' ? parseInt(data.caseNumber) : data.caseNumber,
      session_date: sessionDate,
      notes: data.notes ?? null,
    }

    Object.keys(backendData).forEach((key) => {
      if (backendData[key] === undefined) delete backendData[key]
    })

    return api.post('/sessions', backendData)
  },

  updateSession: async (id, data) => {
    const sessionDate = normalizeIsoDate(data.sessionDate)
    const backendData = {
      session_date: sessionDate,
      notes: data.notes ?? undefined,
    }

    Object.keys(backendData).forEach((key) => {
      if (backendData[key] === undefined) delete backendData[key]
    })

    return api.put(`/sessions/${id}`, backendData)
  },

  deleteSession: async (id) => {
    return api.delete(`/sessions/${id}`)
  },
}
