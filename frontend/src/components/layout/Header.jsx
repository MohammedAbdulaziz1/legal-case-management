import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Avatar from '../ui/Avatar'

const Header = ({ breadcrumbs }) => {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  
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
        <button className="relative p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 left-2 size-2.5 bg-red-500 border-2 border-white dark:border-[#1e2736] rounded-full"></span>
        </button>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <div className="flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-slate-700">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'المستخدم'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role || 'مستخدم'}</p>
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

