import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import ChatInterface from '../../components/ChatInterface'
import { useChat } from '../../hooks/useChat'
import useStore from '../../store/useStore'


export default function ChatPage() {
  const { profile } = useStore()
  const { sessions, fetchSessions, deleteSession, renameSession } = useChat()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeSessionId, setActiveSessionId] = useState<string | null>(searchParams.get('session'))
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const isAdmin = profile?.role === 'admin'

  useEffect(() => { fetchSessions() }, [])

  const handleNewChat = async () => {
    setActiveSessionId(null)
  }

  const handleSessionClick = (id: string) => {
    setActiveSessionId(id)
    setSearchParams({ session: id })
  }

  const handleSessionCreated = (id: string) => {
    setActiveSessionId(id)
    setSearchParams({ session: id })
    fetchSessions()
  }

  const handleRename = async (id: string) => {
    if (editTitle.trim()) {
      await renameSession(id, editTitle.trim())
    }
    setEditingId(null)
  }

  // Group sessions by date
  const groupSessions = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86400000)
    const lastWeek = new Date(today.getTime() - 7 * 86400000)

    const groups: { label: string; items: typeof sessions }[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'Last 7 Days', items: [] },
      { label: 'Older', items: [] },
    ]

    const filtered = sessions.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
    for (const s of filtered) {
      const d = new Date(s.updated_at || s.created_at)
      if (d >= today) groups[0].items.push(s)
      else if (d >= yesterday) groups[1].items.push(s)
      else if (d >= lastWeek) groups[2].items.push(s)
      else groups[3].items.push(s)
    }

    return groups.filter(g => g.items.length > 0)
  }

  return (
    <div className="h-screen w-full bg-transparent overflow-hidden">
      <Sidebar isAdmin={isAdmin} />

      <div className="h-full ml-[260px] flex">
        {/* Chat Sessions Sidebar */}
        <aside className="w-[300px] flex-shrink-0 bg-surface border-r border-border flex flex-col h-full">
          <div className="p-4 space-y-4">
            <button onClick={handleNewChat} className="w-full btn-primary">
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Chat
            </button>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sessions..." className="input-field pl-9 py-2 text-sm" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-6">
            {groupSessions().map(group => (
              <div key={group.label} className="space-y-1">
                <h3 className="px-3 py-1 font-label-caps text-label-caps text-outline uppercase tracking-wider">{group.label}</h3>
                {group.items.map(s => (
                  <div key={s.id} className="relative group">
                    {editingId === s.id ? (
                      <div className="px-3 py-2">
                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)} onBlur={() => handleRename(s.id)} onKeyDown={e => e.key === 'Enter' && handleRename(s.id)} className="input-field text-sm py-1 px-2" autoFocus />
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSessionClick(s.id)}
                        className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition-colors ${
                          activeSessionId === s.id
                            ? 'bg-surface-container-high border border-border'
                            : 'hover:bg-surface-container border border-transparent hover:border-border'
                        }`}
                      >
                        {activeSessionId === s.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-inverse-primary" />}
                        <span className={`material-symbols-outlined text-[16px] ${activeSessionId === s.id ? 'text-inverse-primary' : 'text-outline group-hover:text-on-surface'}`}>chat_bubble</span>
                        <span className={`truncate text-sm ${activeSessionId === s.id ? 'font-medium text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface'}`}>{s.title}</span>
                      </button>
                    )}
                    {/* Hover actions */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setEditingId(s.id); setEditTitle(s.title) }} className="p-1 text-outline hover:text-on-surface">
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteSession(s.id); if (activeSessionId === s.id) setActiveSessionId(null) }} className="p-1 text-outline hover:text-error">
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="px-4 py-8 text-center text-on-surface-variant text-sm">No conversations yet</div>
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-transparent min-w-0">
          <header className="h-[60px] border-b border-border bg-background/50 backdrop-blur-md flex items-center px-8 justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <h1 className="font-heading text-heading text-on-surface truncate">
                {activeSessionId ? sessions.find(s => s.id === activeSessionId)?.title || 'Chat' : 'New Conversation'}
              </h1>
              {activeSessionId && (
                <div className="bg-surface-container border border-border rounded px-2 py-1 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  <span className="font-label-caps text-label-caps text-outline uppercase">Active Session</span>
                </div>
              )}
            </div>
          </header>
          <ChatInterface sessionId={activeSessionId} onSessionCreated={handleSessionCreated} />
        </main>
      </div>
    </div>
  )
}
