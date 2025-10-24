import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { SignIn, SignUp, useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { userAPI } from './services/api'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ApiKeys from './pages/ApiKeys'
import Templates from './pages/Templates'
import Navbar from './components/Navbar'

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />
  }

  return children
}

function AppContent() {
  const { user, isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    // Call auth callback when user signs in
    if (isSignedIn && user && isLoaded) {
      console.log('User signed in:', user.id)
      userAPI.authCallback(user.id)
        .then(() => console.log('User initialized in backend'))
        .catch(err => console.error('Auth callback failed:', err))
    }
  }, [isSignedIn, user, isLoaded])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route 
          path="/sign-in/*" 
          element={
            <div className="flex items-center justify-center min-h-screen">
              <SignIn routing="path" path="/sign-in" />
            </div>
          } 
        />
        <Route 
          path="/sign-up/*" 
          element={
            <div className="flex items-center justify-center min-h-screen">
              <SignUp routing="path" path="/sign-up" />
            </div>
          } 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/api-keys"
          element={
            <ProtectedRoute>
              <Navbar />
              <ApiKeys />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <Navbar />
              <Templates />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

function App() {
  return <AppContent />
}

export default App
