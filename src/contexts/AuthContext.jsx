import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile')
      setUser(response.data.data)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const requestLoginOTP = async (email) => {
    try {
      const response = await api.post('/auth/request-otp', { email })
      return { success: true, message: response.data.message, email }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send OTP'
      }
    }
  }

  const verifyLoginOTP = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-login-otp', { email, otp })
      const { token: newToken, user: userData } = response.data.data
      
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return { success: true, user: userData }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Invalid OTP'
      }
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return { success: true, message: response.data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send OTP' 
      }
    }
  }

  const verifyOTP = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp })
      return { success: true, message: response.data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Invalid OTP' 
      }
    }
  }

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      })
      return { success: true, message: response.data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to reset password' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete api.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    loading,
    requestLoginOTP,
    verifyLoginOTP,
    forgotPassword,
    verifyOTP,
    logout,
    resetPassword,
    isAuthenticated: !!user,
    isRole: (role) => user?.role === role
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}