import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import CaseDocuments from '../../components/cases/CaseDocuments'
import { CASE_STATUSES, CASE_STATUS_LABELS, USER_ROLES } from '../../utils/constants'
import { caseService } from '../../services/caseService'
import { sessionService } from '../../services/sessionService'
import { useAuth } from '../../context/AuthContext'
import { formatDateHijri } from '../../utils/hijriDate'

const AppealCaseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [caseData, setCaseData] = useState(null)

  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsError, setSessionsError] = useState(null)
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    if (id) {
      fetchCase()
    }
  }, [id])

  useEffect(() => {
    const n = caseData?.caseNumber || caseData?.appealNumber
    if (n) {
      fetchSessions(n)
    }
  }, [caseData?.caseNumber, caseData?.appealNumber])

  const fetchCase = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await caseService.getAppealCase(id)
      if (response.data.success) {
        setCaseData(response.data.data)
      } else {
        setError('فشل في تحميل بيانات القضية')
      }
    } catch (err) {
      console.error('Error fetching appeal case:', err)
      setError('فشل في تحميل بيانات القضية')
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async (caseNumber) => {
    try {
      setSessionsLoading(true)
      setSessionsError(null)
      const resp = await sessionService.getSessions({
        case_type: 'appeal',
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

  const getSessionSummary = (list) => {
    const toLocalDate = (value) => {
      if (!value) return null
      if (typeof value === 'string') {
        const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
        if (m) {
          const y = parseInt(m[1], 10)
          const mo = parseInt(m[2], 10)
          const d = parseInt(m[3], 10)
          const dt = new Date(y, mo - 1, d)
          if (!Number.isNaN(dt.getTime())) return dt
        }
      }
      const dt = new Date(value)
      if (Number.isNaN(dt.getTime())) return null
      return dt
    }

    const items = (list || [])
      .map((s) => {
        const d = toLocalDate(s?.sessionDate)
        if (!d) return null
        return { date: d, sessionDate: s.sessionDate }
      })
      .filter(Boolean)
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    if (items.length === 0) {
      return { lastSessionDate: null, nextSessionDate: null }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let last = null
    let next = null
    for (const it of items) {
      if (it.date.getTime() <= today.getTime()) last = it
      if (it.date.getTime() > today.getTime()) {
        next = it
        break
      }
    }

    return {
      lastSessionDate: last?.sessionDate || null,
      nextSessionDate: next?.sessionDate || null,
    }
  }

  const getOutcomeFromRulingText = (value) => {
    const v = (value || '').toString().toLowerCase().trim()
    if (!v) return 0
    if (v.includes('الغاء') || v.includes('إلغاء') || v.includes('الغاء الحكم') || v.includes('الغاء القرار')) return 1
    if (v.includes('رفض الدعوة')) return 2
    return 0
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

  const getOutcomeFromAppeal = (appealedBy, appealJudgmentText) => {
    const t = getAppealJudgmentType(appealJudgmentText)
    if (t === 'pending' || t === 'postponed') return 0

    const party = getAppealedParty(appealedBy)
    const isWin = (party === 'company' && t === 'canceled') || (party === 'tga' && t === 'accepted')
    return isWin ? 1 : 2
  }

  const OUTCOME_LABELS = {
    1: 'كسب',
    2: 'خسارة',
    0: 'غير محدد',
  }

  const breadcrumbs = [
    { label: 'الرئيسية', path: '/dashboard' },
    { label: 'القضايا الاستئنافية', path: '/cases/appeal' },
    { label: caseData ? `القضية ${caseData.caseNumber || caseData.appealNumber || id}` : 'تفاصيل القضية' }
  ]

  const headerBreadcrumbs = [
    { label: 'القضايا' },
    { label: 'القضايا الاستئنافية', path: '/cases/appeal' },
    { label: caseData ? `القضية ${caseData.caseNumber || caseData.appealNumber || id}` : 'تفاصيل القضية' }
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
              <Button variant="secondary" onClick={() => navigate('/cases/appeal')}>
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
            تفاصيل القضية الاستئنافية
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            عرض تفاصيل القضية رقم {caseData.caseNumber || caseData.appealNumber || id}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon="arrow_back" onClick={() => navigate('/cases/appeal')}>
            العودة للقائمة
          </Button>
          {currentUser?.role !== USER_ROLES.VIEWER && (
            <Button variant="primary" icon="edit" onClick={() => navigate(`/cases/appeal/${id}/edit`)}>
              تعديل القضية
            </Button>
          )}
        </div>
      </div>

      {(() => {
        const { lastSessionDate, nextSessionDate } = getSessionSummary(sessions)
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card title="ملخص الجلسات" icon="event">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">آخر جلسة</label>
                  <p className="text-base text-slate-900 dark:text-white">{formatDateHijri(lastSessionDate) || 'غير محدد'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">الجلسة القادمة</label>
                  <p className="text-base text-slate-900 dark:text-white">{formatDateHijri(nextSessionDate) || 'غير محدد'}</p>
                </div>
              </div>
            </Card>
          </div>
        )
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card title="البيانات الأساسية" icon="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  رقم الاستئناف
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {caseData.caseNumber || caseData.appealNumber || 'غير محدد'}
                </p>
              </div>
               {caseData.caseRegistrationId && (
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    القضية الابتدائية المرتبطة
                  </label>
                  <p className="text-base text-slate-900 dark:text-white">
                    #{caseData.caseRegistrationId}
                  </p>
                </div>
              )}
              {!caseData.caseRegistrationId && (caseData.assignedCaseRegistrationRequestId || caseData.assigned_case_registration_request_id) && (
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    القضية الابتدائية المرتبطة
                  </label>
                  <p className="text-base text-slate-900 dark:text-white">
                    #{caseData.assignedCaseRegistrationRequestId || caseData.assigned_case_registration_request_id}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  تاريخ الاستئناف
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {formatDate(caseData.registrationDate || caseData.appealDate)}
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
              {/* <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  رقم الدائرة القضائية
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.courtNumber || caseData.appealCourtNumber || 'غير محدد'}
                </p>
              </div> */}
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  حكم الاستئناف
                </label>
                <div className="mt-1">
                  <StatusBadge status={caseData.appealJudgment || 'pending'}>
                    {caseData.appealJudgment || 'قيد النظر'}
                  </StatusBadge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  نتيجة القضية
                </label>
                <div className="mt-1">
                  {(() => {
                    const outcome = getOutcomeFromAppeal(caseData.appealedBy, caseData.appealJudgment)
                    return (
                      <StatusBadge judgment={outcome}>
                        {OUTCOME_LABELS[outcome]}
                      </StatusBadge>
                    )
                  })()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  المستأنف
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.appealedBy || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  المحكمة 
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.court || 'غير محدد'}
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

          <Card title="التفاصيل والملاحظات" icon="description">
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  موضوع القضية
                </label>
                <p className="text-base text-slate-900 dark:text-white">
                  {caseData.subject || 'غير محدد'}
                </p>
              </div>
              {caseData.notes && (
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    ملاحظات ومستجدات
                  </label>
                  <p className="text-base text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    {caseData.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card
            title="الجلسات"
            icon="event"
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sessions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-900 dark:text-slate-100">{formatDateHijri(s.sessionDate) || 'غير محدد'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card title="معلومات القضية" className="p-6">
            {/* <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">حالة القضية</h3> */}
            {/* <div className="flex flex-col gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">الحالة الحالية</label>
                <StatusBadge status={caseData.status || CASE_STATUSES.ACTIVE}>
                  {CASE_STATUS_LABELS[caseData.status] || 'قيد الإجراء'}
                </StatusBadge>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">الأولوية</label>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  caseData.priority === 'urgent' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {caseData.priority === 'urgent' ? 'مستعجلة' : 'عادية'}
                </div>
              </div>
            </div> */}
            {/* <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div> */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">balance</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">نوع القضية</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">قضية استئنافية</p>
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

          <CaseDocuments caseType="appeal" caseId={id} />
        </div>
      </div>
    </Layout>
  )
}

export default AppealCaseDetail
