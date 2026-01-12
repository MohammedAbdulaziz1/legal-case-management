import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import DualDateInput from '../../components/common/DualDateInput'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { APPEALED_PARTIES_LABLES, CASE_STATUSES, CASE_STATUS_LABELS, USER_ROLES } from '../../utils/constants'
import { caseService } from '../../services/caseService'
import { useAuth } from '../../context/AuthContext'

const SupremeCourtCaseEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const isNew = id === 'new' || !id
  const [loading, setLoading] = useState(!isNew)
  const [formData, setFormData] = useState({
    caseNumber: '',
    registrationDate: '',
    sessionDate: '',
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

  const fetchAppealCases = async () => {
    try {
      const response = await caseService.getAppealCases({ per_page: 100 })
      if (response.data.success) {
        setAppealCases(response.data.data || [])

        const urlParams = new URLSearchParams(window.location.search)
        const appealId = urlParams.get('appeal')
        if (appealId) {
          setFormData(prev => ({ ...prev, appealId }))
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
          sessionDate: normalizeDateInputValue(caseData.sessionDate),
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
    if (!formData.sessionDate) validationErrors.sessionDate = 'تاريخ الجلسة مطلوب'
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
      if (isNew) {
        await caseService.createSupremeCourtCase(formData)
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
                    <Select
                      label="قضية الاستئناف المرتبطة"
                      value={formData.appealId}
                      onChange={(e) => {
                        handleChange('appealId', e.target.value)
                        if (errors.appealId) setErrors(prev => ({ ...prev, appealId: '' }))
                      }}
                      error={errors.appealId}
                      required
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
                />
                 <Input
                  label=" حكم  العليا"
                  value={formData.supremeCourtJudgment}
                  onChange={(e) => handleChange('supremeCourtJudgment', e.target.value)}
                  required
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
                  {isNew ? 'إضافة القضية' : 'حفظ التعديلات'}
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/cases/supreme')} className="w-full">
                  إلغاء
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </Layout>
  )
}

export default SupremeCourtCaseEdit

