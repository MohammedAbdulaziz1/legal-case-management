import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import { CASE_STATUSES, CASE_STATUS_LABELS, USER_ROLES } from '../../utils/constants'
import { caseService } from '../../services/caseService'
import { useAuth } from '../../context/AuthContext'

const SupremeCourtCaseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
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
      const response = await caseService.getSupremeCourtCase(id)
      if (response.data.success) {
        setCaseData(response.data.data)
      } else {
        setError('فشل في تحميل بيانات القضية')
      }
    } catch (err) {
      console.error('Error fetching supreme court case:', err)
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

  const breadcrumbs = [
    { label: 'الرئيسية', path: '/dashboard' },
    { label: 'قضايا المحكمة العليا', path: '/cases/supreme' },
    { label: caseData ? `القضية ${caseData.caseNumber || caseData.supremeCaseNumber || id}` : 'تفاصيل القضية' }
  ]

  const headerBreadcrumbs = [
    { label: 'القضايا' },
    { label: 'قضايا المحكمة العليا', path: '/cases/supreme' },
    { label: caseData ? `القضية ${caseData.caseNumber || caseData.supremeCaseNumber || id}` : 'تفاصيل القضية' }
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
              <Button variant="secondary" onClick={() => navigate('/cases/supreme')}>
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

  return (
    <Layout breadcrumbs={breadcrumbs} headerBreadcrumbs={headerBreadcrumbs}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">description</span>
            تفاصيل قضية المحكمة العليا
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            عرض تفاصيل القضية رقم {caseData.caseNumber || caseData.supremeCaseNumber || id}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon="arrow_back" onClick={() => navigate('/cases/supreme')}>
            العودة للقائمة
          </Button>
          {currentUser?.role !== USER_ROLES.VIEWER && (
            <Button variant="primary" icon="edit" onClick={() => navigate(`/cases/supreme/${id}/edit`)}>
              تعديل القضية
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card title="البيانات الأساسية" icon="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  رقم القضية
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {caseData.caseNumber || caseData.supremeCaseNumber || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  تاريخ التسجيل
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {formatDate(caseData.registrationDate || caseData.date || caseData.supremeDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  تاريخ الجلسة
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {formatDate(caseData.sessionDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  حكم المحكمة العليا
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.supremeCourtJudgment || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  تاريخ الحكم
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {formatDate(caseData.judgementdate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  تاريخ استلام الحكم
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {formatDate(caseData.judgementrecivedate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  من قام بالرفع للمحكمة العليا
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.appealedBy || caseData.appealed_by || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  المحكمة المختصة
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.court || 'المحكمة العليا - الرياض'}
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
              {caseData.appealId && (
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    قضية الاستئناف المرتبطة
                  </label>
                  <p className="text-base text-slate-900 dark:text-white">
                    #{caseData.appealId || caseData.appealRequestId}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card title="أطراف القضية" icon="groups">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  اسم المدعي
                </label>
                <p className="text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-slate-400">person</span>
                  {caseData.plaintiff || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  المحامي الوكيل (المدعي)
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.plaintiffLawyer || caseData.plaintiff_lawyer || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  اسم المدعى عليه
                </label>
                <p className="text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-slate-400">person_off</span>
                  {caseData.defendant || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  المحامي الوكيل (المدعى عليه)
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.defendantLawyer || caseData.defendant_lawyer || 'غير محدد'}
                </p>
              </div>
            </div>
          </Card>

          <Card title="التفاصيل" icon="description">
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  موضوع القضية
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.subject || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  ملاحظات
                </label>
                <p className="text-base text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  {caseData.notes || 'غير محدد'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">حالة القضية</h3>
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">الحالة الحالية</label>
              <StatusBadge status={caseData.status || CASE_STATUSES.ACTIVE}>
                {CASE_STATUS_LABELS[caseData.status] || 'قيد الإجراء'}
              </StatusBadge>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">الأولوية</label>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {caseData.priority === 'urgent' ? 'مستعجلة' : caseData.priority === 'normal' ? 'عادية' : (caseData.priority || 'غير محدد')}
              </p>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">account_balance</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">نوع القضية</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">قضية محكمة عليا</p>
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

export default SupremeCourtCaseDetail
