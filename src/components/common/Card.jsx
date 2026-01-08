const Card = ({ children, title, icon, className = '', headerActions, ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-[#1e2736] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {title && (
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {icon && <span className="material-symbols-outlined text-slate-400">{icon}</span>}
            {title}
          </h3>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

export default Card

