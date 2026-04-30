import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import UserCard from '../../components/UserCard'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function UserApprovals() {
  const [users, setUsers] = useState<any[]>([])
  const [tab, setTab] = useState<'pending' | 'approved' | 'all'>('pending')

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users/all')
      setUsers(data.users || [])
    } catch {}
  }

  useEffect(() => { fetchUsers() }, [])

  const pending = users.filter(u => u.role === 'pending' && !u.is_approved)
  const approved = users.filter(u => u.is_approved)
  const displayed = tab === 'pending' ? pending : tab === 'approved' ? approved : users

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/admin/users/${id}/approve`)
      toast.success('User approved')
      fetchUsers()
    } catch { toast.error('Failed to approve') }
  }

  const handleReject = async (id: string) => {
    try {
      await api.post(`/admin/users/${id}/reject`)
      toast.success('User rejected')
      fetchUsers()
    } catch { toast.error('Failed to reject') }
  }

  const handleBulkApprove = async () => {
    for (const u of pending) { await handleApprove(u.id) }
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar isAdmin />
      <div className="ml-[260px] flex flex-col min-h-screen">
        <header className="flex justify-between items-center px-6 py-3 sticky top-0 z-40 bg-background/55 backdrop-blur-md border-b border-border">
          <span className="text-lg font-bold bg-gradient-to-br from-indigo-500 to-violet-600 bg-clip-text text-transparent">ReportMaster AI</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-4">
              <h1 className="font-display text-display text-on-surface">User Management</h1>
              <div className="inline-flex bg-surface-container border border-border p-1 rounded-lg">
                {(['pending', 'approved', 'all'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md font-label-caps text-label-caps transition-colors flex items-center gap-2 ${tab === t ? 'bg-surface-container-highest text-on-surface shadow-sm border border-border/50' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                    <span className="text-[10px] tabular-nums text-outline">{t === 'pending' ? pending.length : t === 'approved' ? approved.length : users.length}</span>
                  </button>
                ))}
              </div>
            </div>
            {pending.length > 0 && (
              <button onClick={handleBulkApprove} className="btn-primary">
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                Approve All Pending
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 max-w-5xl">
            {displayed.map(u => (
              <UserCard key={u.id} user={u} onApprove={u.role === 'pending' ? handleApprove : undefined} onReject={u.role === 'pending' ? handleReject : undefined} showActions={u.role === 'pending'} />
            ))}
            {displayed.length === 0 && (
              <div className="card p-12 text-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-4 block">group</span>
                <h3 className="font-heading text-heading text-on-surface mb-2">No users found</h3>
                <p className="text-on-surface-variant">{tab === 'pending' ? 'No pending approvals. All caught up!' : 'No users match this filter.'}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
