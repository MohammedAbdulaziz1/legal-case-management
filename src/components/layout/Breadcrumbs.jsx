import { Link } from 'react-router-dom'

const Breadcrumbs = ({ items = [] }) => {
  if (items.length === 0) return null
  
  return (
    <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <span className="material-symbols-outlined text-xs text-slate-400">chevron_left</span>
          )}
          {item.path && index < items.length - 1 ? (
            <Link to={item.path} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? 'font-semibold text-slate-900 dark:text-white' : ''}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

export default Breadcrumbs

