const StatusBadge = ({ status, judgment, children, className = '' }) => {
  let colorClasses = ''
  
  if (judgment !== undefined) {
    if (judgment === 1) {
      colorClasses = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
    } else if (judgment === 2) {
      colorClasses = 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/20'
    } else {
      colorClasses = 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
    }
  } else if (status) {
    const statusColors = {
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
      judgment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      closed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
      postponed: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
    }
    colorClasses = statusColors[status] || statusColors.pending
  }
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClasses} ${className}`}
    >
      {judgment === undefined && status && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === 'pending' ? 'bg-amber-500 animate-pulse' : 
          status === 'active' ? 'bg-blue-500' : 
          'bg-gray-400'
        }`}></span>
      )}
      {children}
    </span>
  )
}

export default StatusBadge

