import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import useStore from '../../store/useStore'
import api from '../../lib/api'

export default function UserDashboard() {
  const { profile } = useStore()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<any[]>([])
  const [docCount, setDocCount] = useState(0)

  useEffect(() => {
    api.get('/chat/sessions').then(r => setSessions((r.data.sessions || []).slice(0, 5))).catch(() => {})
    api.get('/documents/').then(r => setDocCount(r.data.count || 0)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar />
      <div className="ml-[260px] flex flex-col min-h-screen">
        <header className="flex justify-between items-center px-6 py-3 sticky top-0 z-40 bg-background/55 backdrop-blur-md border-b border-border">
          <span className="text-lg font-bold bg-gradient-to-br from-indigo-500 to-violet-600 bg-clip-text text-transparent">ReportMaster AI</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome Banner */}
          <div className="card-elevated p-8">
            <div className="glow-bar-top" />
            <h1 className="font-display text-display text-on-surface mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}</h1>
            <p className="text-on-surface-variant mb-6">Your financial intelligence workspace is ready.</p>
            <button onClick={() => navigate('/chat')} className="btn-primary">
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Ask a Question
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Available Documents */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-[24px]">description</span>
                <span className="label-caps">Available Documents</span>
              </div>
              <span className="font-data-tabular text-display text-on-surface">{docCount}</span>
              <p className="text-on-surface-variant text-sm mt-2">Documents indexed and ready for queries</p>
            </div>

            {/* Recent Sessions */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-[24px]">history</span>
                <span className="label-caps">Recent Conversations</span>
              </div>
              <div className="space-y-2">
                {sessions.map(s => (
                  <button key={s.id} onClick={() => navigate(`/chat?session=${s.id}`)} className="w-full text-left px-3 py-2 rounded hover:bg-surface-container-high transition-colors flex items-center gap-3 border border-transparent hover:border-border">
                    <span className="material-symbols-outlined text-[16px] text-outline">chat_bubble</span>
                    <span className="truncate text-sm text-on-surface-variant hover:text-on-surface">{s.title}</span>
                  </button>
                ))}
                {sessions.length === 0 && <p className="text-on-surface-variant text-sm">No conversations yet. Start chatting!</p>}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
