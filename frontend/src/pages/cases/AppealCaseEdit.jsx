import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { CASE_STATUSES, CASE_STATUS_LABELS } from '../../utils/constants'
import { caseService } from '../../services/caseService'

const AppealCaseEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new' || !id
  const [loading, setLoading] = useState(!isNew)
  const [formData, setFormData] = useState({
    caseNumber: '',
    registrationDate: '',
    courtNumber: 1,
    appealJudgment: 'قيد النظر',
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

  useEffect(() => {
    if (isNew) {
      fetchPrimaryCases()
    } else if (id) {
      fetchCase()
    }
  }, [id, isNew])

  const fetchPrimaryCases = async () => {
    try {
      const response = await caseService.getPrimaryCases({ per_page: 100 })
      if (response.data.success) {
        setPrimaryCases(response.data.data || [])
        // Check if there's a primary case ID in query params
        const urlParams = new URLSearchParams(window.location.search)
        const primaryId = urlParams.get('primary')
        if (primaryId) {
          setFormData(prev => ({ ...prev, caseRegistrationId: primaryId }))
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
    if (isNew && !formData.caseRegistrationId) validationErrors.caseRegistrationId = 'القضية الابتدائية مطلوبة'
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors({})
    try {
      if (isNew) {
        await caseService.createAppealCase(formData)
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
                    <Select
                      label="القضية الابتدائية المرتبطة"
                      value={formData.caseRegistrationId}
                      onChange={(e) => {
                        handleChange('caseRegistrationId', e.target.value)
                        if (errors.caseRegistrationId) setErrors(prev => ({ ...prev, caseRegistrationId: '' }))
                      }}
                      error={errors.caseRegistrationId}
                      required
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
                  label="رقم القضية (المرجع)"
                  value={formData.caseNumber}
                  onChange={(e) => {
                    handleChange('caseNumber', e.target.value)
                    if (errors.caseNumber) setErrors(prev => ({ ...prev, caseNumber: '' }))
                  }}
                  disabled={!isNew}
                  error={errors.caseNumber}
                  required={isNew}
                />
                <Input
                  label="تاريخ التسجيل"
                  type="date"
                  value={formData.registrationDate}
                  onChange={(e) => {
                    handleChange('registrationDate', e.target.value)
                    if (errors.registrationDate) setErrors(prev => ({ ...prev, registrationDate: '' }))
                  }}
                  error={errors.registrationDate}
                  required
                />
                <Input
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
                />
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
                    { value: 'قيد النظر', label: 'قيد النظر' },
                    { value: 'للمدعي', label: 'للمدعي' },
                    { value: 'ضد المدعي', label: 'ضد المدعي' },
                    { value: 'تم الحكم', label: 'تم الحكم' }
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
                <Select
                  label="المحكمة المختصة"
                  value={formData.court}
                  onChange={(e) => handleChange('court', e.target.value)}
                  options={[
                    { value: 'محكمة الاستئناف الإدارية - الرياض', label: 'محكمة الاستئناف الإدارية - الرياض' },
                    { value: 'محكمة الاستئناف التجارية - جدة', label: 'محكمة الاستئناف التجارية - جدة' }
                  ]}
                />
                <Input
                  label="اسم القاضي"
                  value={formData.judge}
                  onChange={(e) => handleChange('judge', e.target.value)}
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
                  {isNew ? 'إضافة القضية' : 'حفظ التعديلات'}
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/cases/appeal')} className="w-full">
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

export default AppealCaseEdit

