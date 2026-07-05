import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider, useAppContext } from './context/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DonorDashboardPage from './pages/DonorDashboardPage'
import NgoDashboardPage from './pages/NgoDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

function AppRoutes() {
  const { currentUser } = useAppContext()

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={currentUser ? <Navigate to={`/dashboard/${currentUser.role}`} replace /> : <LoginPage />} />
      <Route path="/register" element={currentUser ? <Navigate to={`/dashboard/${currentUser.role}`} replace /> : <RegisterPage />} />
      <Route path="/dashboard/donor" element={<ProtectedRoute allowedRoles={['donor']}><DonorDashboardPage /></ProtectedRoute>} />
      <Route path="/dashboard/ngo" element={<ProtectedRoute allowedRoles={['ngo']}><NgoDashboardPage /></ProtectedRoute>} />
      <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
