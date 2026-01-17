import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import DualDateInput from '../../components/common/DualDateInput'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import CaseDocuments from '../../components/cases/CaseDocuments'
import { CASE_STATUSES, CASE_STATUS_LABELS, USER_ROLES } from '../../utils/constants'
import { validateCaseForm } from '../../utils/validation'
import { caseService } from '../../services/caseService'
import { sessionService } from '../../services/sessionService'
import { useAuth } from '../../context/AuthContext'
import { formatDateHijri } from '../../utils/hijriDate'

const PrimaryCaseEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const isNew = id === 'new' || !id
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(!isNew)
  const documentsRef = useRef(null)
  const [formData, setFormData] = useState({
    caseNumber: '',
    registrationDate: '',
    title: '',
    // client: '',
    // opponent: '',
    plaintiff: '',
    plaintiffLawyer: '',
    defendant:'',
    defendantLawyer:'',
    court: '',
    courtNumber: 1,
    cour:'',
    judge: '',
    firstInstanceJudgment: 'قيد المعالجة',
    judgementdate:'',
    judgementrecivedate:'',
    // status: CASE_STATUSES.ACTIVE,
    notes: '',
    priority:'',
  })

  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsError, setSessionsError] = useState(null)
  const [sessions, setSessions] = useState([])
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [sessionForm, setSessionForm] = useState({ sessionDate: '', notes: '' })
  const [sessionFormErrors, setSessionFormErrors] = useState({})

  // Redirect viewers to detail page (defense in depth)
  useEffect(() => {
    if (currentUser?.role === USER_ROLES.VIEWER) {
      if (isNew) {
        navigate('/cases/primary', { replace: true })
      } else {
        navigate(`/cases/primary/${id}`, { replace: true })
      }
    }
  }, [currentUser, isNew, id, navigate])

  useEffect(() => {
    if (!isNew && id && currentUser?.role !== USER_ROLES.VIEWER) {
      fetchCase()
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
        case_type: 'primary',
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
          caseType: 'primary',
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

  const fetchCase = async () => {
    try {
      setLoading(true)
      const response = await caseService.getPrimaryCase(id)
      if (response.data.success) {
        const caseData = response.data.data
        setFormData({
          caseNumber: caseData.caseNumber?.toString() || '',
          registrationDate: caseData.registrationDate || caseData.caseDate || '',
          title: caseData.title || '',
          client: caseData.client || '',
          opponent: caseData.opponent || '',
          court: caseData.court || '',
          courtNumber: caseData.courtNumber || 1,
          judge: caseData.judge || '',
          firstInstanceJudgment: caseData.firstInstanceJudgment || 'قيد المعالجة',
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
      let savedCaseId = id
      
      if (isNew) {
        const response = await caseService.createPrimaryCase(formData)
        savedCaseId = response.data?.data?.id || response.data?.id
        
        // Upload pending documents if any
        if (documentsRef.current && savedCaseId) {
          await documentsRef.current.uploadPendingFiles(savedCaseId)
        }
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
                             key === 'court_number' ? 'courtNumber' :
                             key === 'first_instance_judgment' ? 'firstInstanceJudgment' :
                             key
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
                <DualDateInput
                  label="تاريخ الدعوى"
                  value={formData.registrationDate}
                  onChange={(val) => handleChange('registrationDate', val)}
                  required
                  hijriOnly={isNew}
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
                  options={[
                    { value: 'الغاء القرار', label: 'الغاء القرار' },
                    { value: 'رفض الدعوة', label: 'رفض الدعوة' },
                    { value: 'تاجيل', label: 'تاجيل' },
                    { value: 'قيد المعالجة', label: 'قيدالمعالجة' }
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
                  hijriOnly={isNew}
                />
                <DualDateInput
                  label="تاريخ استلام الحكم"
                  value={formData.judgementrecivedate}
                  onChange={(val) => {
                    handleChange('judgementrecivedate', val)
                    if (errors.judgementrecivedate) setErrors(prev => ({ ...prev, judgementrecivedate: '' }))
                  }}
                  error={errors.judgementrecivedate}
                  hijriOnly={isNew}
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

            {!isNew && currentUser?.role !== USER_ROLES.VIEWER && (
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

            <CaseDocuments ref={documentsRef} caseType="primary" caseId={id} />

             {!isNew && (
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

              <Input label="رقم الدعوى" value={formData.caseNumber || ''} disabled />
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

export default PrimaryCaseEdit

