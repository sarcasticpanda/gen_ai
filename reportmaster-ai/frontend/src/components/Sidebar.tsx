import { NavLink, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { useAuth } from '../hooks/useAuth'

interface SidebarProps {
  isAdmin?: boolean
}

export default function Sidebar({ isAdmin = false }: SidebarProps) {
  const { profile } = useStore()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const adminLinks = [
    { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/admin/documents', icon: 'description', label: 'Documents' },
    { to: '/admin/approvals', icon: 'group', label: 'Approvals' },
    { to: '/admin/chat', icon: 'chat', label: 'Chat' },
    { to: '/admin/analytics', icon: 'monitoring', label: 'Analytics' },
  ]

  const userLinks = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/chat', icon: 'chat', label: 'Chat' },
  ]

  const links = isAdmin ? adminLinks : userLinks

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="fixed left-0 top-0 h-full w-[260px] border-r border-border bg-background/55 backdrop-blur-xl flex flex-col py-6 px-4 space-y-2 z-50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-inner shadow-white/20">
          RM
        </div>
        <div className="flex flex-col">
          <span className="font-heading text-sm font-semibold text-on-surface tracking-tight">ReportMaster AI</span>
          <span className="text-[10px] text-outline uppercase font-bold tracking-wider">
            Institutional Grade
            {isAdmin && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] bg-primary-container/20 text-primary border border-primary/30">Admin</span>
            )}
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
          >
            <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Bottom */}
      <div className="pt-4 border-t border-border space-y-2">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-border flex items-center justify-center text-xs font-bold text-on-surface">
            {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs font-medium text-on-surface truncate">{profile?.full_name || 'User'}</span>
            <span className="text-[10px] text-outline truncate">{profile?.email}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="nav-link w-full">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  )
}
