const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, className = '' }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)
  
  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i)
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push('...')
    }
  }
  
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 ${className}`}>
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-0">
        عرض <span className="font-bold text-slate-900 dark:text-white">{startItem}</span> إلى{' '}
        <span className="font-bold text-slate-900 dark:text-white">{endItem}</span> من أصل{' '}
        <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`size-9 rounded-lg border font-medium text-sm ${
              page === currentPage
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            } ${page === '...' ? 'cursor-default' : ''}`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
      </div>
    </div>
  )
}

export default Pagination

