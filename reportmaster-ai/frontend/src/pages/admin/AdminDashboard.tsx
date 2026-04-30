import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({ total_docs: 0, total_users: 0, pending_approvals: 0, total_queries: 0 })
  const [recentDocs, setRecentDocs] = useState<any[]>([])

  useEffect(() => {
    api.get('/admin/analytics').then(r => setStats(r.data)).catch(() => {})
    api.get('/documents/').then(r => setRecentDocs((r.data.documents || []).slice(0, 5))).catch(() => {})
  }, [])

  const metrics = [
    { label: 'Total Docs', value: stats.total_docs, icon: 'description' },
    { label: 'Active Users', value: stats.total_users, icon: 'group' },
    { label: 'Pending Approvals', value: stats.pending_approvals, icon: 'pending_actions', amber: true },
    { label: 'Total Queries', value: stats.total_queries, icon: 'search' },
  ]

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar isAdmin />
      <div className="ml-[260px] flex flex-col min-h-screen">
        <header className="flex justify-between items-center px-6 py-3 sticky top-0 z-40 bg-background/55 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold bg-gradient-to-br from-indigo-500 to-violet-600 bg-clip-text text-transparent">ReportMaster AI</span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface">Dashboard</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h1 className="font-display text-display text-on-surface">Overview</h1>
              <p className="text-on-surface-variant mt-1">Real-time system metrics and pending actions.</p>
            </div>
            <div className="flex items-center gap-2 font-data-tabular text-data-tabular text-outline">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /><span>System Operational</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map(m => (
              <div key={m.label} className={`card p-4 flex flex-col justify-between h-32 hover:bg-[#1E2333]/50 transition-colors group ${m.amber ? 'border-t-2 !border-t-tertiary-container' : ''}`}>
                <div className="flex justify-between items-start">
                  {m.amber && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-tertiary-container animate-amber-pulse" /><span className="label-caps">{m.label}</span></div>}
                  {!m.amber && <span className="label-caps">{m.label}</span>}
                  <span className={`material-symbols-outlined text-[20px] ${m.amber ? 'text-tertiary-container' : 'text-outline group-hover:text-primary transition-colors'}`}>{m.icon}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-data-tabular text-display text-on-surface">{m.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Documents */}
          <div className="card flex flex-col">
            <div className="p-4 border-b border-border bg-surface-container-high/50 flex justify-between items-center rounded-t-lg">
              <h2 className="label-caps text-on-surface">Recent Documents</h2>
            </div>
            <div className="divide-y divide-border">
              {recentDocs.map(doc => (
                <div key={doc.id} className="p-4 hover:bg-[#1E2333]/30 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center border border-border">
                      <span className="material-symbols-outlined text-outline text-[20px]">description</span>
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{doc.file_name}</p>
                      <p className="font-data-tabular text-[12px] text-on-surface-variant">{doc.chunk_count} chunks</p>
                    </div>
                  </div>
                  <span className="status-chip status-active">Active</span>
                </div>
              ))}
              {recentDocs.length === 0 && <div className="p-8 text-center text-on-surface-variant">No documents uploaded yet.</div>}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
