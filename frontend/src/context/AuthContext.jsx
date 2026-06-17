// eslint-disable-next-line react-refresh/only-export-components
/**
 * TellEye — Auth Context
 * Stores the JWT token + current user in React state.
 * Persists to localStorage so login survives page refresh.
 */

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)


const API = 'https://telleye-production.up.railway.app/api'

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem('telleye_token') || null)
  const [user,  setUser]    = useState(() => {
    const u = localStorage.getItem('telleye_user')
    return u ? JSON.parse(u) : null
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // ── Set axios default header whenever token changes ──
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // ── Login ──────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password })
      // Store token + user info
      setToken(data.access_token)
      setUser({
        full_name:      data.full_name,
        role:           data.role,
        institution_id: data.institution_id,
      })
      localStorage.setItem('telleye_token', data.access_token)
      localStorage.setItem('telleye_user', JSON.stringify({
        full_name:      data.full_name,
        role:           data.role,
        institution_id: data.institution_id,
      }))
      return { ok: true, redirect_to: data.redirect_to, role: data.role }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erreur de connexion.'
      setError(msg)
      return { ok: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  // ── Logout ─────────────────────────────────────────
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('telleye_token')
    localStorage.removeItem('telleye_user')
    delete axios.defaults.headers.common['Authorization']
  }

  // ── Helpers ────────────────────────────────────────
  const isAuthenticated = !!token
  const isAdmin       = user?.role === 'admin'
  const isInstitution = user?.role === 'institution'
  const isFarmer      = user?.role === 'farmer'

  return (
    <AuthContext.Provider value={{
      token, user, loading, error,
      login, logout,
      isAuthenticated, isAdmin, isInstitution, isFarmer,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}