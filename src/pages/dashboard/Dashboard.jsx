import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import Card from '../../components/common/Card'
import { dashboardService } from '../../services/dashboardService'

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardService.getStats()
      if (response.data.success) {
        const data = response.data.data
        setStats([
          {
            title: 'القضايا الابتدائية',
            value: data.primaryCases?.toString() || '0',
            change: '',
            changeType: 'positive',
            icon: 'folder_open',
            color: 'bg-blue-500',
            path: '/cases/primary'
          },
          {
            title: 'القضايا الاستئنافية',
            value: data.appealCases?.toString() || '0',
            change: '',
            changeType: 'positive',
            icon: 'balance',
            color: 'bg-purple-500',
            path: '/cases/appeal'
          },
          {
            title: 'قضايا المحكمة العليا',
            value: data.supremeCases?.toString() || '0',
            change: '',
            changeType: 'positive',
            icon: 'account_balance',
            color: 'bg-emerald-500',
            path: '/cases/supreme'
          },
          {
            title: 'القضايا المعلقة',
            value: data.pendingCases?.toString() || '0',
            change: '',
            changeType: 'negative',
            icon: 'pending',
            color: 'bg-amber-500',
            path: '/cases/primary'
          }
        ])
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError('فشل في تحميل الإحصائيات')
      // Set default empty stats
      setStats([
        {
          title: 'القضايا الابتدائية',
          value: '0',
          change: '',
          changeType: 'positive',
          icon: 'folder_open',
          color: 'bg-blue-500',
          path: '/cases/primary'
        },
        {
          title: 'القضايا الاستئنافية',
          value: '0',
          change: '',
          changeType: 'positive',
          icon: 'balance',
          color: 'bg-purple-500',
          path: '/cases/appeal'
        },
        {
          title: 'قضايا المحكمة العليا',
          value: '0',
          change: '',
          changeType: 'positive',
          icon: 'account_balance',
          color: 'bg-emerald-500',
          path: '/cases/supreme'
        },
        {
          title: 'القضايا المعلقة',
          value: '0',
          change: '',
          changeType: 'negative',
          icon: 'pending',
          color: 'bg-amber-500',
          path: '/cases/primary'
        }
      ])
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
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary">dashboard</span>
          لوحة التحكم
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          نظرة عامة على إحصائيات القضايا والنشاطات
        </p>
      </div>

      {/* Statistics Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index} className="p-6">
              <div className="animate-pulse">
                <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-6">
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              onClick={() => stat.path && navigate(stat.path)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                </div>
                {stat.change && (
                  <span
                    className={`text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.title}</p>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  )
}

export default Dashboard

