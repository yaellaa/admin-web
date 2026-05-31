import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import AdminLogs from './components/AdminLogs'
import UserLogs from './components/UserLogs'
import AuditTrail from './components/AuditTrail'
import ReportVerification from './components/ReportVerification'
import UserList from './components/UserList'
import Profile from './components/Profile'
import AdminLayout from './components/AdminLayout'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() =>
    localStorage.getItem('isLoggedIn') === 'true'
  )

  useEffect(() => {
    const handler = () => setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true')
    window.addEventListener('authChanged', handler)
    return () => window.removeEventListener('authChanged', handler)
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />

        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="audit-trail" element={<AuditTrail />} />
          <Route path="report-verification" element={<ReportVerification />} />
          <Route path="user-list" element={<UserList />} />
          <Route path="users" element={<Dashboard />} />
          <Route path="orders" element={<Dashboard />} />
          <Route path="analytics" element={<Dashboard />} />
          <Route path="settings" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
