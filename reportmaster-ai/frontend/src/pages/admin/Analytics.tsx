import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../lib/api'

export default function Analytics() {
  const periods = ['24h', '7d', '30d'] as const
  type Period = typeof periods[number]

  const [period, setPeriod] = useState<Period>('7d')
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api.get('/admin/analytics', { params: { period } })
      .then(r => { if (!cancelled) setStats(r.data) })
      .catch((err) => {
        const msg = err?.response?.data?.detail || err?.message || 'Failed to load analytics'
        if (!cancelled) setError(msg)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [period])

  const metrics = [
    { label: 'Total Queries', value: stats.total_queries || 0, icon: 'search_insights', trend: '+12.5%' },
    { label: 'Avg Response Time', value: '1.2s', icon: 'timer', trend: '-0.3s' },
    { label: 'Active Users', value: stats.total_users || 0, icon: 'group', trend: '+5.2%' },
    { label: 'Doc Processing Rate', value: '99.8%', icon: 'document_scanner', trend: '0.0%' },
  ]

  const barData = useMemo(() => (
    stats.queries_per_day ? stats.queries_per_day.map((d: any) => d.count) : [0, 0, 0, 0, 0, 0, 0]
  ), [stats])
  const days = useMemo(() => (
    stats.queries_per_day ? stats.queries_per_day.map((d: any) => d.day) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  ), [stats])

  const barHeights = useMemo(() => {
    const maxCount = Math.max(...barData, 1)
    return barData.map((c: number) => (c / maxCount) * 100)
  }, [barData])

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar isAdmin />
      <div className="ml-[260px] flex flex-col min-h-screen">
        <header className="flex justify-between items-center px-6 py-3 sticky top-0 z-40 bg-background/55 backdrop-blur-md border-b border-border">
          <span className="text-lg font-bold bg-gradient-to-br from-indigo-500 to-violet-600 bg-clip-text text-transparent">ReportMaster AI</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-display text-on-surface">Analytics & Insights</h1>
              <p className="text-on-surface-variant mt-1">System-wide performance and query metrics.</p>
            </div>
            <div className="flex items-center gap-1 bg-surface-container rounded p-1 border border-border">
              {periods.map((t) => (
                <button
                  key={t}
                  onClick={() => setPeriod(t)}
                  className={`px-3 py-1 text-sm font-medium rounded-sm transition-colors ${period === t ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="card-elevated p-4 text-sm text-on-surface-variant">
              Failed to load analytics: <span className="text-on-surface">{error}</span>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {metrics.map(m => (
              <div key={m.label} className="card-elevated p-4 group hover:bg-surface-container transition-colors">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-3">
                  <span className="label-caps">{m.label}</span>
                  <span className="material-symbols-outlined text-indigo-400 text-[20px]">{m.icon}</span>
                </div>
                <div className="font-display text-display text-on-surface mb-1">{m.value}</div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-emerald-400 text-[14px]">trending_up</span>
                  <span className="font-data-tabular text-emerald-400 text-xs">{m.trend}</span>
                  <span className="text-xs text-on-surface-variant ml-1">vs last period</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="card-elevated p-6">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/20" />
            <h3 className="font-heading text-on-surface text-lg mb-6">Queries per Day</h3>
            <div className="h-64 flex items-end justify-between gap-2 border-b border-border pb-2">
              {barHeights.map((h: number, i: number) => (
                <div key={i} className={`w-full rounded-t-sm transition-colors border-t group relative ${i === barHeights.length - 1 ? 'bg-indigo-500/80 hover:bg-indigo-500 border-indigo-300' : 'bg-indigo-500/20 hover:bg-indigo-500/40 border-indigo-500'}`} style={{ height: `${h}%`, minHeight: '4px' }}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface text-on-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{barData[i]}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 font-data-tabular text-[10px] text-on-surface-variant">
              {days.map((d: string, i: number) => <span key={`${d}-${i}`} className={i === days.length - 1 ? 'text-indigo-400 font-bold' : ''}>{d}</span>)}
            </div>
          </div>

          {/* Top Questions */}
          <div className="card-elevated overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-surface-tint/20" />
            <div className="p-6 border-b border-border">
              <h3 className="font-heading text-on-surface text-lg">Most Asked Questions</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase border-b border-border">
                  <th className="p-4">Question</th>
                  <th className="p-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && (
                  <tr><td colSpan={2} className="p-8 text-center text-on-surface-variant">Loading analytics…</td></tr>
                )}
                {!loading && (stats.top_questions || []).map((q: any, i: number) => (
                  <tr key={i} className="hover:bg-[#1E2333] transition-colors">
                    <td className="p-4 max-w-md truncate text-on-surface">{q.content}</td>
                    <td className="p-4 text-right font-data-tabular text-on-surface-variant">{new Date(q.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!loading && (!stats.top_questions || stats.top_questions.length === 0) && (
                  <tr><td colSpan={2} className="p-8 text-center text-on-surface-variant">No queries yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}
