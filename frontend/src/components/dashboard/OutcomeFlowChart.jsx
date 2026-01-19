/**
 * Flowchart-style visualization for outcome stats: إجمالي → كسب | خسارة | قيد الإجراء
 * RTL-friendly, works in dark mode.
 */
const OutcomeFlowChart = ({ wins = 0, losses = 0, loadingCases = 0 }) => {
  const total = wins + losses + loadingCases
  const winPct = total ? ((wins / total) * 100).toFixed(0) : 0
  const lossPct = total ? ((losses / total) * 100).toFixed(0) : 0
  const loadPct = total ? ((loadingCases / total) * 100).toFixed(0) : 0

  const nodes = [
    { key: 'wins', label: 'كسب', value: wins, pct: winPct, color: 'bg-emerald-500', border: 'border-emerald-500', icon: 'thumb_up' },
    { key: 'loading', label: 'قيد الإجراء', value: loadingCases, pct: loadPct, color: 'bg-amber-500', border: 'border-amber-500', icon: 'pending' },
    { key: 'losses', label: 'خسارة', value: losses, pct: lossPct, color: 'bg-red-500', border: 'border-red-500', icon: 'thumb_down' }
  ]

  return (
    <div className="w-full overflow-x-auto" dir="rtl">
      <div className="min-w-[320px] max-w-4xl mx-auto py-4">
        {/* Top: total node */}
        <div className="flex justify-center mb-0">
          <div className="inline-flex flex-col items-center rounded-2xl border-2 border-primary/40 bg-gradient-to-b from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-800/80 px-8 py-5 shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-700/50">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">إجمالي القضايا</span>
            <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">{total}</span>
          </div>
        </div>

        {/* SVG flowchart connectors: trunk down → T-bar → three stems to nodes */}
        <div className="flex justify-center w-full" style={{ height: 52 }}>
          <svg className="w-full h-full" viewBox="0 0 200 52" preserveAspectRatio="xMidYMid meet">
            {/* trunk: center top → down */}
            <line x1="100" y1="0" x2="100" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-400 dark:text-slate-500" />
            {/* T-bar: horizontal */}
            <line x1="16.67" y1="18" x2="183.33" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-400 dark:text-slate-500" />
            {/* stems: wins | loading (center) | losses */}
            <line x1="33.33" y1="18" x2="33.33" y2="52" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <line x1="100" y1="18" x2="100" y2="52" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <line x1="166.67" y1="18" x2="166.67" y2="52" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          </svg>
        </div>

        {/* Three outcome nodes */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mt-0 px-2 -mt-1">
          {nodes.map((n) => (
            <div
              key={n.key}
              className={`
                w-full flex flex-col items-center justify-center rounded-2xl border-2
                ${n.border} bg-white dark:bg-slate-800/95
                shadow-md hover:shadow-xl transition-all duration-200
                min-h-[110px] py-5 px-3 ring-1 ring-slate-200/50 dark:ring-slate-700/50
              `}
            >
              <div className={`${n.color} p-2.5 rounded-xl text-white shadow-sm mb-2`}>
                <span className="material-symbols-outlined text-2xl">{n.icon}</span>
              </div>
              <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{n.value}</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{n.label}</span>
              {total > 0 && (
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.pct}%</span>
              )}
            </div>
          ))}
        </div>

        {/* Proportion bar */}
        {total > 0 && (
          <div className="mt-6 px-2">
            <div className="h-2.5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700 shadow-inner">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${winPct}%` }}
              />
              <div
                className="bg-amber-500 transition-all duration-500"
                style={{ width: `${loadPct}%` }}
              />
              <div
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${lossPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>كسب {winPct}%</span>
              <span>قيد الإجراء {loadPct}%</span>
              <span>خسارة {lossPct}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OutcomeFlowChart
