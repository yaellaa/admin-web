import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import '../styles/Dashboard.css'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (!isLoggedIn) navigate('/')

    const email = localStorage.getItem('userEmail')
    if (email) setUserEmail(email)
  }, [navigate])

  return (
    <div className="admin-container">
      <Sidebar />
      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>CityConnect Admin</h1>
          </div>
          <div className="header-right">
            <Link to="/profile" className="user-info user-info-link">
              {userEmail || 'Profile'}
            </Link>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}
