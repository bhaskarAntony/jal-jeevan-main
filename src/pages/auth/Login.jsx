import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Droplets, Mail, ArrowLeft } from 'lucide-react'

const Login = () => {
  const [step, setStep] = useState('email') // 'email' or 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  
  const { requestLoginOTP, verifyLoginOTP, isAuthenticated, user } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const inputRefs = useRef([])

  const from = location.state?.from?.pathname || getDefaultRoute(user?.role)

  function getDefaultRoute(role) {
    switch (role) {
      case 'super_admin':
        return '/super-admin/dashboard'
      case 'gp_admin':
        return '/gp-admin/dashboard'
      case 'mobile_user':
        return '/biller/dashboard'
      case 'pillar_admin':
        return '/pillar-admin/dashboard'
      default:
        return '/login'
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDefaultRoute(user.role), { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await requestLoginOTP(email)
      
      if (result.success) {
        showSuccess('OTP sent to your email!')
        setStep('otp')
      } else {
        showError(result.message)
      }
    } catch (error) {
      showError('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      showError('Please enter complete OTP')
      return
    }

    setLoading(true)

    try {
      const result = await verifyLoginOTP(email, otpString)
      
      if (result.success) {
        showSuccess('Login successful!')
        navigate(getDefaultRoute(result.user.role), { replace: true })
      } else {
        showError(result.message)
      }
    } catch (error) {
      showError('Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto h-20 w-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg"
            >
              <Droplets className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Verify OTP
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter the 6-digit code sent to {email}
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 space-y-6"
            onSubmit={handleOtpSubmit}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter OTP
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center py-3 text-base"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                'Verify OTP'
              )}
            </motion.button>

            <div className="text-center">
              <button
                onClick={() => setStep('email')}
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Email
              </button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-20 w-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg"
          >
            <Droplets className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Water Management System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-6"
          onSubmit={handleEmailSubmit}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center py-3 text-base"
          >
            {loading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              'Send OTP'
            )}
          </motion.button>
        </motion.form>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login