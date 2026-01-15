import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'
import { USER_ROLES, JUDGMENT_TYPES, JUDGMENT_LABELS } from '../../utils/constants'
import { caseService } from '../../services/caseService'
import { useAuth } from '../../context/AuthContext'
import { formatDateHijri } from '../../utils/hijriDate'

const SupremeCourtCases = () => {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [cases, setCases] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('asc')

  useEffect(() => {
    fetchCases()
  }, [currentPage, sortBy, sortOrder])

  const fetchCases = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await caseService.getSupremeCourtCases({
        page: currentPage,
        per_page: itemsPerPage,
        sort_by: sortBy,
        order: sortOrder
      })
      if (response.data.success) {
        setCases(response.data.data || [])
        setTotalItems(response.data.meta?.total || 0)
      }
    } catch (err) {
      console.error('Error fetching supreme court cases:', err)
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
    if (judgmentLower.includes('الغاء') || judgmentLower.includes('الغاء الحكم') || judgmentLower.includes('الغاء القرار')) {
      return JUDGMENT_TYPES.CANCELED
    }
    if (judgmentLower.includes('رفض الدعوة')) {
      return JUDGMENT_TYPES.REJECTED
    }
    if (judgmentLower.includes('تاجيل') || judgmentLower.includes('تأجيل')) {
      return JUDGMENT_TYPES.POSTPONED
    }
    return JUDGMENT_TYPES.PENDING
  }

  const breadcrumbs = [
    { label: 'الرئيسية', path: '/dashboard' },
    { label: 'قضايا المحكمة العليا' }
  ]

  return (
    <Layout breadcrumbs={breadcrumbs} headerBreadcrumbs={breadcrumbs}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            سجل قضايا المحكمة العليا
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
            إدارة وعرض جميع قضايا المحكمة العليا وتفاصيل الأحكام والإجراءات المرتبطة بها.
          </p>
        </div>
        {currentUser?.role !== USER_ROLES.VIEWER && (
          <Button icon="add" onClick={() => navigate('/cases/supreme/new')}>
            إضافة قضية جديدة
          </Button>
        )}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-end">
          <div className="flex flex-wrap items-center gap-3">
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
            <span className="material-symbols-outlined text-slate-400 text-4xl mb-4">account_balance</span>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">لا توجد قضايا</p>
            {currentUser?.role !== USER_ROLES.VIEWER && (
              <Button variant="primary" icon="add" onClick={() => navigate('/cases/supreme/new')}>
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
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">رقم العليا</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">تاريخ العليا</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">حكم العليا</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">من  قام بالرفع</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-center">الحالة</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cases.map((caseItem) => {
                    const caseId = caseItem.id || caseItem.supremeRequestId
                    const judgment = getJudgmentType(caseItem.supremeCourtJudgment)
                    return (
                      <tr 
                        key={caseId} 
                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/cases/supreme/${caseId}`)}
                      >
                        <td className="px-6 py-4 font-medium text-primary whitespace-nowrap hover:underline">
                          {caseItem.caseNumber || caseItem.supremeCaseNumber || caseId}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{formatDateHijri(caseItem.date || caseItem.supremeDate || caseItem.registrationDate) || 'غير محدد'}</td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge judgment={judgment}>
                            {JUDGMENT_LABELS[judgment] || caseItem.supremeCourtJudgment || 'غير محدد'}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4 text-slate-900 dark:text-slate-100 whitespace-nowrap">{caseItem.appealedBy || 'غير محدد'}</td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={caseItem.status || 'active'}>
                            {caseItem.status === 'active' ? 'قيد النظر' : caseItem.status === 'pending' ? 'معلقة' : caseItem.status}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          {currentUser?.role !== USER_ROLES.VIEWER ? (
                            <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => navigate(`/cases/supreme/${caseId}/edit`)}
                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                              >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('هل أنت متأكد من حذف هذه القضية؟')) {
                                    try {
                                      await caseService.deleteSupremeCourtCase(caseId)
                                      fetchCases()
                                    } catch (err) {
                                      alert('فشل في حذف القضية')
                                    }
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
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

export default SupremeCourtCases

