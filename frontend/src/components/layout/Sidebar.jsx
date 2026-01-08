import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Sidebar = () => {
  const { user } = useAuth()
  
  const navItems = [
    { path: '/dashboard', icon: 'grid_view', label: 'الرئيسية' },
    { path: '/cases/primary', icon: 'folder_open', label: 'القضايا الابتدائية' },
    { path: '/cases/appeal', icon: 'balance', label: 'القضايا الاستئنافية' },
    { path: '/cases/supreme', icon: 'account_balance', label: 'قضايا المحكمة العليا' },
    { path: '/users/permissions', icon: 'admin_panel_settings', label: 'إدارة الصلاحيات' },
  ]
  
  return (
    <aside className="w-72 bg-white dark:bg-[#1e2736] border-l border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col hidden lg:flex h-screen sticky top-0 z-30 transition-all duration-300">
      <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">gavel</span>
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">نظام إدارة القضايا</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">لوحة التحكم القانونية</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`
          }
        >
          <span className="material-symbols-outlined">grid_view</span>
          <span className="text-sm">الرئيسية</span>
        </NavLink>
        
        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">القضايا</p>
        </div>
        
        {navItems.slice(1, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <span className={`material-symbols-outlined ${item.path.includes('/cases/primary') ? 'filled' : ''}`}>
              {item.icon}
            </span>
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
        
        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">الإدارة</p>
        </div>
        
        <NavLink
          to="/users/permissions"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`
          }
        >
          <span className="material-symbols-outlined">admin_panel_settings</span>
          <span className="text-sm">إدارة الصلاحيات</span>
        </NavLink>
        
        <NavLink
          to="/archive"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`
          }
        >
          <span className="material-symbols-outlined">history</span>
          <span className="text-sm">سجل الأرشفة</span>
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm">الإعدادات</span>
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar

