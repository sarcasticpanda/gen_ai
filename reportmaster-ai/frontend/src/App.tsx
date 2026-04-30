import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import AppBackground from './components/ui/app-background'

import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PendingPage from './pages/PendingPage'
import ProtectedRoute from './components/ProtectedRoute'

import AdminDashboard from './pages/admin/AdminDashboard'
import DocumentManager from './pages/admin/DocumentManager'
import UserApprovals from './pages/admin/UserApprovals'
import AdminChat from './pages/admin/AdminChat'
import Analytics from './pages/admin/Analytics'

import UserDashboard from './pages/user/UserDashboard'
import ChatPage from './pages/user/ChatPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen isolate lab-bg">
        <AppBackground />
        <div className="relative z-10 min-h-screen">
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1f1f27',
                color: '#e4e1ed',
                border: '1px solid #1E2333',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
              },
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/pending" element={<ProtectedRoute requireApproved={false}><PendingPage /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/documents" element={<ProtectedRoute requireAdmin><DocumentManager /></ProtectedRoute>} />
            <Route path="/admin/approvals" element={<ProtectedRoute requireAdmin><UserApprovals /></ProtectedRoute>} />
            <Route path="/admin/chat" element={<ProtectedRoute requireAdmin><AdminChat /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><Analytics /></ProtectedRoute>} />

            {/* User routes */}
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

            {/* Redirect root */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
