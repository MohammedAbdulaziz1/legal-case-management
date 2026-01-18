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
import CaseSessionsEditor from '../../components/cases/CaseSessionsEditor'
import { APPEALED_PARTIES_LABLES, CASE_STATUSES, CASE_STATUS_LABELS, USER_ROLES } from '../../utils/constants'
import { caseService } from '../../services/caseService'
import { archiveService } from '../../services/archiveService'
import { useAuth } from '../../context/AuthContext'
import { formatDateHijri } from '../../utils/hijriDate'

const SupremeCourtCaseEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const isNew = id === 'new' || !id
  const [loading, setLoading] = useState(!isNew)
  const documentsRef = useRef(null)
  const [editInfo, setEditInfo] = useState(null)
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
    const loadEditInfo = async () => {
      if (isNew || !id) {
        setEditInfo(null)
        return
      }

      try {
        const resp = await archiveService.getCaseHistory(id, 'supreme')
        const entries = resp?.data?.entries || []
        const updated = entries.find((e) => {
          const a = (e?.action || '').toString().toLowerCase()
          return a.includes('update') || a.includes('edit')
        })

        if (!updated) {
          setEditInfo(null)
          return
        }

        setEditInfo({
          userName: updated?.user?.name || '',
          savedAt: updated?.createdAt || updated?.created_at || '',
        })
      } catch (err) {
        console.error('Error fetching supreme case archive history:', err)
        setEditInfo(null)
      }
    }

    loadEditInfo()
  }, [id, isNew])

  const formatArabicDateTime = (value) => {
    if (!value) return ''
    try {
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return String(value)
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(d)
    } catch {
      return String(value)
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
        <div className="flex gap-3">
          <Button variant="secondary" icon="close" onClick={() => navigate('/cases/supreme')}>
            إلغاء
          </Button>
          <Button variant="primary" icon="save" onClick={handleSubmit}>
            {isNew ? 'إضافة القضية' : 'حفظ التعديلات'}
          </Button>
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
                  
                  hijriOnly={true}
                />
                <Input  
                  label="المحكمة العليا"
                  value={formData.court}
                  onChange={(e) => handleChange('court', e.target.value)}
                  
                />
                <Input
                  label="اسم القاضي"
                  value={formData.judge}
                  onChange={(e) => handleChange('judge', e.target.value)}
                  
                />
              </div>
            </Card>

            <CaseSessionsEditor
              caseType="supreme"
              caseNumber={formData.caseNumber}
              enabled={Boolean(formData.caseNumber) && currentUser?.role !== USER_ROLES.VIEWER}
              canEdit={currentUser?.role !== USER_ROLES.VIEWER}
            />
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
            {editInfo && (
              <Card title="معلومات التعديل" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined">person_edit</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">القائم بالتعديل الحالي</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{editInfo.userName || 'مستخدم'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 flex items-center justify-center">
                      <span className="material-symbols-outlined">update</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">تاريخ آخر حفظ</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatArabicDateTime(editInfo.savedAt) || 'غير محدد'}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
            <CaseDocuments ref={documentsRef} caseType="supreme" caseId={id} />
             {/* {!isNew ? (
                <Card className="p-6 sticky top-6">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">حالة القضية</h3>
                  <div className="flex flex-col gap-2 mb-4">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">الحالة الحالية</label>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      options={Object.entries(CASE_STATUSES).map(([key, value]) => ({
                        value,
                        label: CASE_STATUS_LABELS[value]
                      }))}
                    />
                  </div>
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
              )} */}
          </div>
        </div>
      </form>

    </Layout>
  )
}

export default SupremeCourtCaseEdit

