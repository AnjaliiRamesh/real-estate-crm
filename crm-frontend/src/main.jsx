import { StrictMode }                         from 'react'
import { createRoot }                         from 'react-dom/client'
import { BrowserRouter, Routes, Route }       from 'react-router-dom'
import { AuthProvider }                       from './AuthContext'
import ProtectedRoute                         from './ProtectedRoute'
import App        from './App.jsx'
import Properties from './Properties.jsx'
import Deals      from './Deals.jsx'
import Login      from './Login.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute><App /></ProtectedRoute>
          }/>
          <Route path="/properties" element={
            <ProtectedRoute><Properties /></ProtectedRoute>
          }/>
          <Route path="/deals" element={
            <ProtectedRoute><Deals /></ProtectedRoute>
          }/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)