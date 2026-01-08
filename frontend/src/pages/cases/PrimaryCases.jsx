import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import { JUDGMENT_TYPES, JUDGMENT_LABELS } from '../../utils/constants'
import { caseService } from '../../services/caseService'

const PrimaryCases = () => {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCases()
  }, [currentPage])

  const fetchCases = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await caseService.getPrimaryCases({
        page: currentPage,
        per_page: itemsPerPage
      })
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
    { label: 'القضايا الابتدائية' }
  ]

  const headerBreadcrumbs = [
    { label: 'القضايا' },
    { label: 'القضايا الابتدائية' }
  ]

  const canAppeal = (judgment) => {
    return judgment === JUDGMENT_TYPES.FOR_PLAINTIFF || judgment === JUDGMENT_TYPES.AGAINST_PLAINTIFF
  }

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
        <Button icon="add" onClick={() => navigate('/cases/primary/new')}>
          إضافة قضية جديدة
        </Button>
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
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block mx-1"></div>
            <Button variant="secondary" size="sm" icon="filter_list">
              تصفية
            </Button>
            <Button variant="secondary" size="sm" icon="sort">
              ترتيب
            </Button>
            <Button variant="secondary" size="sm" icon="download">
              تصدير
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
        ) : cases.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-slate-400 text-4xl mb-4">folder_open</span>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">لا توجد قضايا</p>
            <Button variant="primary" icon="add" onClick={() => navigate('/cases/primary/new')}>
              إضافة قضية جديدة
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap" scope="col">
                      رقم القضية
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap" scope="col">
                      المدعي
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap" scope="col">
                      المدعى عليه
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap min-w-[200px]" scope="col">
                      موضوع الدعوى
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap" scope="col">
                      تاريخ الجلسة
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-center" scope="col">
                      الحكم
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-center" scope="col">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cases.map((caseItem) => {
                    const caseId = caseItem.id || caseItem.assignedCaseRegistrationRequestId
                    const judgment = getJudgmentType(caseItem.firstInstanceJudgment || caseItem.judgment)
                    return (
                      <tr key={caseId} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-primary whitespace-nowrap cursor-pointer hover:underline">
                          {caseItem.caseNumber || caseId}
                        </td>
                        <td className="px-6 py-4 text-slate-900 dark:text-slate-100 whitespace-nowrap">{caseItem.client || caseItem.plaintiff || 'غير محدد'}</td>
                        <td className="px-6 py-4 text-slate-900 dark:text-slate-100 whitespace-nowrap">{caseItem.opponent || caseItem.defendant || 'غير محدد'}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{caseItem.title || caseItem.subject || 'غير محدد'}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{formatDate(caseItem.sessionDate || caseItem.caseDate)}</td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge judgment={judgment}>
                            {JUDGMENT_LABELS[judgment] || 'قيد النظر'}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
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

export default PrimaryCases

