interface Props {
  user: { id: string; email: string; full_name?: string; role: string; created_at?: string }
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  showActions?: boolean
}

export default function UserCard({ user, onApprove, onReject, showActions = true }: Props) {
  const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase()

  return (
    <div className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 card-elevated border-l-2 border-l-tertiary hover:bg-surface-container transition-colors gap-4 md:gap-0">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-tertiary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-surface-container-highest border border-border flex items-center justify-center text-sm font-bold text-on-surface flex-shrink-0">
          {initials}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-[16px] text-on-surface">{user.full_name || 'Unknown'}</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-label-caps bg-tertiary/10 text-tertiary border border-tertiary/20 uppercase tracking-widest">
              {user.role}
            </span>
          </div>
          <span className="font-body text-[14px] text-on-surface-variant">{user.email}</span>
          {user.created_at && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="material-symbols-outlined text-[14px] text-outline">schedule</span>
              <span className="font-label-caps text-[11px] text-outline uppercase">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {showActions && (
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {onReject && (
            <button onClick={() => onReject(user.id)} className="btn-danger flex-1 md:flex-none">
              <span className="material-symbols-outlined text-[16px]">close</span>
              Reject
            </button>
          )}
          {onApprove && (
            <button onClick={() => onApprove(user.id)} className="btn-approve flex-1 md:flex-none">
              <span className="material-symbols-outlined text-[16px]">check</span>
              Approve
            </button>
          )}
        </div>
      )}
    </div>
  )
}
