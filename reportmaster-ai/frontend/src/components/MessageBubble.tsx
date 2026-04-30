interface Props {
  role: 'user' | 'assistant'
  content: string
  sources?: any[]
  timestamp?: string
}

export default function MessageBubble({ role, content, timestamp }: Props) {
  if (role === 'user') {
    return (
      <div className="flex justify-end w-full">
        <div className="max-w-[75%] flex flex-col items-end gap-1">
          <div className="bg-inverse-primary text-white border-t border-primary-fixed/30 rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-sm">
            <p className="font-body text-body leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
          {timestamp && <span className="text-[11px] font-label-caps text-outline-variant pr-1">{timestamp}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start w-full gap-4">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded flex-shrink-0 bg-surface-container-highest border border-border flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 w-full h-[2px] bg-inverse-primary shadow-[0_0_8px_rgba(73,75,214,0.8)]" />
        <span className="material-symbols-outlined text-[18px] text-inverse-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
      </div>
      <div className="max-w-[80%] flex flex-col items-start gap-2">
        <div className="bg-surface-container border border-border rounded-2xl rounded-tl-sm p-5 shadow-sm relative overflow-hidden">
          <div className="glow-bar-top" />
          <p className="font-body text-body text-on-surface leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
        {timestamp && <span className="text-[11px] font-label-caps text-outline-variant pl-1">{timestamp}</span>}
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start w-full gap-4">
      <div className="w-8 h-8 rounded flex-shrink-0 bg-surface-container-highest border border-border flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 w-full h-[2px] bg-inverse-primary shadow-[0_0_8px_rgba(73,75,214,0.8)]" />
        <span className="material-symbols-outlined text-[18px] text-inverse-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
      </div>
      <div className="bg-surface-container border border-border rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-outline animate-typing-dot" />
        <div className="w-1.5 h-1.5 rounded-full bg-outline animate-typing-dot" style={{ animationDelay: '0.2s' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-outline animate-typing-dot" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  )
}
