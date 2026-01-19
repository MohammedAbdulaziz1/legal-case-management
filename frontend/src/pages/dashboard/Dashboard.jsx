import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import DocumentsSection from '../../components/documents/DocumentsSection'
import OutcomeFlowChart from '../../components/dashboard/OutcomeFlowChart'
import { dashboardService } from '../../services/dashboardService'
import { sessionService } from '../../services/sessionService'
import { formatDateHijri } from '../../utils/hijriDate'

const CASE_TYPE_LABELS = { primary: 'ابتدائية', appeal: 'استئنافية', supreme: 'عليا' }

const Dashboard = () => {
  const navigate = useNavigate()
  const [outcomeStats, setOutcomeStats] = useState({ wins: 0, losses: 0, loadingCases: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionsError, setSessionsError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true)
      setSessionsError(null)
      const resp = await sessionService.getSessions({ per_page: 15, page: 1 })
      if (resp?.data?.success) {
        setSessions(resp.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setSessionsError('فشل في تحميل الجلسات')
      setSessions([])
    } finally {
      setSessionsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardService.getStats()
      if (response.data.success) {
        const data = response.data.data
        setOutcomeStats({
          wins: data.wins ?? 0,
          losses: data.losses ?? 0,
          loadingCases: data.loadingCases ?? 0
        })
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError('فشل في تحميل الإحصائيات')
      setOutcomeStats({ wins: 0, losses: 0, loadingCases: 0 })
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'الرئيسية', path: '/dashboard' }
  ]

  const headerBreadcrumbs = [
    { label: 'الرئيسية' }
  ]

  return (
    <Layout breadcrumbs={breadcrumbs} headerBreadcrumbs={headerBreadcrumbs}>
      {/* الجلسات - all sessions, newest first */}
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">event</span>
        الجلسات
      </h2>
      <Card className="overflow-hidden mb-8">
        {sessionsLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
              ))}
            </div>
          </div>
        ) : sessionsError ? (
          <div className="p-6 text-center text-red-600 dark:text-red-400">{sessionsError}</div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">لا توجد جلسات مسجلة.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">التاريخ</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">نوع القضية</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">رقم القضية</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${s.caseId ? 'cursor-pointer' : ''}`}
                    onClick={() => s.caseId && s.caseType && navigate(`/cases/${s.caseType}/${s.caseId}`)}
                  >
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100 whitespace-nowrap">{formatDateHijri(s.sessionDate) || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{CASE_TYPE_LABELS[s.caseType] || s.caseType}</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">{s.caseNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={s.notes || ''}>{s.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Outcome flowchart */}
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">analytics</span>
        إحصائيات نتيجة القضية
      </h2>
      {loading ? (
        <Card className="p-6 mb-8">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-16 w-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
            <div className="h-0.5 w-3/4 max-w-sm bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              ))}
            </div>
            <div className="h-2 w-full max-w-2xl bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-4 md:p-6 mb-8">
          <OutcomeFlowChart wins={0} losses={0} loadingCases={0} />
        </Card>
      ) : (
        <Card className="p-4 md:p-6 mb-8">
          <OutcomeFlowChart
            wins={outcomeStats.wins ?? 0}
            losses={outcomeStats.losses ?? 0}
            loadingCases={outcomeStats.loadingCases ?? 0}
          />
        </Card>
      )}

      {error && (
        <Card className="p-6 mt-4">
          <div className="text-center">
            <span className="material-symbols-outlined text-red-500 text-4xl mb-4">error</span>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </Card>
      )}

      {/* Documents Section */}
      <DocumentsSection />
    </Layout>
  )
}

export default Dashboard

