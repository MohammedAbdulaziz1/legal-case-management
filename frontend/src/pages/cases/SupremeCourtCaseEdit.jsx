import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import DualDateInput from '../../components/common/DualDateInput'
import Select from '../../components/common/Select'
import SearchableSelect from '../../components/common/SearchableSelect'
import Button from '../../components/common/Button'
import CaseDocuments from '../../components/cases/CaseDocuments'
import { APPEALED_PARTIES_LABLES, CASE_STATUSES, CASE_STATUS_LABELS, USER_ROLES } from '../../utils/constants'
import { caseService } from '../../services/caseService'
import { sessionService } from '../../services/sessionService'
import { useAuth } from '../../context/AuthContext'
import { formatDateHijri } from '../../utils/hijriDate'

const SupremeCourtCaseEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const isNew = id === 'new' || !id
  const [loading, setLoading] = useState(!isNew)
  const documentsRef = useRef(null)
  const [formData, setFormData] = useState({
    caseNumber: '',
    registrationDate: '',
    supremeCourtJudgment: '',
    judgementdate: '',
    judgementrecivedate: '',
    appealedBy: '',
    appealId: '',
    court: '',
    judge: '',
    plaintiff: '',
    plaintiffLawyer: '',
    defendant: '',
    defendantLawyer: '',
    subject: '',
    notes: '',
    status: CASE_STATUSES.ACTIVE,
    priority: 'normal'
  })
  const [appealCases, setAppealCases] = useState([])
  const [errors, setErrors] = useState({})

  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsError, setSessionsError] = useState(null)
  const [sessions, setSessions] = useState([])
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [sessionForm, setSessionForm] = useState({ sessionDate: '', notes: '' })
  const [sessionFormErrors, setSessionFormErrors] = useState({})

  const normalizeDateInputValue = (value) => {
    if (!value) return ''
    if (typeof value === 'string') {
      return value.includes('T') ? value.slice(0, 10) : value
    }
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString().slice(0, 10)
    }
    return ''
  }

  const getAppealJudgmentType = (value) => {
    const v = (value || '').toString().toLowerCase().trim()
    if (!v) return 'pending'
    if (v.includes('تاجيل') || v.includes('تأجيل')) return 'postponed'
    if (v.includes('بتأييد الحكم')) return 'accepted'
    if (v.includes('الغاء') || v.includes('إلغاء') || v.includes('الغاء الحكم') || v.includes('الغاء القرار')) return 'canceled'
    if (v.includes('رفض الدعوة')) return 'rejected'
    return 'pending'
  }

  const getAppealedParty = (value) => {
    const v = (value || '').toString().trim()
    if (!v) return null
    if (v.includes('الشركة') || v.includes('شركة')) return 'company'
    if (v.includes('هيئة') || v.includes('النقل')) return 'tga'
    return null
  }

  // Appeal outcome is interpreted as: 1=company win, 2=company lose, 0=unspecified.
  // Referral to Supreme Court should be filed by the losing party.
  const getCompanyOutcomeFromAppeal = (appealedBy, appealJudgmentText) => {
    const t = getAppealJudgmentType(appealJudgmentText)
    if (t === 'pending' || t === 'postponed') return 0

    // "Rejected" isn't part of the main win rules, but it still indicates a resolved outcome.
    // We'll treat it like "accepted" (i.e., maintaining the underlying decision), since UI options
    // mainly use accepted/canceled.
    if (t === 'rejected') {
      const party = getAppealedParty(appealedBy)
      if (!party) return 0
      return party === 'company' ? 2 : 1
    }

    if (t === 'canceled') return 1
    if (t === 'accepted') {
      const party = getAppealedParty(appealedBy)
      if (!party) return 0
      return party === 'company' ? 2 : 1
    }

    return 0
  }

  const inferAppealedByFromAppealCompanyOutcome = (companyOutcome) => {
    if (companyOutcome === 1) return APPEALED_PARTIES_LABLES[1]
    if (companyOutcome === 2) return APPEALED_PARTIES_LABLES[2]
    return ''
  }

  // Redirect viewers to detail page (defense in depth)
  useEffect(() => {
    if (currentUser?.role === USER_ROLES.VIEWER) {
      if (isNew) {
        navigate('/cases/supreme', { replace: true })
      } else {
        navigate(`/cases/supreme/${id}`, { replace: true })
      }
    }
  }, [currentUser, isNew, id, navigate])

  useEffect(() => {
    if (currentUser?.role !== USER_ROLES.VIEWER) {
      if (isNew) {
        fetchAppealCases()
      } else if (id) {
        fetchCase()
      }
    }
  }, [id, isNew, currentUser])

  useEffect(() => {
    if (!isNew && formData.caseNumber) {
      fetchSessions(formData.caseNumber)
    }
  }, [isNew, formData.caseNumber])

  const fetchSessions = async (caseNumber) => {
    try {
      setSessionsLoading(true)
      setSessionsError(null)
      const resp = await sessionService.getSessions({
        case_type: 'supreme',
        case_number: caseNumber,
        per_page: 100,
      })

      if (resp.data?.success) {
        setSessions(resp.data.data || [])
      } else {
        setSessionsError('فشل في تحميل الجلسات')
      }
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setSessionsError('فشل في تحميل الجلسات')
    } finally {
      setSessionsLoading(false)
    }
  }

  const openAddSessionModal = () => {
    setEditingSession(null)
    setSessionForm({ sessionDate: '', notes: '' })
    setSessionFormErrors({})
    setIsSessionModalOpen(true)
  }

  const openEditSessionModal = (s) => {
    setEditingSession(s)
    setSessionForm({
      sessionDate: s.sessionDate || '',
      notes: s.notes || '',
    })
    setSessionFormErrors({})
    setIsSessionModalOpen(true)
  }

  const closeSessionModal = () => {
    setIsSessionModalOpen(false)
    setEditingSession(null)
    setSessionForm({ sessionDate: '', notes: '' })
    setSessionFormErrors({})
  }

  const handleSaveSession = async () => {
    const nextErrors = {}
    if (!sessionForm.sessionDate) nextErrors.sessionDate = 'تاريخ الجلسة مطلوب'
    if (Object.keys(nextErrors).length > 0) {
      setSessionFormErrors(nextErrors)
      return
    }

    try {
      if (editingSession?.id) {
        await sessionService.updateSession(editingSession.id, {
          sessionDate: sessionForm.sessionDate,
          notes: sessionForm.notes,
        })
      } else {
        await sessionService.createSession({
          caseType: 'supreme',
          caseNumber: formData.caseNumber,
          sessionDate: sessionForm.sessionDate,
          notes: sessionForm.notes,
        })
      }

      closeSessionModal()
      await fetchSessions(formData.caseNumber)
    } catch (err) {
      console.error('Error saving session:', err)
      const msg = err.response?.data?.message || 'فشل في حفظ الجلسة'
      alert(msg)
    }
  }

  const handleDeleteSession = async (s) => {
    if (!s?.id) return
    const ok = window.confirm('هل أنت متأكد من حذف هذه الجلسة؟')
    if (!ok) return

    try {
      await sessionService.deleteSession(s.id)
      await fetchSessions(formData.caseNumber)
    } catch (err) {
      console.error('Error deleting session:', err)
      const msg = err.response?.data?.message || 'فشل في حذف الجلسة'
      alert(msg)
    }
  }

  const applyAppealPrefill = (allAppeals, appealId) => {
    const selected = (allAppeals || []).find(
      (c) => String(c?.id) === String(appealId) || String(c?.appealRequestId) === String(appealId)
    )

    const companyOutcome = getCompanyOutcomeFromAppeal(selected?.appealedBy, selected?.appealJudgment)
    const inferredAppealedBy = inferAppealedByFromAppealCompanyOutcome(companyOutcome)

    setFormData((prev) => ({
      ...prev,
      appealId,
      appealedBy: prev.appealedBy || inferredAppealedBy,
    }))
  }

  const fetchAppealCases = async () => {
    try {
      const response = await caseService.getAppealCases({ per_page: 1000 })
      if (response.data.success) {
        setAppealCases(response.data.data || [])

        const urlParams = new URLSearchParams(window.location.search)
        const appealId = urlParams.get('appeal')
        if (appealId) {
          applyAppealPrefill(response.data.data || [], appealId)
        }
      }
    } catch (err) {
      console.error('Error fetching appeal cases:', err)
    }
  }

  const fetchCase = async () => {
    try {
      setLoading(true)
      const response = await caseService.getSupremeCourtCase(id)
      if (response.data.success) {
        const caseData = response.data.data
        setFormData({
          caseNumber: caseData.caseNumber?.toString() || caseData.supremeCaseNumber?.toString() || '',
          registrationDate: caseData.date || caseData.supremeDate || '',
          supremeCourtJudgment: caseData.supremeCourtJudgment || '',
          judgementdate: normalizeDateInputValue(caseData.judgementdate),
          judgementrecivedate: normalizeDateInputValue(caseData.judgementrecivedate),
          appealedBy: caseData.appealedBy || caseData.appealed_by || '',
          appealId: caseData.appealId?.toString() || caseData.appealRequestId?.toString() || '',
          court: caseData.court || 'المحكمة العليا - الرياض',
          judge: caseData.judge || '',
          plaintiff: caseData.plaintiff || '',
          plaintiffLawyer: caseData.plaintiffLawyer || caseData.plaintiff_lawyer || '',
          defendant: caseData.defendant || '',
          defendantLawyer: caseData.defendantLawyer || caseData.defendant_lawyer || '',
          subject: caseData.subject || '',
          notes: caseData.notes || '',
          status: caseData.status || CASE_STATUSES.ACTIVE,
          priority: caseData.priority || 'normal'
        })
      }
    } catch (err) {
      console.error('Error fetching supreme court case:', err)
      alert('فشل في تحميل بيانات القضية')
      navigate('/cases/supreme')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'الرئيسية', path: '/dashboard' },
    { label: 'قضايا المحكمة العليا', path: '/cases/supreme' },
    { label: isNew ? 'إضافة قضية جديدة' : `تعديل القضية ${formData.caseNumber}` }
  ]

  const supremeJudgmentOptions = (() => {
    const fromRelated = (appealCases || []).map((c) => (c?.appealJudgment || '').toString().trim()).filter(Boolean)
    const fallback = ['قيد المعالجة', 'بتأييد الحكم', 'الغاء الحكم']
    const current = (formData.supremeCourtJudgment || '').toString().trim()
    const all = [...fromRelated, ...fallback, current].filter(Boolean)
    return Array.from(new Set(all)).map((v) => ({ value: v, label: v }))
  })()

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    const validationErrors = {}
    if (!formData.caseNumber) validationErrors.caseNumber = 'رقم القضية مطلوب'
    if (!formData.registrationDate) validationErrors.registrationDate = 'تاريخ التسجيل مطلوب'
    if (!formData.supremeCourtJudgment) validationErrors.supremeCourtJudgment = 'حكم المحكمة العليا مطلوب'
    if (!formData.judgementdate) validationErrors.judgementdate = 'تاريخ الحكم مطلوب'
    if (!formData.judgementrecivedate) validationErrors.judgementrecivedate = 'تاريخ استلام الحكم مطلوب'
    if (!formData.appealedBy) validationErrors.appealedBy = 'من قام بالرفع مطلوب'
    if (isNew && !formData.appealId) validationErrors.appealId = 'قضية الاستئناف مطلوبة'
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors({})
    try {
      let savedCaseId = id
      
      if (isNew) {
        const response = await caseService.createSupremeCourtCase(formData)
        savedCaseId = response.data?.data?.supremeRequestId || response.data?.data?.id
        
        // Upload pending documents if any
        if (documentsRef.current && savedCaseId) {
          await documentsRef.current.uploadPendingFiles(savedCaseId)
        }
      } else {
        await caseService.updateSupremeCourtCase(id, formData)
      }
      navigate('/cases/supreme')
    } catch (err) {
      console.error('Error saving supreme court case:', err)
      
      // Handle validation errors from API
      if (err.response?.data?.errors) {
        const apiErrors = err.response.data.errors
        const formattedErrors = {}
        Object.keys(apiErrors).forEach(key => {
          const frontendKey = key === 'supreme_case_number' ? 'caseNumber' :
                             key === 'supreme_date' ? 'registrationDate' :
                             key === 'appeal_request_id' ? 'appealId' :
                             key === 'appealed_by' ? 'appealedBy' :
                             key === 'plaintiff_lawyer' ? 'plaintiffLawyer' :
                             key === 'defendant_lawyer' ? 'defendantLawyer' : key
          formattedErrors[frontendKey] = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key]
        })
        setErrors(formattedErrors)
        alert('يرجى تصحيح الأخطاء في النموذج')
      } else {
        const errorMessage = err.response?.data?.message || 'فشل في حفظ القضية'
        alert(errorMessage)
      }
    }
  }

  if (loading) {
    return (
      <Layout breadcrumbs={breadcrumbs} headerBreadcrumbs={breadcrumbs}>
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">جاري تحميل بيانات القضية...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout breadcrumbs={breadcrumbs} headerBreadcrumbs={breadcrumbs}>
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {isNew ? 'إضافة قضية محكمة عليا جديدة' : 'تعديل بيانات القضية'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isNew 
              ? 'يرجى إدخال بيانات قضية المحكمة العليا الجديدة بدقة.'
              : 'يرجى تحديث البيانات بدقة، سيتم حفظ نسخة من البيانات القديمة في الأرشيف.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card title="البيانات الأساسية" icon="info">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isNew && (
                  <div className="md:col-span-2">
                    <SearchableSelect
                      label="قضية الاستئناف المرتبطة"
                      value={formData.appealId}
                      onChange={(e) => {
                        const nextId = e.target.value
                        handleChange('appealId', nextId)
                        if (nextId && isNew) {
                          const selected = (appealCases || []).find(
                            (c) => String(c?.id) === String(nextId) || String(c?.appealRequestId) === String(nextId)
                          )
                          const companyOutcome = getCompanyOutcomeFromAppeal(selected?.appealedBy, selected?.appealJudgment)
                          const inferredAppealedBy = inferAppealedByFromAppealCompanyOutcome(companyOutcome)
                          setFormData((prev) => ({
                            ...prev,
                            appealedBy: prev.appealedBy || inferredAppealedBy,
                          }))
                        }
                        if (errors.appealId) setErrors(prev => ({ ...prev, appealId: '' }))
                      }}
                      error={errors.appealId}
                      required
                      placeholder="ابحث أو اختر قضية الاستئناف..."
                      options={[
                        { value: '', label: 'اختر قضية الاستئناف' },
                        ...appealCases.map(caseItem => ({
                          value: caseItem.id?.toString() || caseItem.appealRequestId?.toString(),
                          label: `استئناف #${caseItem.caseNumber || caseItem.appealNumber || caseItem.id} - ${caseItem.subject || caseItem.plaintiff || ''}`
                        }))
                      ]}
                    />
                  </div>
                )}
                <Input
                  label="رقم العليا"
                  value={formData.caseNumber}
                  onChange={(e) => {
                    handleChange('caseNumber', e.target.value)
                    if (errors.caseNumber) setErrors(prev => ({ ...prev, caseNumber: '' }))
                  }}
                  disabled={!isNew}
                  error={errors.caseNumber}
                  required={isNew}
                />
                <DualDateInput
                  label="تاريخ العليا"
                  value={formData.registrationDate}
                  onChange={(val) => {
                    handleChange('registrationDate', val)
                    if (errors.registrationDate) setErrors(prev => ({ ...prev, registrationDate: '' }))
                  }}
                  error={errors.registrationDate}
                  required
                  hijriOnly={true}
                />
                <Select
                  label="من قام بالرفع للمحكمة العليا"
                  value={formData.appealedBy}
                  onChange={(e) => {
                    handleChange('appealedBy', e.target.value)
                    if (errors.appealedBy) setErrors(prev => ({ ...prev, appealedBy: '' }))
                  }}
                  error={errors.appealedBy}
                  required
                  options={[
                    { value: '', label: 'اختر الجهة' },
                    { value: APPEALED_PARTIES_LABLES[1], label: APPEALED_PARTIES_LABLES[1] },
                    { value: APPEALED_PARTIES_LABLES[2], label: APPEALED_PARTIES_LABLES[2] },
                  ]}
                />
                 <DualDateInput
                  label="تاريخ الجلسة"
                  value={formData.sessionDate}
                  onChange={(val) => {
                    handleChange('sessionDate', val)
                    if (errors.sessionDate) setErrors(prev => ({ ...prev, sessionDate: '' }))
                  }}
                  error={errors.sessionDate}
                  required
                  hijriOnly={true}
                />
                 <Select
                  label="حكم المحكمة العليا"
                  value={formData.supremeCourtJudgment}
                  onChange={(e) => {
                    handleChange('supremeCourtJudgment', e.target.value)
                    if (errors.supremeCourtJudgment) setErrors(prev => ({ ...prev, supremeCourtJudgment: '' }))
                  }}
                  error={errors.supremeCourtJudgment}
                  required
                  options={[
                    { value: '', label: 'اختر الحكم' },
                    ...supremeJudgmentOptions,
                  ]}
                />
                 <DualDateInput
                  label="تاريخ الحكم"
                  value={formData.judgementdate}
                  onChange={(val) => {
                    handleChange('judgementdate', val)
                    if (errors.judgementdate) setErrors(prev => ({ ...prev, judgementdate: '' }))
                  }}
                  error={errors.judgementdate}
                  required
                  hijriOnly={true}
                />
                
                 <DualDateInput
                  label="تاريخ استلام الحكم"
                  value={formData.judgementrecivedate}
                  onChange={(val) => {
                    handleChange('judgementrecivedate', val)
                    if (errors.judgementrecivedate) setErrors(prev => ({ ...prev, judgementrecivedate: '' }))
                  }}
                  error={errors.judgementrecivedate}
                  required
                  hijriOnly={true}
                />
                <Input  
                  label="المحكمة العليا"
                  value={formData.court}
                  onChange={(e) => handleChange('court', e.target.value)}
                  required
                />
                <Input
                  label="اسم القاضي"
                  value={formData.judge}
                  onChange={(e) => handleChange('judge', e.target.value)}
                  required
                />
              </div>
            </Card>

            {!isNew && (
              <Card
                title="الجلسات"
                icon="event"
                headerActions={
                  <Button variant="primary" icon="add" onClick={openAddSessionModal}>
                    إضافة جلسة
                  </Button>
                }
              >
                {sessionsLoading ? (
                  <div className="p-4 text-sm text-slate-500 dark:text-slate-400">جاري تحميل الجلسات...</div>
                ) : sessionsError ? (
                  <div className="p-4 text-sm text-red-600 dark:text-red-400">{sessionsError}</div>
                ) : sessions.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500 dark:text-slate-400">لا توجد جلسات مسجلة لهذه القضية.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">تاريخ الجلسة</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">ملاحظات</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {sessions.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-slate-900 dark:text-slate-100">{formatDateHijri(s.sessionDate) || 'غير محدد'}</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.notes || '—'}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditSessionModal(s)}
                                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                                  title="تعديل"
                                >
                                  <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSession(s)}
                                  className="p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-300"
                                  title="حذف"
                                >
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}
              <Card title="أطراف القضية" icon="groups">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="اسم المدعي"
                  value={formData.plaintiff}
                  onChange={(e) => handleChange('plaintiff', e.target.value)}
                  icon="person"
                />
                <Input
                  label="المحامي الوكيل (المدعي)"
                  value={formData.plaintiffLawyer}
                  onChange={(e) => handleChange('plaintiffLawyer', e.target.value)}
                />
                <Input
                  label="اسم المدعى عليه"
                  value={formData.defendant}
                  onChange={(e) => handleChange('defendant', e.target.value)}
                  icon="person_off"
                />
                <Input
                  label="المحامي الوكيل (المدعى عليه)"
                  value={formData.defendantLawyer}
                  onChange={(e) => handleChange('defendantLawyer', e.target.value)}
                  placeholder="-- غير محدد --"
                />
              </div>
            </Card>

            <Card title="التفاصيل" icon="description">
              <div className="flex flex-col gap-6">
                <Input
                  label="موضوع القضية"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    ملاحظات
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    rows="5"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <CaseDocuments ref={documentsRef} caseType="supreme" caseId={id} />
             {!isNew ? (
                <Card className="p-6 sticky top-6">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">حالة القضية</h3>
                  {/* <div className="flex flex-col gap-2 mb-4">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">الحالة الحالية</label>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      options={Object.entries(CASE_STATUSES).map(([key, value]) => ({
                        value,
                        label: CASE_STATUS_LABELS[value]
                      }))}
                    />
                  </div> */}
                  <div className="flex flex-col gap-2 mb-4">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">الأولوية</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex-1">
                        <input
                          type="radio"
                          name="priority"
                          value="normal"
                          checked={formData.priority === 'normal'}
                          onChange={(e) => handleChange('priority', e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm">عادية</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 flex-1">
                        <input
                          type="radio"
                          name="priority"
                          value="urgent"
                          checked={formData.priority === 'urgent'}
                          onChange={(e) => handleChange('priority', e.target.value)}
                          className="text-red-500 focus:ring-red-500"
                        />
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">مستعجلة</span>
                      </label>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>
                  <div className="flex flex-col gap-3">
                    <Button variant="primary" size="lg" icon="save" onClick={handleSubmit} className="w-full">
                      حفظ التعديلات
                    </Button>
                    <Button variant="secondary" size="lg" onClick={() => navigate('/cases/supreme')} className="w-full">
                      إلغاء
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 sticky top-6">
                  <div className="flex flex-col gap-3">
                    <Button variant="primary" size="lg" icon="save" onClick={handleSubmit} className="w-full">
                      إضافة القضية
                    </Button>
                    <Button variant="secondary" size="lg" onClick={() => navigate('/cases/supreme')} className="w-full">
                      إلغاء
                    </Button>
                  </div>
                </Card>
              )}
          </div>
        </div>
      </form>

      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={closeSessionModal}>
          <div
            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingSession ? 'تعديل جلسة' : 'إضافة جلسة'}</h3>
              <button
                type="button"
                onClick={closeSessionModal}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="إغلاق"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <DualDateInput
                label="تاريخ الجلسة"
                value={sessionForm.sessionDate}
                onChange={(val) => {
                  setSessionForm((p) => ({ ...p, sessionDate: val }))
                  if (sessionFormErrors.sessionDate) setSessionFormErrors((p) => ({ ...p, sessionDate: '' }))
                }}
                error={sessionFormErrors.sessionDate}
                required
                hijriOnly
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">ملاحظات</label>
                <textarea
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="أدخل ملاحظات الجلسة (اختياري)"
                  rows={4}
                  className="w-full rounded-lg border py-2.5 pr-4 pl-4 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                />
              </div>

              <Input label="رقم العليا" value={formData.caseNumber || ''} disabled />
            </div>

            <div className="flex justify-end gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="secondary" icon="close" onClick={closeSessionModal}>
                إلغاء
              </Button>
              <Button variant="primary" icon="save" onClick={handleSaveSession}>
                حفظ
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default SupremeCourtCaseEdit

