import { useUser, useClerk } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'
import "./Auth.css"
function AuthComponent() {
  const { user } = useUser()
  const { openSignIn, openSignUp } = useClerk()
  const [authMode, setAuthMode] = useState('local') // 'local' or 'oauth'
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [localUser, setLocalUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)


  const API_URL = import.meta.env.VITE_API_URL


  useEffect(() => {
  const restoreSession = () => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('userData')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        setLocalUser(user)
      } catch (e) {
        // Handle invalid stored data
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
      }
    }
    setIsLoading(false)
  }
  
  restoreSession()
}, [])

// Show loading state while checking for session
if (isLoading) {
  return <div>Loading session...</div>
}
  // Check if user is logged in (either locally or via Clerk)
  if (user || localUser) {
    const displayUser = user || localUser
    return (
      <div style={{ padding: '20px', color: 'white' }}>
        <h2>✅ Logged in as: {displayUser.username || displayUser.email}</h2>
        <p>Auth Type: {user ? 'OAuth (Clerk)' : 'Local Database'}</p>
        <p>Account Role: {displayUser?.role || 'USER'}</p>
        {user && <p>Clerk ID: {user.id}</p>}
        {localUser && <p>Local ID: {localUser.id}</p>}
        <button 
          onClick={async () => {
            if (user) {
              await user.delete()
            }
            localStorage.removeItem('authToken')
            localStorage.removeItem('userData')
            setLocalUser(null)
            window.location.reload()
          }}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>

      </div>
    )
  }

  const handleLocalAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const endpoint = isSignUp ? '/auth/signup' : '/auth/login'
      console.log(`🔄 ${isSignUp ? 'Creating' : 'Logging in'} local account...`)
      
      const requestBody = isSignUp 
        ? { 
            userName: username, 
            email: email,      // Include email only for signup
            password: password
          }
        : {
            username: username,  // Only username and password for login
            password: password
          };
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Local auth successful!', result)
        
        // Store user info locally (you might want to use proper state management)
        setLocalUser({
          id: result.user?.id,
          username: result.user?.userName,
          email: result.user?.email,
          role:  result.user?.role
        })
        
        // Store JWT token if provided
      if (result.token) {
        localStorage.setItem('authToken', result.token)
        localStorage.setItem('userData', JSON.stringify({
          id: result.user?.id,
          username: result.user?.userName,
          email: result.user?.email,
          role: result.user?.role // Store the role for admin checks
        }))
      }
        
      } else {
        const errorText = await response.text()
        console.error('❌ Local auth failed:', errorText)
        setError(`Authentication failed: ${errorText}`)
      }
      
    } catch (error) {
      console.error('❌ Local auth error:', error)
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      {/* Auth Mode Toggle */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button
          onClick={() => setAuthMode('local')}
          style={{
            padding: '8px 16px',
            backgroundColor: authMode === 'local' ? '#007bff' : 'transparent',
            color: authMode === 'local' ? 'white' : '#007bff',
            border: '1px solid #007bff',
            borderRadius: '4px 0 0 4px',
            cursor: 'pointer'
          }}
        >
          Local Account
        </button>
        <button
          onClick={() => setAuthMode('oauth')}
          style={{
            padding: '8px 16px',
            backgroundColor: authMode === 'oauth' ? '#007bff' : 'transparent',
            color: authMode === 'oauth' ? 'white' : '#007bff',
            border: '1px solid #007bff',
            borderRadius: '0 4px 4px 0',
            cursor: 'pointer'
          }}
        >
          OAuth (Google, GitHub, etc.)
        </button>
      </div>

      {authMode === 'local' ? (
        <form onSubmit={handleLocalAuth}>
          <h2 style={{ color: 'white' }}>
            {isSignUp ? '📝 Create Local Account' : '🔑 Local Sign In'}
          </h2>
          
          {error && (
            <div style={{ 
              color: '#ff6b6b', 
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: '#ffe0e0',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          {isSignUp && (
            <div style={{ marginBottom: '10px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontSize: '14px'
                }}
              />
            </div>
          )}
          
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px'
              }}
            />
          </div>
          
          
          <div style={{ marginBottom: '15px' }}>
            <input
              type="password"
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={{ 
                width: '100%', 
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px'
              }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: loading ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
          
          <button 
            type="button" 
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setEmail('')
              setPassword('')
              setUsername('')
            }}
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginTop: '10px',
              backgroundColor: 'transparent',
              border: '1px solid #28a745',
              color: '#28a745',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </form>
      ) : (

        <div>
          <h2 style={{ color: 'white', textAlign: 'center' }}>🔗 OAuth Sign In</h2>
          
          <button
            onClick={() => openSignUp()}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🚀 Sign Up with OAuth
          </button>
          
          <button
            onClick={() => openSignIn()}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'transparent',
              border: '1px solid #007bff',
              color: '#007bff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔑 Sign In with OAuth
          </button>
          
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: '#e7f3ff', 
            borderRadius: '4px',
            border: '1px solid #b3d9ff'
          }}>
            <p style={{ color: '#0066cc', fontSize: '12px', margin: 0 }}>
              OAuth will open a popup with Google, GitHub, or other providers. 
              Your account will be managed by Clerk.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuthComponent