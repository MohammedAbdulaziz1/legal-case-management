import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import { CASE_STATUSES, CASE_STATUS_LABELS, JUDGMENT_TYPES, JUDGMENT_LABELS } from '../../utils/constants'
import { caseService } from '../../services/caseService'

const PrimaryCaseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [caseData, setCaseData] = useState(null)

  useEffect(() => {
    if (id) {
      fetchCase()
    }
  }, [id])

  const fetchCase = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await caseService.getPrimaryCase(id)
      if (response.data.success) {
        setCaseData(response.data.data)
      } else {
        setError('فشل في تحميل بيانات القضية')
      }
    } catch (err) {
      console.error('Error fetching case:', err)
      setError('فشل في تحميل بيانات القضية')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد'
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
    } catch {
      return dateString
    }
  }

  const getJudgmentType = (judgment) => {
    if (!judgment) return JUDGMENT_TYPES.PENDING
    const judgmentLower = judgment.toLowerCase()
    if (judgmentLower.includes('للمدعي') || judgmentLower.includes('for_plaintiff')) {
      return JUDGMENT_TYPES.FOR_PLAINTIFF
    }
    if (judgmentLower.includes('ضد المدعي') || judgmentLower.includes('against_plaintiff')) {
      return JUDGMENT_TYPES.AGAINST_PLAINTIFF
    }
    return JUDGMENT_TYPES.PENDING
  }

  const breadcrumbs = [
    { label: 'الرئيسية', path: '/dashboard' },
    { label: 'القضايا الابتدائية', path: '/cases/primary' },
    { label: caseData ? `القضية ${caseData.caseNumber || id}` : 'تفاصيل القضية' }
  ]

  const headerBreadcrumbs = [
    { label: 'القضايا' },
    { label: 'القضايا الابتدائية', path: '/cases/primary' },
    { label: caseData ? `القضية ${caseData.caseNumber || id}` : 'تفاصيل القضية' }
  ]

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

  if (error || !caseData) {
    return (
      <Layout breadcrumbs={breadcrumbs} headerBreadcrumbs={headerBreadcrumbs}>
        <Card className="p-6">
          <div className="text-center">
            <span className="material-symbols-outlined text-red-500 text-4xl mb-4">error</span>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error || 'القضية غير موجودة'}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => navigate('/cases/primary')}>
                العودة للقائمة
              </Button>
              <Button variant="primary" onClick={fetchCase}>
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </Card>
      </Layout>
    )
  }

  const judgment = getJudgmentType(caseData.firstInstanceJudgment || caseData.judgment)

  return (
    <Layout breadcrumbs={breadcrumbs} headerBreadcrumbs={headerBreadcrumbs}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">description</span>
            تفاصيل القضية الابتدائية
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            عرض تفاصيل القضية رقم {caseData.caseNumber || id}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon="arrow_back" onClick={() => navigate('/cases/primary')}>
            العودة للقائمة
          </Button>
          <Button variant="primary" icon="edit" onClick={() => navigate(`/cases/primary/${id}/edit`)}>
            تعديل القضية
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 space-y-6">
          <Card title="البيانات الأساسية" icon="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  رقم القضية
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {caseData.caseNumber || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  تاريخ التسجيل
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {formatDate(caseData.registrationDate || caseData.caseDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  تاريخ الجلسة
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {formatDate(caseData.sessionDate || caseData.registrationDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  عنوان القضية
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.title || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  اسم الموكل
                </label>
                <p className="text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-slate-400">person</span>
                  {caseData.client || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  اسم الخصم
                </label>
                <p className="text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-slate-400">person_cancel</span>
                  {caseData.opponent || 'غير محدد'}
                </p>
              </div>
            </div>
          </Card>

          <Card title="تفاصيل المحكمة والجلسات" icon="gavel">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  الدائرة القضائية
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.court || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  رقم الدائرة القضائية
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.courtNumber || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  اسم القاضي
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.judge || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  حكم المحكمة الابتدائية
                </label>
                <div className="mt-1">
                  <StatusBadge judgment={judgment}>
                    {JUDGMENT_LABELS[judgment] || caseData.firstInstanceJudgment || caseData.judgment || 'قيد النظر'}
                  </StatusBadge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  تاريخ الجلسة القادمة
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.nextSessionDate ? formatDate(caseData.nextSessionDate) : 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  حالة القضية
                </label>
                <div className="mt-1">
                  <StatusBadge status={caseData.status || CASE_STATUSES.ACTIVE}>
                    {CASE_STATUS_LABELS[caseData.status] || 'قيد الإجراء'}
                  </StatusBadge>
                </div>
              </div>
              {caseData.notes && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    ملاحظات ووقائع
                  </label>
                  <p className="text-base text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    {caseData.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="معلومات القضية" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">folder_open</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">نوع القضية</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">قضية ابتدائية</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">تاريخ الإنشاء</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatDate(caseData.createdAt || caseData.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default PrimaryCaseDetail

