import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Login.css'
import { findUserByEmail } from '../firebase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      const user = await findUserByEmail(email)
      if (!user) {
        setError('No account found for this email')
        return
      }

      const adminFlag = user.admin
      // admin can be number or string in the DB
      const isAdmin = adminFlag === 1 || adminFlag === '1' || adminFlag === true

      if (!isAdmin) {
        setError('Access denied. Admin privileges required.')
        return
      }

      // At this point user is allowed to login as admin
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userEmail', email)
      localStorage.setItem('userId', user.id ?? '')
      // notify App to re-read login state
      window.dispatchEvent(new Event('authChanged'))
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError('An error occurred while checking account')
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Admin Login</h1>
        <p className="login-subtitle">Welcome to BacoorConnect Admin</p>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <p>Demo Credentials:</p>
          <p>Email: <strong>admin@example.com</strong></p>
          <p>Password: <strong>password123</strong></p>
        </div>
      </div>
    </div>
  )
}
