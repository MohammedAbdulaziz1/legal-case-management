import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import { archiveService } from '../../services/archiveService'

const ArchiveLog = () => {
  const [filters, setFilters] = useState({
    caseType: '',
    dateFrom: '',
    dateTo: '',
    user: ''
  })
  const [archiveEntries, setArchiveEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchArchiveEntries()
  }, [currentPage])

  const fetchArchiveEntries = async () => {
    await fetchArchiveEntriesWithFilters(filters, currentPage)
  }

  const handleFilterApply = async () => {
    setCurrentPage(1)
    await fetchArchiveEntriesWithFilters(filters, 1)
  }

  const handleFilterReset = () => {
    const resetFilters = {
      caseType: '',
      dateFrom: '',
      dateTo: '',
      user: ''
    }
    setFilters(resetFilters)
    setCurrentPage(1)
    // Fetch with reset filters
    fetchArchiveEntriesWithFilters(resetFilters, 1)
  }

  const fetchArchiveEntriesWithFilters = async (filterParams = filters, page = currentPage) => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        page: page,
        per_page: 20,
        ...(filterParams.caseType && { case_type: filterParams.caseType })
      }
      const response = await archiveService.getArchiveEntries(params)
      if (response.data.success) {
        setArchiveEntries(response.data.data || [])
        setTotalPages(response.data.meta?.last_page || 1)
      }
    } catch (err) {
      console.error('Error fetching archive entries:', err)
      setError('فشل في تحميل سجل الأرشفة')
      setArchiveEntries([])
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
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } catch {
      return dateString
    }
  }

  const getCaseTypeLabel = (caseType) => {
    const labels = {
      primary: 'قضية ابتدائية',
      appeal: 'قضية استئنافية',
      supreme: 'قضية المحكمة العليا'
    }
    return labels[caseType] || caseType || 'غير محدد'
  }

  const getCaseNumber = (entry) => {
    // Try to get case number from newData or oldData
    if (entry.newData?.case_number) return entry.newData.case_number
    if (entry.oldData?.case_number) return entry.oldData.case_number
    if (entry.newData?.caseNumber) return entry.newData.caseNumber
    if (entry.oldData?.caseNumber) return entry.oldData.caseNumber
    return `#${entry.caseId || entry.id}`
  }

  const breadcrumbs = [
    { label: 'الرئيسية', path: '/dashboard' },
    { label: 'الإدارة' },
    { label: 'سجل الأرشفة والتعديلات' }
  ]

  return (
    <Layout breadcrumbs={breadcrumbs} headerBreadcrumbs={breadcrumbs}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white mb-2">
            سجل الأرشفة والتعديلات
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            عرض جميع التعديلات والتغييرات التي تمت على القضايا مع تفاصيل المستخدمين والتواريخ.
          </p>
        </div>
        <Button variant="secondary" icon="file_download">تصدير السجل</Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="نوع القضية"
            value={filters.caseType}
            onChange={(e) => setFilters(prev => ({ ...prev, caseType: e.target.value }))}
            options={[
              { value: '', label: 'جميع الأنواع' },
              { value: 'primary', label: 'قضايا ابتدائية' },
              { value: 'appeal', label: 'قضايا استئنافية' },
              { value: 'supreme', label: 'قضايا المحكمة العليا' }
            ]}
          />
          <Input
            label="من تاريخ"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
          />
          <Input
            label="إلى تاريخ"
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
          />
          <Input
            label="المستخدم"
            value={filters.user}
            onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
            placeholder="ابحث عن مستخدم..."
          />
        </div>
        <div className="flex gap-3 mt-4">
          <Button variant="primary" size="sm" onClick={handleFilterApply}>تطبيق الفلتر</Button>
          <Button variant="secondary" size="sm" onClick={handleFilterReset}>إعادة تعيين</Button>
        </div>
      </Card>

      {/* Archive Entries */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">جاري تحميل السجل...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-red-500 text-4xl mb-4">error</span>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button variant="primary" size="sm" onClick={fetchArchiveEntries} className="mt-4">
              إعادة المحاولة
            </Button>
          </div>
        ) : archiveEntries.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-slate-400 text-4xl mb-4">archive</span>
            <p className="text-sm text-slate-500 dark:text-slate-400">لا توجد سجلات أرشفة</p>
          </div>
        ) : (
          <>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {archiveEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-medium text-slate-900 dark:text-white">{entry.action || 'تعديل'}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(entry.createdAt) || formatDate(entry.created_at) || 'غير محدد'}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    قام <span className="text-primary">{entry.user?.name || 'مستخدم'}</span> بإجراء تعديل على القضية
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{getCaseNumber(entry)}</span>
                <span>•</span>
                    <span>{getCaseTypeLabel(entry.caseType)}</span>
              </div>
              <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                    <button 
                      onClick={() => {
                        // TODO: Show old/new data comparison
                        console.log('Old data:', entry.oldData)
                        console.log('New data:', entry.newData)
                      }}
                      className="text-[10px] font-medium text-primary hover:underline"
                    >
                      عرض النسخة
                    </button>
              </div>
            </div>
          ))}
        </div>
            {totalPages > 1 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="text-xs font-medium text-primary hover:text-blue-700 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    الصفحة {currentPage} من {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="text-xs font-medium text-primary hover:text-blue-700 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    التالي
          </button>
        </div>
              </div>
            )}
          </>
        )}
      </Card>
    </Layout>
  )
}

export default ArchiveLog

