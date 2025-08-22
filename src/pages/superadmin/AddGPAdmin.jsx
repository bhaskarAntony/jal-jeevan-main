import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { superAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ArrowLeft, User, Eye, EyeOff } from 'lucide-react'

const AddGPAdmin = () => {
  const { id } = useParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
  })
  const [errors, setErrors] = useState({})
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const validatePassword = (password) => {
    const errors = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    setPasswordErrors(errors)
    return Object.values(errors).every(Boolean)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required'
    if (!/^\+?\d{10,13}$/.test(formData.mobile)) newErrors.mobile = 'Mobile number must be 10-13 digits'
    if (!validatePassword(formData.password)) newErrors.password = 'Password does not meet all requirements'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (name === 'password') {
      validatePassword(value)
    }
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      showError('Please correct the errors in the form')
      return
    }
    setLoading(true)
    try {
      await superAdminAPI.createGPAdmin(id, formData)
      showSuccess('GP Admin created successfully!')
      navigate(`/super-admin/gram-panchayats/${id}`)
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create GP Admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/super-admin/gram-panchayats/${id}`)}
          className="p-3 hover:bg-gray-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Add GP Admin</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Create a new admin for this Gram Panchayat</p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 max-w-2xl mx-auto"
      >
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">Admin Details</h2>
            <p className="text-gray-600 text-sm">Fill in the information below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                placeholder="Enter admin name"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                placeholder="Enter mobile number"
              />
              {errors.mobile && <p className="text-sm text-red-600 mt-1">{errors.mobile}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email ID <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <p className={passwordErrors.length ? 'text-green-600' : 'text-red-600'}>
                  {passwordErrors.length ? '✓' : '✗'} At least 6 characters
                </p>
                <p className={passwordErrors.uppercase ? 'text-green-600' : 'text-red-600'}>
                  {passwordErrors.uppercase ? '✓' : '✗'} At least one uppercase letter
                </p>
                <p className={passwordErrors.lowercase ? 'text-green-600' : 'text-red-600'}>
                  {passwordErrors.lowercase ? '✓' : '✗'} At least one lowercase letter
                </p>
                <p className={passwordErrors.number ? 'text-green-600' : 'text-red-600'}>
                  {passwordErrors.number ? '✓' : '✗'} At least one number
                </p>
                <p className={passwordErrors.symbol ? 'text-green-600' : 'text-red-600'}>
                  {passwordErrors.symbol ? '✓' : '✗'} At least one special symbol (!@#$%^&*(),.?":{}|)
                </p>
              </div>
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/super-admin/gram-panchayats/${id}`)}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              // disabled={loading || Object.keys(errors).length > 0}
              className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                'Create Admin'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AddGPAdmin