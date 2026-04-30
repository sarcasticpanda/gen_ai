import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import ChatInterface from '../../components/ChatInterface'

export default function AdminChat() {
  const [sessionId, setSessionId] = useState<string | null>(null)

  return (
    <div className="h-screen w-full bg-transparent overflow-hidden">
      <Sidebar isAdmin />
      <div className="ml-[260px] flex flex-col h-full">
        <header className="h-[60px] border-b border-border bg-background/50 backdrop-blur-md flex items-center px-6 justify-between flex-shrink-0">
          <h1 className="font-heading text-heading text-on-surface">Admin Chat</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="font-label-caps text-label-caps text-outline uppercase">Active</span>
          </div>
        </header>
        <ChatInterface sessionId={sessionId} onSessionCreated={setSessionId} />
      </div>
    </div>
  )
}
