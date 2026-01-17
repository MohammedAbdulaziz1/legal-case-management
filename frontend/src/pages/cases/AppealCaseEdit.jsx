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
import { useAuth } from '../../context/AuthContext'
import { formatDateHijri } from '../../utils/hijriDate'

const AppealCaseEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const isNew = id === 'new' || !id
  const [loading, setLoading] = useState(!isNew)
  const documentsRef = useRef(null)
  const [formData, setFormData] = useState({
    caseNumber: '',
    registrationDate: '',
    courtNumber: 1,
    appealJudgment: 'قيد المعالجة',
    judgementdate: '',
    judgementrecivedate: '',
    appealedBy: '',
    caseRegistrationId: '',
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
  const [primaryCases, setPrimaryCases] = useState([])
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

  // Redirect viewers to detail page (defense in depth)
  useEffect(() => {
    if (currentUser?.role === USER_ROLES.VIEWER) {
      if (isNew) {
        navigate('/cases/appeal', { replace: true })
      } else {
        navigate(`/cases/appeal/${id}`, { replace: true })
      }
    }
  }, [currentUser, isNew, id, navigate])

  useEffect(() => {
    if (currentUser?.role !== USER_ROLES.VIEWER) {
      if (isNew) {
        fetchPrimaryCases()
      } else if (id) {
        fetchCase()
      }
    } else {
      setLoading(false)
    }
  }, [id, isNew, currentUser])

  const fetchPrimaryCases = async () => {
    try {
      // Fetch all primary cases for the searchable dropdown
      const response = await caseService.getPrimaryCases({ per_page: 1000 })
      if (response.data.success) {
        setPrimaryCases(response.data.data || [])
        // Check if there's a primary case ID in query params
        const urlParams = new URLSearchParams(window.location.search)
        const primaryId = urlParams.get('primary')
        const legacyJudgment = urlParams.get('judgment')

        const getPrimaryOutcomeFromJudgmentText = (value) => {
          const v = (value || '').toString().toLowerCase().trim()
          if (!v) return 0
          if (v.includes('الغاء') || v.includes('إلغاء') || v.includes('الغاء الحكم') || v.includes('الغاء القرار')) return 1
          if (v.includes('رفض الدعوة')) return 2
          return 0
        }

        // Primary outcome is interpreted as: 1=company win, 2=company lose, 0=unspecified.
        // Appellant should be the losing party.
        const inferAppealedByFromPrimaryOutcome = (primaryOutcome) => {
          if (primaryOutcome === 1) return APPEALED_PARTIES_LABLES[1]
          if (primaryOutcome === 2) return APPEALED_PARTIES_LABLES[2]
          return ''
        }

        if (primaryId) {
          const selected = (response.data.data || []).find((c) => String(c?.id) === String(primaryId) || String(c?.assignedCaseRegistrationRequestId) === String(primaryId))
          const primaryJudgmentText = selected?.firstInstanceJudgment || selected?.judgment || ''
          const primaryOutcome = getPrimaryOutcomeFromJudgmentText(primaryJudgmentText)

          setFormData(prev => ({
            ...prev,
            caseRegistrationId: primaryId,
            appealedBy: prev.appealedBy || inferAppealedByFromPrimaryOutcome(primaryOutcome),
          }))
        }

        // Backward-compatible fallback for existing links that pass ?judgment=1|2
        if (legacyJudgment && (legacyJudgment === '1' || legacyJudgment === '2')) {
          const legacyOutcome = parseInt(legacyJudgment, 10)
          setFormData((prev) => ({
            ...prev,
            appealedBy: prev.appealedBy || inferAppealedByFromPrimaryOutcome(legacyOutcome),
          }))
        }
      }
    } catch (err) {
      console.error('Error fetching primary cases:', err)
    }
  }

  const fetchCase = async () => {
    try {
      setLoading(true)
      const response = await caseService.getAppealCase(id)
      if (response.data.success) {
        const caseData = response.data.data

        setFormData({
          caseNumber: caseData.caseNumber?.toString() || '',
          registrationDate: caseData.registrationDate || caseData.appealDate || '',
          courtNumber: caseData.courtNumber || 1,
          appealJudgment: caseData.appealJudgment || 'قيد النظر',
          judgementdate: normalizeDateInputValue(caseData.judgementdate),
          judgementrecivedate: normalizeDateInputValue(caseData.judgementrecivedate),
          appealedBy: caseData.appealedBy || '',
          caseRegistrationId: caseData.caseRegistrationId?.toString() || '',
          court: caseData.court || '',
          judge: caseData.judge || '',
          plaintiff: caseData.plaintiff || '',
          plaintiffLawyer: caseData.plaintiffLawyer || '',
          defendant: caseData.defendant || '',
          defendantLawyer: caseData.defendantLawyer || '',
          subject: caseData.subject || '',
          notes: caseData.notes || '',
          status: caseData.status || CASE_STATUSES.ACTIVE,
          priority: caseData.priority || 'normal'
        })
      }
    } catch (err) {
      console.error('Error fetching appeal case:', err)
      alert('فشل في تحميل بيانات القضية')
      navigate('/cases/appeal')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'الرئيسية', path: '/dashboard' },
    { label: 'القضايا الاستئنافية', path: '/cases/appeal' },
    { label: isNew ? 'إضافة قضية جديدة' : `تعديل القضية ${formData.caseNumber}` }
  ]

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
    if (!formData.courtNumber || formData.courtNumber < 1) validationErrors.courtNumber = 'رقم الدائرة القضائية مطلوب'
    if (!formData.appealJudgment) validationErrors.appealJudgment = 'حكم الاستئناف مطلوب'
    if (!formData.appealedBy) validationErrors.appealedBy = 'المستأنف مطلوب'
    if (!formData.judgementdate) validationErrors.judgementdate = 'تاريخ الحكم مطلوب'
    if (!formData.judgementrecivedate) validationErrors.judgementrecivedate = 'تاريخ استلام الحكم مطلوب'
    if (isNew && !formData.caseRegistrationId) validationErrors.caseRegistrationId = 'القضية الابتدائية مطلوبة'
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors({})
    try {
      let savedCaseId = id
      
      if (isNew) {
        const response = await caseService.createAppealCase(formData)
        savedCaseId = response.data?.data?.appealRequestId || response.data?.data?.id
        
        // Upload pending documents if any
        if (documentsRef.current && savedCaseId) {
          await documentsRef.current.uploadPendingFiles(savedCaseId)
        }
      } else {
        await caseService.updateAppealCase(id, formData)
      }
      navigate('/cases/appeal')
    } catch (err) {
      console.error('Error saving appeal case:', err)
      
      // Handle validation errors from API
      if (err.response?.data?.errors) {
        const apiErrors = err.response.data.errors
        const formattedErrors = {}
        Object.keys(apiErrors).forEach(key => {
          const frontendKey = key === 'appeal_number' ? 'caseNumber' :
                             key === 'appeal_date' ? 'registrationDate' :
                             key === 'appeal_court_number' ? 'courtNumber' :
                             key === 'appeal_judgment' ? 'appealJudgment' :
                             key === 'appealed_by' ? 'appealedBy' :
                             key === 'assigned_case_registration_request_id' ? 'caseRegistrationId' : key
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
            {isNew ? 'إضافة قضية استئنافية جديدة' : 'تعديل بيانات القضية'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isNew 
              ? 'يرجى إدخال بيانات القضية الاستئنافية الجديدة بدقة.'
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
                      label="القضية الابتدائية المرتبطة"
                      value={formData.caseRegistrationId}
                      onChange={(e) => {
                        const nextId = e.target.value
                        handleChange('caseRegistrationId', nextId)
                        if (nextId && isNew) {
                          const selected = (primaryCases || []).find(
                            (c) => String(c?.id) === String(nextId) || String(c?.assignedCaseRegistrationRequestId) === String(nextId)
                          )
                          const v = (selected?.firstInstanceJudgment || selected?.judgment || '').toString().toLowerCase().trim()
                          const primaryOutcome = v.includes('الغاء') || v.includes('إلغاء') || v.includes('الغاء الحكم') || v.includes('الغاء القرار') ? 1 : v.includes('رفض الدعوة') ? 2 : 0
                          const inferredAppealedBy = primaryOutcome === 1 ? APPEALED_PARTIES_LABLES[1] : primaryOutcome === 2 ? APPEALED_PARTIES_LABLES[2] : ''

                          if (inferredAppealedBy) {
                            setFormData((prev) => ({
                              ...prev,
                              appealedBy: prev.appealedBy || inferredAppealedBy,
                            }))
                          }
                        }
                        if (errors.caseRegistrationId) setErrors(prev => ({ ...prev, caseRegistrationId: '' }))
                      }}
                      error={errors.caseRegistrationId}
                      required
                      placeholder="ابحث أو اختر القضية الابتدائية..."
                      options={[
                        { value: '', label: 'اختر القضية الابتدائية' },
                        ...primaryCases.map(caseItem => ({
                          value: caseItem.id?.toString() || caseItem.assignedCaseRegistrationRequestId?.toString(),
                          label: `قضية #${caseItem.caseNumber || caseItem.id} - ${caseItem.title || caseItem.client || ''}`
                        }))
                      ]}
                    />
                  </div>
                )}
                <Input
                  label="رقم الاستئناف"
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
                  label="تاريخ الحكم المستانف"
                  value={formData.registrationDate}
                  onChange={(val) => {
                    handleChange('registrationDate', val)
                    if (errors.registrationDate) setErrors(prev => ({ ...prev, registrationDate: '' }))
                  }}
                  error={errors.registrationDate}
                  required
                  hijriOnly={true}
                />
                {/* <Input
                  label="رقم الدائرة القضائية"
                  type="number"
                  value={formData.courtNumber}
                  onChange={(e) => {
                    handleChange('courtNumber', parseInt(e.target.value) || 1)
                    if (errors.courtNumber) setErrors(prev => ({ ...prev, courtNumber: '' }))
                  }}
                  error={errors.courtNumber}
                  required
                  min="1"
                /> */}
                <Select
                  label="حكم الاستئناف"
                  value={formData.appealJudgment}
                  onChange={(e) => {
                    handleChange('appealJudgment', e.target.value)
                    if (errors.appealJudgment) setErrors(prev => ({ ...prev, appealJudgment: '' }))
                  }}
                  error={errors.appealJudgment}
                  required
                  options={[
                    {value: 'قيد المعالجة' , label: 'قيد المعالجة'} ,                 
                    { value: 'بتأييد الحكم', label: 'بتأييد الحكم' },
                    { value: 'الغاء الحكم', label: 'الغاء الحكم' },
                    
                  ]}
                />
                  <Input
                  label="المستأنف"
                  value={formData.appealedBy}
                  onChange={(e) => {
                    handleChange('appealedBy', e.target.value)
                    if (errors.appealedBy) setErrors(prev => ({ ...prev, appealedBy: '' }))
                  }}
                  error={errors.appealedBy}
                  required
                  placeholder="من قام بالاستئناف"
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
                
              
                {/* <Select
                  label="المحكمة"
                  value={formData.court}
                  onChange={(e) => handleChange('court', e.target.value)}
                  options={[
                    { value: 'محكمة الاستئناف الإدارية - الرياض', label: 'محكمة الاستئناف الإدارية - الرياض' },
                    { value: 'محكمة الاستئناف التجارية - جدة', label: 'محكمة الاستئناف التجارية - جدة' }
                  ]}
                /> */}
                 <Input
                  label="المحكمة"
                  value={formData.court}
                  onChange={(e) => handleChange('court', e.target.value)}
                  required
                />
                <Input
                  label="اسم القاضي"
                  value={formData.judge}
                  onChange={(e) => handleChange('judge', e.target.value)}
                />
              </div>
            </Card>

            <CaseSessionsEditor
              caseType="appeal"
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

            <Card title="التفاصيل والملاحظات" icon="description">
              <div className="flex flex-col gap-6">
                <Input
                  label="موضوع القضية"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    ملاحظات ومستجدات
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
             <Card title="معلومات التعديل" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">person_edit</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">القائم بالتعديل الحالي</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">أحمد المحمدي</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 flex items-center justify-center">
                    <span className="material-symbols-outlined">update</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">تاريخ آخر حفظ</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">٢٤ مايو ٢٠٢٣، ١٠:٣٠ ص</p>
                  </div>
                </div>
              </div>
            </Card>

          

             <CaseDocuments ref={documentsRef} caseType="appeal" caseId={id} />
            
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
                    <Button variant="secondary" size="lg" onClick={() => navigate('/cases/appeal')} className="w-full">
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
                    <Button variant="secondary" size="lg" onClick={() => navigate('/cases/appeal')} className="w-full">
                      إلغاء
                    </Button>
                  </div>
                </Card>
              )}
          </div>
        </div>
      </form>

    </Layout>
  )
}

export default AppealCaseEdit

