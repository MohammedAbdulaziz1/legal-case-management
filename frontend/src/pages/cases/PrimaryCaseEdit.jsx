import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { CASE_STATUSES, CASE_STATUS_LABELS } from '../../utils/constants'
import { validateCaseForm } from '../../utils/validation'
import { caseService } from '../../services/caseService'

const PrimaryCaseEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new' || !id
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(!isNew)
  const [formData, setFormData] = useState({
    caseNumber: '',
    registrationDate: '',
    sessionDate: '',
    title: '',
    // client: '',
    // opponent: '',
    plaintiff: '',
    plaintiffLawyer: '',
    defendant:'',
    defendantLawyer:'',
    court: '',
    // courtNumber: 1,
    cour:'',
    judge: '',
    firstInstanceJudgment: 'قيد المعالجة',
    judgementdate:'',
    judgementrecivedate:'',
    nextSessionDate: '',
    // status: CASE_STATUSES.ACTIVE,
    notes: '',
    priority:'',
  })

  useEffect(() => {
    if (!isNew && id) {
      fetchCase()
    }
  }, [id, isNew])

  const fetchCase = async () => {
    try {
      setLoading(true)
      const response = await caseService.getPrimaryCase(id)
      if (response.data.success) {
        const caseData = response.data.data
        setFormData({
          caseNumber: caseData.caseNumber?.toString() || '',
          registrationDate: caseData.registrationDate || caseData.caseDate || '',
          sessionDate: caseData.sessionDate || caseData.registrationDate || '',
          title: caseData.title || '',
          client: caseData.client || '',
          opponent: caseData.opponent || '',
          court: caseData.court || '',
          courtNumber: caseData.courtNumber || 1,
          judge: caseData.judge || '',
          firstInstanceJudgment: caseData.firstInstanceJudgment || 'قيد المعالجة',
          nextSessionDate: caseData.nextSessionDate || '',
          status: caseData.status || CASE_STATUSES.ACTIVE,
          notes: caseData.notes || ''
        })
      }
    } catch (err) {
      console.error('Error fetching case:', err)
      alert('فشل في تحميل بيانات القضية')
      navigate('/cases/primary')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'الرئيسية', path: '/dashboard' },
    { label: 'القضايا الابتدائية', path: '/cases/primary' },
    { label: isNew ? 'إضافة قضية جديدة' : `تعديل القضية ${formData.caseNumber}` }
  ]

  const headerBreadcrumbs = [
    { label: 'القضايا' },
    { label: 'القضايا الابتدائية', path: '/cases/primary' },
    { label: isNew ? 'إضافة قضية جديدة' : `تعديل القضية ${formData.caseNumber}` }
  ]

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validation = validateCaseForm(formData)
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      return console.log(validation.errors);
    }
  
    setErrors({})
    try {
      if (isNew) {
        await caseService.createPrimaryCase(formData)
      } else {
        await caseService.updatePrimaryCase(id, formData)
      }
      navigate('/cases/primary')
    } catch (err) {
      console.error('Error saving case:', err)
      
      // Handle validation errors from API
      if (err.response?.data?.errors) {
        const apiErrors = err.response.data.errors
        const formattedErrors = {}
        Object.keys(apiErrors).forEach(key => {
          // Map backend field names to frontend field names
          const frontendKey = key === 'case_number' ? 'caseNumber' :
                             key === 'case_date' ? 'registrationDate' :
                             key === 'session_date' ? 'sessionDate' :
                             key === 'court_number' ? 'courtNumber' :
                             key === 'first_instance_judgment' ? 'firstInstanceJudgment' :
                             key === 'next_session_date' ? 'nextSessionDate' : key
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
      <Layout breadcrumbs={breadcrumbs} headerBreadcrumbs={headerBreadcrumbs}>
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">جاري تحميل بيانات القضية...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout breadcrumbs={breadcrumbs} headerBreadcrumbs={headerBreadcrumbs}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">{isNew ? 'add_circle' : 'edit_document'}</span>
            {isNew ? 'إضافة قضية ابتدائية جديدة' : 'تعديل بيانات القضية'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isNew 
              ? 'يرجى إدخال بيانات القضية الابتدائية الجديدة بدقة.'
              : 'يرجى تحديث البيانات المطلوبة بعناية. جميع التعديلات يتم تسجيلها في الأرشيف.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon="close" onClick={() => navigate('/cases/primary')}>
            إلغاء
          </Button>
          <Button variant="primary" icon="save" onClick={handleSubmit}>
            {isNew ? 'إضافة القضية' : 'حفظ التعديلات'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card
              title="البيانات الأساسية"
              icon="info"
              headerActions={
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800 font-medium">
                  قضية نشطة
                </span>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                  <Input
                    label="عنوان القضية"
                    value={formData.title}
                    onChange={(e) => {
                      handleChange('title', e.target.value)
                      if (errors.title) setErrors(prev => ({ ...prev, title: '' }))
                    }}
                    placeholder="أدخل عنوان القضية"
                    error={errors.title}
                    
                  />
                </div>
                <Input
                  label="رقم الدعوى"
                  type='number'
                  value={formData.caseNumber}
                  onChange={(e) => {
                    handleChange('caseNumber', e.target.value)
                    if (errors.caseNumber) setErrors(prev => ({ ...prev, caseNumber: '' }))
                  }}
                  disabled={!isNew}
                  icon={isNew ? undefined : "lock"}
                  error={errors.caseNumber}
                  required={isNew}
                />
                <Input
                  label="تاريخ الدعوى"
                  type="date"
                  value={formData.registrationDate}
                  onChange={(e) => handleChange('registrationDate', e.target.value)}
                  required
                />
                <Input
                  label="تاريخ الجلسة"
                  type="date"
                  value={formData.sessionDate}
                  onChange={(e) => {
                    handleChange('sessionDate', e.target.value)
                    if (errors.sessionDate) setErrors(prev => ({ ...prev, sessionDate: '' }))
                  }}
                  error={errors.sessionDate}
                  required
                />
               
                {/* <Input
                  label="اسم الموكل"
                  value={formData.client}
                  onChange={(e) => {
                    handleChange('client', e.target.value)
                    if (errors.client) setErrors(prev => ({ ...prev, client: '' }))
                  }}
                  icon="person"
                  error={errors.client}
                  required
                /> */}
                {/* <Input
                  label="اسم الخصم"
                  value={formData.opponent}
                  onChange={(e) => {
                    handleChange('opponent', e.target.value)
                    if (errors.opponent) setErrors(prev => ({ ...prev, opponent: '' }))
                  }}
                  icon="person_cancel"
                  error={errors.opponent}
                  required
                /> */}
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

            <Card title="تفاصيل المحكمة والجلسات" icon="gavel">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* <Select
                  label="المحكمة"
                  value={formData.court}
                  onChange={(e) => handleChange('court', e.target.value)}
                  options={[
                    { value: 'المحكمة الابتدائية العامة - الرياض', label: 'المحكمة الابتدائية العامة - الرياض' },
                    { value: 'المحكمة الابتدائية التجارية - جدة', label: 'المحكمة الابتدائية التجارية - جدة' },
                    { value: 'المحكمة الابتدائية - الدائرة الثالثة', label: 'المحكمة الابتدائية - الدائرة الثالثة' }
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
                <Select
                  label="حكم المحكمة الابتدائية"
                  value={formData.firstInstanceJudgment}
                  onChange={(e) => {
                    handleChange('firstInstanceJudgment', e.target.value)
                    if (errors.firstInstanceJudgment) setErrors(prev => ({ ...prev, firstInstanceJudgment: '' }))
                  }}
                  error={errors.firstInstanceJudgment}
                  required
                  options={[
                    { value: 'الغاء القرار', label: 'الغاء القرار' },
                    { value: 'رفض الدعوة', label: 'رفض الدعوة' },
                    { value: 'تاجيل', label: 'تاجيل' },
                    { value: 'قيد المعالجة', label: 'قيدالمعالجة' }
                  ]}
                />
                 <Input
                  label="تاريخ الحكم"
                  type="date"
                  value={formData.judgementdate}
                  onChange={(e) => {
                    handleChange('judgementdate', e.target.value)
                    if (errors.judgementdate) setErrors(prev => ({ ...prev, judgementdate: '' }))
                  }}
                  error={errors.judgementdate}
                 
                />
                <Input
                  label="تاريخ استلام الحكم"
                  type="date"
                  value={formData.judgementrecivedate}
                  onChange={(e) => {
                    handleChange('judgementrecivedate', e.target.value)
                    if (errors.judgementrecivedate) setErrors(prev => ({ ...prev, judgementrecivedate: '' }))
                  }}
                  error={errors.judgementrecivedate}
                  
                />
                {/* <Input
                  label="تاريخ الجلسة القادمة"
                  type="date"
                  value={formData.nextSessionDate}
                  onChange={(e) => handleChange('nextSessionDate', e.target.value)}
                /> */}
              
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    ملاحظات ووقائع
                  </label>
                  <textarea
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 transition-shadow placeholder:text-slate-400"
                    placeholder="أدخل تفاصيل إضافية عن القضية..."
                    rows="4"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
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

            <Card title="المرفقات" className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">لائحة الدعوى.pdf</span>
                      <span className="text-[10px] text-slate-400">2.4 MB</span>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </Card>

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
               
               
              </div>
            </Card>
          </div>
        </div>
      </form>
    </Layout>
  )
}

export default PrimaryCaseEdit

