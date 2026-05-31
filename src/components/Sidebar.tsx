import { Link, useLocation } from 'react-router-dom'
import '../styles/Sidebar.css'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

export default function Sidebar() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userId')
      localStorage.removeItem('firebaseUid')
      window.location.href = '/'
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img 
          src="/logos/cityconnect_horizontal_white.png" 
          alt="CityConnect Logo"
          style={{
            maxWidth: '100%',
            height: 'auto',
            maxHeight: 60,
            objectFit: 'contain',
          }}
        />
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/audit-trail"
              className={`nav-link ${isActive('/audit-trail') ? 'active' : ''}`}
            >
              Audit Trail
            </Link>
          </li>
          <li>
            <Link
              to="/report-verification"
              className={`nav-link ${isActive('/report-verification') ? 'active' : ''}`}
            >
              Report Verification
            </Link>
          </li>
          <li>
            <Link
              to="/user-list"
              className={`nav-link ${isActive('/user-list') ? 'active' : ''}`}
            >
              User List
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </aside>
  )
}
