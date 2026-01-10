import api from './api'

export const caseService = {
  // Primary Cases
  getPrimaryCases: async (params = {}) => {
    return api.get('/cases/primary', { params })
  },

  exportPrimaryCases: async (params = {}) => {
    return api.get('/cases/primary/export', { params, responseType: 'blob' })
  },

  getPrimaryCase: async (id) => {
    return api.get(`/cases/primary/${id}`)
  },

  createPrimaryCase: async (data) => {
    // Map frontend field names to backend field names
    const backendData = {
      first_instance_judgment: data.firstInstanceJudgment || data.judgment || 'قيد النظر',
      case_date: data.registrationDate || data.caseDate,
      case_number: parseInt(data.caseNumber) || 0,
      session_date: data.sessionDate || data.registrationDate || data.caseDate,
      court_number: parseInt(data.courtNumber) || 1,
      title: data.title || '',
      client: data.client || '',
      opponent: data.opponent || '',
      judge: data.judge || '',
      next_session_date: data.nextSessionDate || null,
      status: data.status || 'active',
      notes: data.notes || '',
    }
    return api.post('/cases/primary', backendData)
  },

  updatePrimaryCase: async (id, data) => {
    const backendData = {
      first_instance_judgment: data.firstInstanceJudgment || data.judgment,
      case_date: data.registrationDate || data.caseDate,
      case_number: data.caseNumber ? parseInt(data.caseNumber) : undefined,
      session_date: data.sessionDate || data.registrationDate,
      court_number: data.courtNumber,
      title: data.title,
      client: data.client,
      opponent: data.opponent,
      judge: data.judge,
      next_session_date: data.nextSessionDate,
      status: data.status,
      notes: data.notes,
    }
    // Remove undefined values
    Object.keys(backendData).forEach(key => {
      if (backendData[key] === undefined) delete backendData[key]
    })
    return api.put(`/cases/primary/${id}`, backendData)
  },

  deletePrimaryCase: async (id) => {
    return api.delete(`/cases/primary/${id}`)
  },

  // Appeal Cases
  getAppealCases: async (params = {}) => {
    return api.get('/cases/appeal', { params })
  },

  getAppealCase: async (id) => {
    return api.get(`/cases/appeal/${id}`)
  },

  createAppealCase: async (data) => {
    const backendData = {
      appeal_number: parseInt(data.caseNumber) || 0,
      appeal_date: data.registrationDate || data.appealDate,
      appeal_court_number: parseInt(data.courtNumber) || 1,
      appeal_judgment: data.appealJudgment || data.judgment || 'قيد النظر',
      appealed_by: data.appealedBy || '',
      assigned_case_registration_request_id: parseInt(data.caseRegistrationId) || parseInt(data.assignedCaseRegistrationRequestId) || null,
      status: data.status || 'active',
      priority: data.priority || 'normal',
      notes: data.notes || '',
      plaintiff: data.plaintiff || '',
      plaintiff_lawyer: data.plaintiffLawyer || '',
      defendant: data.defendant || '',
      defendant_lawyer: data.defendantLawyer || '',
      subject: data.subject || '',
      judge: data.judge || '',
    }
    return api.post('/cases/appeal', backendData)
  },

  updateAppealCase: async (id, data) => {
    const backendData = {
      appeal_number: data.caseNumber ? parseInt(data.caseNumber) : undefined,
      appeal_date: data.registrationDate || data.appealDate,
      appeal_court_number: data.courtNumber ? parseInt(data.courtNumber) : undefined,
      appeal_judgment: data.appealJudgment || data.judgment,
      appealed_by: data.appealedBy,
      status: data.status,
      priority: data.priority,
      notes: data.notes,
      plaintiff: data.plaintiff,
      plaintiff_lawyer: data.plaintiffLawyer,
      defendant: data.defendant,
      defendant_lawyer: data.defendantLawyer,
      subject: data.subject,
      judge: data.judge,
    }
    // Remove undefined values
    Object.keys(backendData).forEach(key => {
      if (backendData[key] === undefined) delete backendData[key]
    })
    return api.put(`/cases/appeal/${id}`, backendData)
  },

  deleteAppealCase: async (id) => {
    return api.delete(`/cases/appeal/${id}`)
  },

  // Supreme Court Cases
  getSupremeCourtCases: async (params = {}) => {
    return api.get('/cases/supreme', { params })
  },

  getSupremeCourtCase: async (id) => {
    return api.get(`/cases/supreme/${id}`)
  },

  createSupremeCourtCase: async (data) => {
    const backendData = {
      supreme_date: data.registrationDate || data.date || data.supremeDate,
      supreme_case_number: parseInt(data.caseNumber) || 0,
      appeal_request_id: parseInt(data.appealId) || parseInt(data.appealRequestId) || null,
      status: data.status || 'active',
      notes: data.notes || '',
    }
    return api.post('/cases/supreme', backendData)
  },

  updateSupremeCourtCase: async (id, data) => {
    const backendData = {
      supreme_date: data.registrationDate || data.date || data.supremeDate,
      supreme_case_number: data.caseNumber ? parseInt(data.caseNumber) : undefined,
      appeal_request_id: data.appealId ? parseInt(data.appealId) : (data.appealRequestId ? parseInt(data.appealRequestId) : undefined),
      status: data.status,
      notes: data.notes,
    }
    // Remove undefined values
    Object.keys(backendData).forEach(key => {
      if (backendData[key] === undefined) delete backendData[key]
    })
    return api.put(`/cases/supreme/${id}`, backendData)
  },

  deleteSupremeCourtCase: async (id) => {
    return api.delete(`/cases/supreme/${id}`)
  }
}
