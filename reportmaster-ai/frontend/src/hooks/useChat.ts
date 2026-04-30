import { useState, useCallback } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

interface ChatSession {
  id: string; user_id: string; title: string; created_at: string; updated_at: string; last_message?: string;
}
interface ChatMessage {
  id: string; session_id: string; user_id: string; role: string; content: string; sources: any[]; created_at: string;
}

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)

  const fetchSessions = useCallback(async () => {
    try {
      const { data } = await api.get('/chat/sessions')
      setSessions(data.sessions || [])
      return data.sessions
    } catch { return [] }
  }, [])

  const fetchMessages = useCallback(async (sessionId: string) => {
    try {
      const { data } = await api.get(`/chat/session/${sessionId}/messages`)
      setMessages(data.messages || [])
      return data
    } catch { return null }
  }, [])

  const createSession = useCallback(async (title?: string) => {
    try {
      const { data } = await api.post('/chat/session', { title })
      await fetchSessions()
      return data.session
    } catch (err: any) {
      toast.error('Failed to create session')
      return null
    }
  }, [fetchSessions])

  const sendQuery = useCallback(async (question: string, sessionId?: string) => {
    setLoading(true)
    try {
      const { data } = await api.post('/chat/query', { question, session_id: sessionId })
      return data
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to get response'
      toast.error(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const sendQueryStream = useCallback(async (
    question: string,
    sessionId: string | null,
    onToken: (token: string) => void,
    onMeta: (meta: any) => void,
    onDone: () => void,
  ) => {
    setStreaming(true)
    try {
      const { data: { session } } = await supabaseSessionCheck()
      const token = session?.access_token
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/chat/query/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ question, session_id: sessionId }),
      })
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) return

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(6))
            if (json.type === 'token') onToken(json.content)
            else if (json.type === 'meta') onMeta(json)
            else if (json.type === 'done') onDone()
          } catch {}
        }
      }
    } catch (err: any) {
      toast.error('Streaming failed')
    } finally {
      setStreaming(false)
    }
  }, [])

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await api.delete(`/chat/session/${sessionId}`)
      await fetchSessions()
      toast.success('Session deleted')
    } catch { toast.error('Failed to delete session') }
  }, [fetchSessions])

  const renameSession = useCallback(async (sessionId: string, title: string) => {
    try {
      await api.patch(`/chat/session/${sessionId}`, { title })
      await fetchSessions()
    } catch { toast.error('Failed to rename session') }
  }, [fetchSessions])

  return { sessions, messages, loading, streaming, fetchSessions, fetchMessages, createSession, sendQuery, sendQueryStream, deleteSession, renameSession, setMessages }
}

async function supabaseSessionCheck() {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  return supabase.auth.getSession()
}
