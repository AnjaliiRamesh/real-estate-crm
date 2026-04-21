import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user,  setUser]  = useState(null)

  function login(newToken, newUser) {
    setToken(newToken)
    setUser(newUser)
    // attach token to every future axios request automatically
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  function logout() {
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}