import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import { CASE_STATUSES, JUDGMENT_TYPES, JUDGMENT_LABELS, USER_ROLES } from '../../utils/constants'
import { caseService } from '../../services/caseService'
import { useAuth } from '../../context/AuthContext'
import { formatDateHijri } from '../../utils/hijriDate'
import { sessionService } from '../../services/sessionService'

export default function PrimaryCases() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [cases, setCases] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedTab, setSelectedTab] = useState('all')
  const [nextSessionById, setNextSessionById] = useState({})

  useEffect(() => {
    fetchCases()
  }, [currentPage, search])

  useEffect(() => {
    let cancelled = false

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

    const getNextSessionDate = (sessionsList) => {
      const items = (sessionsList || [])
        .map((s) => {
          const d = toLocalDate(s?.sessionDate)
          if (!d) return null
          return { date: d, sessionDate: s.sessionDate }
        })
        .filter(Boolean)
        .sort((a, b) => a.date.getTime() - b.date.getTime())

      if (items.length === 0) return null

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (const it of items) {
        if (it.date.getTime() > today.getTime()) return it.sessionDate
      }
      return null
    }

    const daysUntil = (isoDate) => {
      const d = toLocalDate(isoDate)
      if (!d) return null
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      d.setHours(0, 0, 0, 0)
      const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diff
    }

    const load = async () => {
      if (selectedTab !== 'under_process') return

      const list = Array.isArray(displayedCases) ? displayedCases : []
      const current = {}

      await Promise.all(
        list.map(async (c) => {
          const caseId = c?.id || c?.assignedCaseRegistrationRequestId
          const caseNumber = c?.caseNumber
          if (!caseId || !caseNumber) return

          try {
            const resp = await sessionService.getSessions({
              case_type: 'primary',
              case_number: caseNumber,
              per_page: 100,
            })
            const sessions = resp?.data?.data || []
            const nextDate = getNextSessionDate(sessions)
            const remaining = daysUntil(nextDate)
            current[caseId] = { nextSessionDate: nextDate, remainingDays: remaining }
          } catch {
            current[caseId] = { nextSessionDate: null, remainingDays: null }
          }
        })
      )

      if (cancelled) return
      setNextSessionById(current)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [selectedTab, currentPage, search, sortBy, sortOrder])

  const fetchCases = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = { page: currentPage, per_page: itemsPerPage }
      if (search) params.search = search

      const response = await caseService.getPrimaryCases(params)
      if (response.data.success) {
        setCases(response.data.data || [])
        setTotalItems(response.data.meta?.total || 0)
      }
    } catch (err) {
      console.error('Error fetching primary cases:', err)
      setError('فشل في تحميل القضايا')
      setCases([])
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    const formatInput = window.prompt('اختر نوع الملف للتصدير: csv أو xlsx (افتراضي csv)')
    const format = (formatInput || 'csv').toLowerCase()

    const params = {}
    if (search) params.search = search
    if (filters.status) params.status = filters.status

    if (format === 'csv') {
      // Server-side CSV export (returns full dataset)
      try {
        const resp = await caseService.exportPrimaryCases(params)
        const blob = new Blob([resp.data], { type: resp.headers['content-type'] || 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        const disposition = resp.headers['content-disposition'] || ''
        let filename = 'primary-cases.csv'
        const match = /filename="?(.*)"?/i.exec(disposition)
        if (match && match[1]) filename = match[1]
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        return
      } catch (err) {
        console.error('Server CSV export failed', err)
        alert('فشل في تصدير CSV من الخادم')
        return
      }
    }

    // XLSX export: fetch all rows (server supports per_page) and build workbook client-side
    if (format === 'xlsx' || format === 'xls' || format === 'excel') {
      try {
        const perPage = totalItems && totalItems > 0 ? totalItems : 100000
        const resp = await caseService.getPrimaryCases({ page: 1, per_page: perPage, search: search })
        if (!resp.data.success) throw new Error('Failed to fetch cases for export')
        const all = resp.data.data || []

        const data = all.map(ci => ({
          assigned_id: ci.assignedCaseRegistrationRequestId || ci.assigned_case_registration_request_id || '',
          case_number: ci.caseNumber || ci.case_number || '',
          case_date: formatDate(ci.registrationDate || ci.caseDate || ci.case_date),
          court_number: ci.courtNumber || ci.court_number || '',
          title: ci.title || ci.subject || '',
          client: ci.client || '',
          opponent: ci.opponent || '',
          plaintiff: ci.plaintiff || '',
          plaintiff_lawyer: ci.plaintiffLawyer || ci.plaintiff_lawyer || '',
          defendant: ci.defendant || '',
          defendant_lawyer: ci.defendantLawyer || ci.defendant_lawyer || '',
          judge: ci.judge || '',
          first_instance_judgment: ci.firstInstanceJudgment || ci.first_instance_judgment || ci.judgment || '',
          status: ci.status || '',
          notes: ci.notes || ''
        }))

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Primary Cases')
        XLSX.writeFile(wb, 'primary-cases.xlsx')
        return
      } catch (err) {
        console.error('XLSX export failed', err)
        alert('فشل في تصدير XLSX')
        return
      }
    }

    alert('نوع التصدير غير مدعوم. استخدم csv أو xlsx.')
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date)
    } catch {
      return dateString
    }
  }

  const getJudgmentType = (judgment) => {
    if (!judgment) return JUDGMENT_TYPES.PENDING
     
    const judgmentLower = judgment.toLowerCase()
    if (judgmentLower.includes('الغاء القرار') ) {
      return JUDGMENT_TYPES.CANCELED
       console.log(judgment)
    }
    if (judgmentLower.includes('رفض الدعوة') ) {
      return JUDGMENT_TYPES.REJECTED
    }
    if (judgmentLower.includes('تاجيل') ) {
      return JUDGMENT_TYPES.POSTPONED
    }
    return JUDGMENT_TYPES.PENDING
  }

  const isCaseDecided = (caseItem) => {
    const judgmentText = caseItem?.firstInstanceJudgment || caseItem?.judgment
    const t = getJudgmentType((judgmentText || '').toString())
    return t !== JUDGMENT_TYPES.PENDING && t !== JUDGMENT_TYPES.POSTPONED
  }

  const getOutcomeFromJudgmentType = (judgmentType) => {
    if (judgmentType === JUDGMENT_TYPES.CANCELED) return 1
    if (judgmentType === JUDGMENT_TYPES.REJECTED) return 2
    return 0
  }

  const OUTCOME_LABELS = {
    1: 'كسب',
    2: 'خسارة',
    0: 'غير محدد',
  }

  const canAppeal = (judgment) => {
    return judgment !== JUDGMENT_TYPES.PENDING && judgment !== JUDGMENT_TYPES.POSTPONED
  }

  const breadcrumbs = [
    { label: 'الرئيسية', path: '/dashboard' },
    { label: 'القضايا الابتدائية' }
  ]

  const headerBreadcrumbs = [
    { label: 'القضايا' },
    { label: 'القضايا الابتدائية' }
  ]

  // Client-side filtered and sorted view of currently loaded rows
  const displayedCases = (() => {
    let list = Array.isArray(cases) ? [...cases] : []

    // Apply client-side filter (status)
    if (filters.status) {
      list = list.filter((c) => (c.status || '') === filters.status)
    }

    if (selectedTab === 'under_process') {
      list = list.filter((c) => {
        const st = (c?.status || '').toString()
        const statusUnderProcess =
          st === CASE_STATUSES.ACTIVE || st === CASE_STATUSES.PENDING || st === CASE_STATUSES.POSTPONED
        return statusUnderProcess && !isCaseDecided(c)
      })
    }

    if (selectedTab === 'judgment_issued') {
      list = list.filter((c) => {
        const st = (c?.status || '').toString()
        return st === CASE_STATUSES.JUDGMENT || st === CASE_STATUSES.CLOSED
      })
    }

    // Apply client-side sort
    const orderFactor = sortOrder === 'asc' ? 1 : -1
    list.sort((a, b) => {
      const key = sortBy
      const getVal = (it) => {
        if (!it) return ''
        if (key === 'case_number') return Number(it.caseNumber || it.case_number || 0)
        if (key === 'case_date' || key === 'created_at') return new Date(it.registrationDate || it.caseDate || it.created_at || it.createdAt || null).getTime() || 0
        if (key === 'title') return (it.title || it.subject || '').toString()
        return (it[key] || '').toString()
      }

      const va = getVal(a)
      const vb = getVal(b)

      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * orderFactor
      return String(va).localeCompare(String(vb)) * orderFactor
    })

    return list
  })()

  return (
    <Layout breadcrumbs={breadcrumbs} headerBreadcrumbs={headerBreadcrumbs}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            سجل القضايا الابتدائية
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
            إدارة وعرض جميع القضايا الابتدائية وتفاصيل الأحكام والإجراءات المرتبطة بها.
          </p>
        </div>
        {currentUser?.role !== USER_ROLES.VIEWER && (
          <Button icon="add" onClick={() => navigate('/cases/primary/new')}>
            إضافة قضية جديدة
          </Button>
        )}
      </div>

      {/* Filters & Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="w-full h-11 pr-10 pl-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              placeholder="ابحث برقم القضية، اسم المدعي، أو اسم المدعى عليه..."
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTab('all')
                  setCurrentPage(1)
                }}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  selectedTab === 'all'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedTab('under_process')
                  setCurrentPage(1)
                }}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  selectedTab === 'under_process'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                قيد الإجراء
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedTab('judgment_issued')
                  setCurrentPage(1)
                }}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  selectedTab === 'judgment_issued'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                صدر الحكم
              </button>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block mx-1"></div>
            <Button variant="secondary" size="sm" icon="sort" onClick={() => {
              setSortBy(prev => prev || 'created_at')
              setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
              setCurrentPage(1)
            }}>
              ترتيب ({sortOrder === 'asc' ? 'صاعد' : 'تنازلي'})
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">جاري تحميل القضايا...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-red-500 text-4xl mb-4">error</span>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button variant="primary" size="sm" onClick={fetchCases}>
              إعادة المحاولة
            </Button>
          </div>
        ) : displayedCases.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-slate-400 text-4xl mb-4">folder_open</span>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">لا توجد قضايا</p>
            {currentUser?.role !== USER_ROLES.VIEWER && (
              <Button variant="primary" icon="add" onClick={() => navigate('/cases/primary/new')}>
                إضافة قضية جديدة
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap" scope="col">
                      رقم الدعوى
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap" scope="col">
                      تاريخ الدعوى
                    </th>

                    {selectedTab === 'under_process' && (
                      <>
                        <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-center" scope="col">
                          الجلسة القادمة
                        </th>
                        <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-center" scope="col">
                          الأيام المتبقية
                        </th>
                      </>
                    )}

                    {selectedTab === 'judgment_issued' && (
                      <>
                        <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-center" scope="col">
                          تاريخ استلام الحكم
                        </th>
                        <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-center" scope="col">
                          الأيام المتبقية للاستئناف
                        </th>
                      </>
                    )}

                    <th
                    className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap min-w-[200px] text-center" scope="col">
                      موضوع الدعوى
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-center" scope="col">
                      الحكم
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-center" scope="col">
                      نتيجة القضية
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-center" scope="col">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedCases.map((caseItem) => {
                    const caseId = caseItem.id || caseItem.assignedCaseRegistrationRequestId
                    const judgment = getJudgmentType(caseItem.firstInstanceJudgment || caseItem.judgment)
                    const outcome = getOutcomeFromJudgmentType(judgment)
                    const appealRemainingDays = (() => {
                      const value = caseItem?.judgementrecivedate
                      if (!value) return null
                      const m = value.toString().trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
                      if (!m) return null
                      const y = parseInt(m[1], 10)
                      const mo = parseInt(m[2], 10)
                      const d = parseInt(m[3], 10)
                      const received = new Date(y, mo - 1, d)
                      if (Number.isNaN(received.getTime())) return null
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      received.setHours(0, 0, 0, 0)
                      const passed = Math.floor((today.getTime() - received.getTime()) / (1000 * 60 * 60 * 24))
                      const rem = 30 - passed
                      return rem
                    })()
                    return (
                      <tr 
                        key={caseId} 
                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/cases/primary/${caseId}`)}
                      >
                        <td className="px-6 py-4 font-medium text-primary whitespace-nowrap hover:underline">
                          {caseItem.caseNumber || caseId}
                        </td>

                        <td className="px-6 py-4 text-slate-900 dark:text-slate-100 whitespace-nowrap">{formatDateHijri(caseItem.registrationDate || caseItem.caseDate) || 'غير محدد'}</td>

                        {selectedTab === 'under_process' && (
                          <>
                            <td className="px-6 py-4 text-center text-slate-900 dark:text-slate-100 whitespace-nowrap">
                              {formatDateHijri(nextSessionById?.[caseId]?.nextSessionDate) || 'غير محدد'}
                            </td>
                            <td className="px-6 py-4 text-center text-slate-900 dark:text-slate-100 whitespace-nowrap">
                              {(() => {
                                const v = nextSessionById?.[caseId]?.remainingDays
                                if (v === null || v === undefined) return 'غير محدد'
                                return v <= 0 ? 0 : v
                              })()}
                            </td>
                          </>
                        )}

                        {selectedTab === 'judgment_issued' && (
                          <>
                            <td className="px-6 py-4 text-center text-slate-900 dark:text-slate-100 whitespace-nowrap">
                              {formatDateHijri(caseItem.judgementrecivedate) || 'غير محدد'}
                            </td>
                            <td className="px-6 py-4 text-center text-slate-900 dark:text-slate-100 whitespace-nowrap">
                              {(() => {
                                if (appealRemainingDays === null || appealRemainingDays === undefined) return 'غير محدد'
                                return appealRemainingDays <= 0 ? 0 : appealRemainingDays
                              })()}
                            </td>
                          </>
                        )}

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-center">{caseItem.title || caseItem.subject || 'غير محدد'}</td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge judgment={judgment}>
                            {JUDGMENT_LABELS[judgment] || 'قيد المعالجة'}
                            
                           
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge judgment={outcome}>
                            {OUTCOME_LABELS[outcome]}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          {currentUser?.role !== USER_ROLES.VIEWER ? (
                            <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => navigate(`/cases/primary/${caseId}/edit`)}
                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                title="تعديل"
                              >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('هل أنت متأكد من حذف هذه القضية؟')) {
                                    try {
                                      await caseService.deletePrimaryCase(caseId)
                                      fetchCases()
                                    } catch (err) {
                                      alert('فشل في حذف القضية')
                                    }
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                              {canAppeal(judgment) ? (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  icon="gavel"
                                  onClick={() => navigate(`/cases/appeal/new?primary=${caseId}`)}
                                  className="text-xs"
                                >
                                  استئناف
                                </Button>
                              ) : (
                                <button
                                  disabled
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-600 rounded-md cursor-not-allowed border border-slate-200 dark:border-slate-700"
                                  title="لا يمكن الاستئناف قبل صدور الحكم"
                                >
                                  <span className="material-symbols-outlined text-[16px]">gavel</span>
                                  استئناف
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-slate-400 dark:text-slate-500 text-sm">
                              عرض فقط
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}
      </Card>
    </Layout>
  )
}

