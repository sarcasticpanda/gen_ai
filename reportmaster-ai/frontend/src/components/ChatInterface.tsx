import { useState, useRef, useEffect } from 'react'
import MessageBubble, { TypingIndicator } from './MessageBubble'
import { useChat } from '../hooks/useChat'
import useStore from '../store/useStore'
import { Command, Loader, Paperclip, Send } from 'lucide-react'

interface Props {
  sessionId: string | null
  onSessionCreated?: (id: string) => void
}

export default function ChatInterface({ sessionId, onSessionCreated }: Props) {
  const { profile } = useStore()
  const { messages, loading, streaming, fetchMessages, sendQuery, setMessages } = useChat()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = '0px'
    const next = Math.min(el.scrollHeight, 200)
    el.style.height = `${Math.max(next, 60)}px`
  }

  useEffect(() => {
    if (sessionId) fetchMessages(sessionId)
    else setMessages([])
  }, [sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    autoResize()
  }, [input])

  const handleSend = async () => {
    if (!input.trim() || loading || streaming) return
    const question = input.trim()
    setInput('')

    // Optimistic user message
    const userMsg = { id: 'temp-user', session_id: sessionId || '', user_id: profile?.id || '', role: 'user', content: question, sources: [], created_at: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg as any])
    setIsTyping(true)

    try {
      const result = await sendQuery(question, sessionId || undefined)
      if (result) {
        if (!sessionId && result.session_id) onSessionCreated?.(result.session_id)
        // Add assistant message
        const assistantMsg = { id: 'temp-assistant', session_id: result.session_id, user_id: profile?.id || '', role: 'assistant', content: result.answer, sources: result.sources, created_at: new Date().toISOString() }
        setMessages(prev => [...prev.filter(m => m.id !== 'temp-user'), userMsg as any, assistantMsg as any])
      }
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    catch { return '' }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {messages.length === 0 && !isTyping && (
          <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="w-16 h-16 rounded-xl bg-surface-container border border-border flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[32px] text-inverse-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            </div>
            <h2 className="font-heading text-heading text-on-surface mb-2">Ask anything about your documents</h2>
            <p className="text-on-surface-variant text-sm max-w-md text-center">Query your financial reporting documents with AI-powered intelligence. All responses are grounded in your uploaded data.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id || i}
            role={msg.role as 'user' | 'assistant'}
            content={msg.content}
            sources={msg.sources}
            timestamp={formatTime(msg.created_at)}
          />
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-transparent z-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative backdrop-blur-2xl bg-surface-container/25 rounded-2xl border border-white/[0.06] shadow-2xl">
            <div className="p-4">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                rows={1}
                className="w-full bg-transparent border-none focus:ring-0 resize-none px-2 py-3 text-body text-on-surface placeholder:text-on-surface-variant/50 max-h-[200px] overflow-y-auto min-h-[60px]"
                disabled={loading || streaming}
              />
            </div>

            <div className="p-4 pt-0 flex items-center justify-between gap-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => textareaRef.current?.focus()}
                  className="p-2 rounded-lg text-on-surface-variant/60 hover:text-on-surface transition-colors"
                  aria-label="Attach"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => textareaRef.current?.focus()}
                  className="p-2 rounded-lg text-on-surface-variant/60 hover:text-on-surface transition-colors"
                  aria-label="Commands"
                >
                  <Command className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleSend}
                disabled={!input.trim() || loading || streaming}
                className={
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 " +
                  (input.trim() && !(loading || streaming)
                    ? "bg-white text-inverse-on-surface shadow-lg shadow-white/10"
                    : "bg-white/[0.06] text-white/40")
                }
                type="button"
              >
                {loading || streaming ? (
                  <Loader className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send</span>
              </button>
            </div>
          </div>
          <div className="text-center mt-3">
            <span className="text-[11px] font-label-caps text-outline tracking-wide">ReportMaster AI can make mistakes. Verify critical financial data.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
