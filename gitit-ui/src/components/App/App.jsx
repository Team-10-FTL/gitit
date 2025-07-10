import { useState } from 'react'
import AuthComponent from '../Auth/Auth'
import './App.css'
import reactLogo from '../../assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
{/* Add the Auth component for testing */}
      <div className="auth">
        <AuthComponent />
      </div>
    </>
  )
}

export default App
