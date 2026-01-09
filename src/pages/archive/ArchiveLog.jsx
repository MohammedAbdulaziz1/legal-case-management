import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import { archiveService } from '../../services/archiveService'

const ArchiveLog = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    dateRange: '',
    actionType: '',
    caseType: ''
  })
  const [archiveEntries, setArchiveEntries] = useState([])
  const [filteredEntries, setFilteredEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 5

  useEffect(() => {
    fetchArchiveEntries()
  }, [currentPage])

  useEffect(() => {
    applySearchAndFilters()
  }, [searchQuery, filters, archiveEntries])

  const fetchArchiveEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        ...(filters.caseType && { case_type: filters.caseType })
      }
      const response = await archiveService.getArchiveEntries(params)
      if (response.data.success) {
        const entries = response.data.data || []
        setArchiveEntries(entries)
        setTotalItems(response.data.meta?.total || entries.length)
        setTotalPages(response.data.meta?.last_page || Math.ceil(entries.length / itemsPerPage))
      }
    } catch (err) {
      console.error('Error fetching archive entries:', err)
      setError('فشل في تحميل سجل الأرشفة')
      setArchiveEntries([])
    } finally {
      setLoading(false)
    }
  }

  const applySearchAndFilters = () => {
    let filtered = [...archiveEntries]

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(entry => {
        const caseNumber = getCaseNumber(entry).toLowerCase()
        const userName = (entry.user?.name || '').toLowerCase()
        const action = (entry.action || '').toLowerCase()
        const caseType = getCaseTypeLabel(entry.caseType).toLowerCase()
        const details = getActionDetails(entry).toLowerCase()
        
        return caseNumber.includes(query) ||
               userName.includes(query) ||
               action.includes(query) ||
               caseType.includes(query) ||
               details.includes(query)
      })
    }

    // Apply action type filter
    if (filters.actionType) {
      filtered = filtered.filter(entry => {
        const action = (entry.action || '').toLowerCase()
        return action.includes(filters.actionType.toLowerCase())
      })
    }

    // Apply case type filter
    if (filters.caseType) {
      filtered = filtered.filter(entry => entry.caseType === filters.caseType)
    }

    // Apply date range filter
    if (filters.dateRange) {
      const now = new Date()
      let startDate = new Date()
      let endDate = new Date()
      
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'lastday':
          startDate.setDate(now.getDate() - 1)
          startDate.setHours(0, 0, 0, 0)
          endDate.setDate(now.getDate() - 1)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'lastweek':
          startDate.setDate(now.getDate() - 7)
          startDate.setHours(0, 0, 0, 0)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'lastmonth':
          startDate.setMonth(now.getMonth() - 1)
          startDate.setHours(0, 0, 0, 0)
          endDate.setHours(23, 59, 59, 999)
          break
        default:
          startDate = null
          endDate = null
      }
      
      if (startDate && endDate) {
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.createdAt || entry.created_at)
          return entryDate >= startDate && entryDate <= endDate
        })
      }
    }

    setFilteredEntries(filtered)
  }

  const formatDate = (dateString) => {
    if (!dateString) return { date: 'غير محدد', time: '' }
    try {
      const date = new Date(dateString)
      const dateStr = new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
      const timeStr = new Intl.DateTimeFormat('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date)
      return { date: dateStr, time: timeStr }
    } catch {
      return { date: dateString, time: '' }
    }
  }

  const getCaseTypeLabel = (caseType) => {
    const labels = {
      primary: 'المحكمة الابتدائية',
      appeal: 'محكمة الاستئناف',
      supreme: 'المحكمة العليا'
    }
    return labels[caseType] || caseType || 'غير محدد'
  }

  const getCaseNumber = (entry) => {
    if (entry.newData?.case_number) return entry.newData.case_number
    if (entry.oldData?.case_number) return entry.oldData.case_number
    if (entry.newData?.caseNumber) return entry.newData.caseNumber
    if (entry.oldData?.caseNumber) return entry.oldData.caseNumber
    if (entry.newData?.appealNumber) return entry.newData.appealNumber
    if (entry.newData?.supremeCaseNumber) return entry.newData.supremeCaseNumber
    return `${entry.caseId || entry.id}`
  }

  const getActionDetails = (entry) => {
    if (entry.notes) return entry.notes
    if (entry.description) return entry.description
    const action = translateAction(entry.action)
    return `تم إجراء ${action} على القضية`
  }

  const getActionBadge = (action) => {
    if (!action) {
      return {
        label: 'تعديل بيانات',
        color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800',
        dot: 'bg-blue-500'
      }
    }

    const actionLower = String(action).toLowerCase().trim()
    
    // Action badge configurations - using exact matching like StatusBadge
    const actionConfigs = {
      'created': {
        label: 'إنشاء',
        color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800',
        dot: 'bg-blue-500'
      },
      'create': {
        label: 'إنشاء',
        color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800',
        dot: 'bg-blue-500'
      },
      'updated': {
        label: 'تعديل بيانات',
        color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800',
        dot: 'bg-blue-500'
      },
      'update': {
        label: 'تعديل بيانات',
        color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800',
        dot: 'bg-blue-500'
      },
      'edit': {
        label: 'تعديل بيانات',
        color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800',
        dot: 'bg-blue-500'
      },
      'deleted': {
        label: 'حذف',
        color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-100 dark:border-red-800',
        dot: 'bg-red-500'
      },
      'delete': {
        label: 'حذف',
        color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-100 dark:border-red-800',
        dot: 'bg-red-500'
      },
      'archived': {
        label: 'أرشفة مؤقتة',
        color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-100 dark:border-amber-800',
        dot: 'bg-amber-500'
      },
      'archive': {
        label: 'أرشفة مؤقتة',
        color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-100 dark:border-amber-800',
        dot: 'bg-amber-500'
      },
      'restored': {
        label: 'استعادة',
        color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
        dot: 'bg-emerald-500'
      },
      'restore': {
        label: 'استعادة',
        color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
        dot: 'bg-emerald-500'
      }
    }
    
    // Use exact match first (like StatusBadge)
    const config = actionConfigs[actionLower]
    if (config) {
      return config
    }
    
    // Fallback: try to match by includes for any other variations
    if (actionLower.includes('archive')) {
      return actionConfigs['archive']
    }
    if (actionLower.includes('delete')) {
      return actionConfigs['delete']
    }
    if (actionLower.includes('restore')) {
      return actionConfigs['restore']
    }
    if (actionLower.includes('create')) {
      return actionConfigs['create']
    }
    if (actionLower.includes('update') || actionLower.includes('edit')) {
      return actionConfigs['update']
    }
    
    // Default to Edit (Blue)
    return {
      label: 'تعديل بيانات',
      color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800',
      dot: 'bg-blue-500'
    }
  }

  const getUserInitials = (name) => {
    if (!name) return 'م.ع'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0]
    }
    return name.substring(0, 2)
  }

  const getUserRole = (entry) => {
    const roleLabels = {
      'admin': 'مدير النظام',
      'lawyer': 'محامي',
      'trainee': 'محامي متدرب',
      'clerk': 'أمين سر'
    }
    return roleLabels[entry.user?.role] || 'موظف'
  }

  const translateAction = (action) => {
    if (!action) return 'تعديل'
    const actionLower = action.toLowerCase()
    if (actionLower.includes('created') || actionLower.includes('create')) return 'إنشاء'
    if (actionLower.includes('updated') || actionLower.includes('update') || actionLower.includes('edit')) return 'تعديل'
    if (actionLower.includes('deleted') || actionLower.includes('delete')) return 'حذف'
    if (actionLower.includes('archived') || actionLower.includes('archive')) return 'أرشفة'
    if (actionLower.includes('restored') || actionLower.includes('restore')) return 'استعادة'
    return action
  }

  const breadcrumbs = [
    { label: 'الرئيسية', path: '/dashboard' },
    { label: 'الإدارة' },
    { label: 'سجل الأرشفة والتعديلات' }
  ]

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <Layout breadcrumbs={breadcrumbs} headerBreadcrumbs={breadcrumbs}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            سجل الأرشفة والتعديلات
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl">
            عرض ومتابعة كافة التغييرات وعمليات الأرشفة التي تمت على القضايا. يمكنك تتبع من قام بالتعديل ومتى حدث ذلك.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon="download">
            تصدير PDF
          </Button>
          <Button variant="primary" icon="print">
            طباعة التقرير
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search */}
          <div className="md:col-span-5 lg:col-span-6">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">بحث</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:border-primary focus:ring-primary pr-10 pl-4 py-2 text-sm"
                placeholder="ابحث برقم القضية، اسم الموظف..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Date Filter */}
          <div className="md:col-span-3 lg:col-span-3">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">الفترة الزمنية</label>
            <Select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              options={[
                { value: '', label: 'الكل' },
                { value: 'today', label: 'اليوم' },
                { value: 'lastday', label: 'أمس' },
                { value: 'lastweek', label: 'آخر أسبوع' },
                { value: 'lastmonth', label: 'آخر شهر' }
              ]}
            />
          </div>

          {/* Action Type Filter */}
          <div className="md:col-span-4 lg:col-span-3">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">نوع الإجراء</label>
            <Select
              value={filters.actionType}
              onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value }))}
              options={[
                { value: '', label: 'الكل' },
                { value: 'edit', label: 'تعديل بيانات' },
                { value: 'archive', label: 'أرشفة' },
                { value: 'restore', label: 'استعادة' },
                { value: 'delete', label: 'حذف' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Data Table */}
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
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-slate-400 text-4xl mb-4">archive</span>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {archiveEntries.length === 0 
                ? 'لا توجد سجلات أرشفة' 
                : 'لم يتم العثور على نتائج مطابقة للبحث'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">رقم القضية</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">نوع الإجراء</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap w-1/3">تفاصيل العملية</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">قام بالتعديل</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">التاريخ والوقت</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEntries.map((entry) => {
                    const caseNumber = getCaseNumber(entry)
                    const caseType = getCaseTypeLabel(entry.caseType)
                    // Get action badge - use action field or default
                    const rawAction = entry.action || entry.action_type || 'edit'
                    const actionBadge = getActionBadge(rawAction)
                    const dateTime = formatDate(entry.createdAt || entry.created_at)
                    const userInitials = getUserInitials(entry.user?.name)
                    const userRole = getUserRole(entry)
                    
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <a 
                            href="#" 
                            className="font-medium text-primary hover:underline"
                            onClick={(e) => {
                              e.preventDefault()
                              // Navigate to case detail
                            }}
                          >
                            {caseNumber}
                          </a>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{caseType}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${actionBadge.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${actionBadge.dot}`}></span>
                            {actionBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {getActionDetails(entry)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {entry.user?.avatar ? (
                              <div 
                                className="h-8 w-8 rounded-full bg-cover bg-center ring-2 ring-white dark:ring-slate-700 shadow-sm"
                                style={{ backgroundImage: `url(${entry.user.avatar})` }}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white dark:ring-slate-700">
                                {userInitials}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {entry.user?.name || 'مستخدم'}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{userRole}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-900 dark:text-white">{dateTime.date}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{dateTime.time}</div>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <button 
                            className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-primary/5 transition-colors" 
                            title="عرض التفاصيل"
                            onClick={() => {
                              console.log('Old data:', entry.oldData)
                              console.log('New data:', entry.newData)
                            }}
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                عرض <span className="font-medium text-slate-900 dark:text-white">{startItem}</span> إلى{' '}
                <span className="font-medium text-slate-900 dark:text-white">{endItem}</span> من{' '}
                <span className="font-medium text-slate-900 dark:text-white">{totalItems}</span> نتيجة
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-sm font-medium transition-colors"
                >
                  السابق
                </button>
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const page = currentPage <= 2 ? i + 1 : currentPage - 1 + i
                  if (page > totalPages) return null
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-primary text-white hover:bg-blue-700'
                          : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-sm font-medium transition-colors"
                >
                  التالي
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </Layout>
  )
}

export default ArchiveLog
