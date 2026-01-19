import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Avatar from '../ui/Avatar'
import { USER_ROLES, USER_ROLE_LABELS } from '../../utils/constants'
import { caseService } from '../../services/caseService'

const Header = ({ breadcrumbs }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [deadlineAlerts, setDeadlineAlerts] = useState([])

  // Helper function to get role label, mapping old roles (lawyer, trainee, clerk) to 'user'
  const getRoleLabel = (role) => {
    if (!role) return 'مستخدم'
    // Map old roles to user
    if (role === 'lawyer' || role === 'trainee' || role === 'clerk') {
      return USER_ROLE_LABELS[USER_ROLES.USER] || 'مستخدم'
    }
    return USER_ROLE_LABELS[role] || role || 'مستخدم'
  }

  const toLocalDate = (value) => {
    if (!value) return null
    if (typeof value === 'string') {
      const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
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

  const remainingAppealDays = (receivedDateIso) => {
    const received = toLocalDate(receivedDateIso)
    if (!received) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    received.setHours(0, 0, 0, 0)
    const passed = Math.floor((today.getTime() - received.getTime()) / (1000 * 60 * 60 * 24))
    const remaining = 30 - passed
    return remaining
  }

  const primaryOutcomeFromJudgmentText = (value) => {
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

  const companyOutcomeFromAppeal = (appealedBy, appealJudgmentText) => {
    const t = getAppealJudgmentType(appealJudgmentText)
    if (t === 'pending' || t === 'postponed') return 0
    const party = getAppealedParty(appealedBy)
    if (!party) return 0

    // canceled => company win
    if (t === 'canceled') return 1

    // accepted => appellant loses; if company appealed then company lose else company win
    if (t === 'accepted') return party === 'company' ? 2 : 1

    // rejected treated as resolved; if company appealed then company lose else company win
    if (t === 'rejected') return party === 'company' ? 2 : 1

    return 0
  }

  const buildAlertItem = ({ caseType, caseId, caseNumber, remaining }) => {
    const labels = {
      primary: 'قضية ابتدائية',
      appeal: 'قضية استئناف',
      supreme: 'قضية عليا',
    }

    const paths = {
      primary: `/cases/primary/${caseId}`,
      appeal: `/cases/appeal/${caseId}`,
      supreme: `/cases/supreme/${caseId}`,
    }

    return {
      caseType,
      caseTypeLabel: labels[caseType] || caseType,
      caseId,
      caseNumber,
      remaining,
      path: paths[caseType] || '/',
    }
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!user) {
        setDeadlineAlerts([])
        return
      }

      try {
        const [primaryResp, appealResp, supremeResp] = await Promise.all([
          caseService.getPrimaryCases({ per_page: 1000 }),
          caseService.getAppealCases({ per_page: 1000 }),
          caseService.getSupremeCourtCases({ per_page: 1000 }),
        ])

        const primaryCases = primaryResp?.data?.data || []
        const appealCases = appealResp?.data?.data || []
        const supremeCases = supremeResp?.data?.data || []

        const alerts = []

        for (const c of primaryCases) {
          const caseId = c?.id || c?.assignedCaseRegistrationRequestId
          const caseNumber = c?.caseNumber
          const remaining = remainingAppealDays(c?.judgementrecivedate)
          const outcome = primaryOutcomeFromJudgmentText(c?.firstInstanceJudgment || c?.judgment)
          const isLost = outcome === 2
          if (caseId && caseNumber && isLost && remaining === 15) {
            alerts.push(buildAlertItem({ caseType: 'primary', caseId, caseNumber, remaining }))
          }
        }

        for (const c of appealCases) {
          const caseId = c?.id || c?.appealRequestId
          const caseNumber = c?.caseNumber || c?.appealNumber
          const remaining = remainingAppealDays(c?.judgementrecivedate)
          const outcome = companyOutcomeFromAppeal(c?.appealedBy, c?.appealJudgment)
          const isLost = outcome === 2
          if (caseId && caseNumber && isLost && remaining === 15) {
            alerts.push(buildAlertItem({ caseType: 'appeal', caseId, caseNumber, remaining }))
          }
        }

        for (const c of supremeCases) {
          const caseId = c?.id || c?.supremeRequestId
          const caseNumber = c?.caseNumber || c?.supremeCaseNumber
          const remaining = remainingAppealDays(c?.judgementrecivedate)
          const outcome = companyOutcomeFromAppeal(c?.appealedBy, c?.supremeCourtJudgment)
          const isLost = outcome === 2
          if (caseId && caseNumber && isLost && remaining === 15) {
            alerts.push(buildAlertItem({ caseType: 'supreme', caseId, caseNumber, remaining }))
          }
        }

        if (cancelled) return
        setDeadlineAlerts(alerts)
      } catch (err) {
        if (cancelled) return
        console.error('Failed to load appeal-deadline notifications:', err)
        setDeadlineAlerts([])
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  const hasAlerts = useMemo(() => (deadlineAlerts || []).length > 0, [deadlineAlerts])
  
  return (
    <header className="bg-white dark:bg-[#1e2736] border-b border-slate-200 dark:border-slate-800 h-20 px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm flex-shrink-0">
      <button className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 ml-4">
        <span className="material-symbols-outlined">menu</span>
      </button>
      
      {breadcrumbs && (
        <div className="flex items-center text-sm gap-2 text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && (
                <span className="material-symbols-outlined text-xs rtl:rotate-180">chevron_right</span>
              )}
              {crumb.path ? (
                <a href={crumb.path} className="hover:text-primary transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="font-semibold text-slate-900 dark:text-white">{crumb.label}</span>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-4 mr-auto">
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((v) => !v)}
            className="relative p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors"
          >
          <span className="material-symbols-outlined">notifications</span>
          {hasAlerts && (
            <span className="absolute top-2 left-2 size-2.5 bg-red-500 border-2 border-white dark:border-[#1e2736] rounded-full"></span>
          )}
          </button>

          {notificationsOpen && (
            <div className="absolute left-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">الإشعارات</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">قضايا خسارة تبقّى لها 15 يوم للاستئناف</p>
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="max-h-[360px] overflow-auto">
                {(deadlineAlerts || []).length === 0 ? (
                  <div className="p-4 text-sm text-slate-500 dark:text-slate-400">لا توجد إشعارات حالياً</div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {deadlineAlerts.map((a) => (
                      <button
                        key={`${a.caseType}-${a.caseId}`}
                        type="button"
                        onClick={() => {
                          setNotificationsOpen(false)
                          navigate(a.path)
                        }}
                        className="w-full text-right px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 size-9 rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px]">warning</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {a.caseTypeLabel} رقم {a.caseNumber}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              متبقي {a.remaining} يوم على مهلة الاستئناف
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <div className="flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-slate-700">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'المستخدم'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{getRoleLabel(user?.role)}</p>
          </div>
          <Avatar src={user?.avatar} name={user?.name} size="md" />
        </div>
        <button
          onClick={logout}
          className="p-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  )
}

export default Header

