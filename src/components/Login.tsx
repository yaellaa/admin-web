import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Login.css'
import { findUserByEmail, auth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

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

      const adminFlag = user.adsmin
      // admin can be number or string in the DB
      const isAdmin = adminFlag === 1 || adminFlag === '1' || adminFlag === true

      if (!isAdmin) {
        setError('Access denied. Admin privileges required.')
        return
      }

      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userEmail', email)
      localStorage.setItem('userId', user.id ?? '')
      localStorage.setItem('firebaseUid', userCredential.user.uid)
      // notify App to re-read login state
      window.dispatchEvent(new Event('authChanged'))
      navigate('/dashboard')
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else {
        setError('An error occurred while checking account')
      }
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <img 
          src="/logos/cityconnect_horizontal_blue.png" 
          alt="CityConnect Logo"
          className="login-logo"
        />
        <p className="login-subtitle"></p>
        
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
              autocomplete="email"
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
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
