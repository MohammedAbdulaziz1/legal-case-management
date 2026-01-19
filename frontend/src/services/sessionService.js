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

// HH:mm or HH:mm:ss -> HH:mm for backend date_format:H:i; invalid -> undefined
const normalizeTime = (value) => {
  if (value === null || value === undefined) return undefined
  const v = typeof value === 'string' ? value.trim() : value
  if (!v) return undefined
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(v)) return v.slice(0, 5) // "14:30" or "14:30:00" -> "14:30"
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
    const sessionTime = data.sessionTime ? normalizeTime(data.sessionTime) : undefined
    const backendData = {
      case_type: data.caseType,
      case_number: typeof data.caseNumber === 'string' ? parseInt(data.caseNumber) : data.caseNumber,
      session_date: sessionDate,
      session_time: sessionTime,
      notes: data.notes ?? null,
    }

    Object.keys(backendData).forEach((key) => {
      if (backendData[key] === undefined) delete backendData[key]
    })

    return api.post('/sessions', backendData)
  },

  updateSession: async (id, data) => {
    const sessionDate = normalizeIsoDate(data.sessionDate)
    let sessionTime = undefined
    if (data.sessionTime !== undefined) {
      sessionTime = data.sessionTime === '' ? null : normalizeTime(data.sessionTime)
    }
    const backendData = {
      session_date: sessionDate,
      session_time: sessionTime,
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
