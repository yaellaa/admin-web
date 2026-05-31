import { Link, useLocation } from 'react-router-dom'
import '../styles/Sidebar.css'

export default function Sidebar() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userEmail')
    window.location.href = '/'
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>BacoorConnect</h2>
        <p className="sidebar-subtitle">Admin Panel</p>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/audit-trail"
              className={`nav-link ${isActive('/audit-trail') ? 'active' : ''}`}
            >
              🧾 Audit Trail
            </Link>
          </li>
          <li>
            <Link
              to="/report-verification"
              className={`nav-link ${isActive('/report-verification') ? 'active' : ''}`}
            >
              ✅ Report Verification
            </Link>
          </li>
          <li>
            <Link
              to="/user-list"
              className={`nav-link ${isActive('/user-list') ? 'active' : ''}`}
            >
              👥 User List
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}
