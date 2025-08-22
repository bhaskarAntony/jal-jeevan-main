import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { gpAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ArrowLeft, User, Mail, Phone, Shield, Lock, Check, X, Eye, EyeOff } from 'lucide-react'

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'mobile_user'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })
  const [errors, setErrors] = useState({})
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  // Password validation rules
  const validatePassword = (password) => {
    const rules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    return { rules, isValid: Object.values(rules).every(rule => rule) }
  }

  // Validate form fields
  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required'
    if (!/^\+?\d{10,13}$/.test(formData.mobile)) newErrors.mobile = 'Mobile number must be 10-13 digits'
    if (!formData.role) newErrors.role = 'User role is required'
    if (!isPasswordValid) newErrors.password = 'Password does not meet all requirements'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Update password rules and validity when password changes
  useEffect(() => {
    const { rules, isValid } = validatePassword(formData.password)
    setPasswordRules(rules)
    setIsPasswordValid(isValid)
  }, [formData.password])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
      await gpAdminAPI.createUser(formData)
      showSuccess('User added successfully!')
      navigate('/gp-admin/users')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/gp-admin/users')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
          <p className="text-gray-600 mt-1 text-sm">Create a new user account for your Gram Panchayat</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
            <p className="text-gray-600 text-sm">Fill in the information below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="Enter full name"
                />
              </div>
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="+91 9876543210"
                />
              </div>
              {errors.mobile && <p className="text-sm text-red-600 mt-1">{errors.mobile}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="user@example.com"
                />
              </div>
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role *
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="mobile_user">Mobile User</option>
                  <option value="gp_admin">GP Admin</option>
                </select>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Mobile users can manage bills and payments. GP Admins have full access.
              </p>
              {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
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
              <div className="mt-2 space-y-1">
                <p className="text-sm font-medium text-gray-700">Password must include:</p>
                <div className="flex items-center space-x-2">
                  {passwordRules.length ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-600">At least 8 characters</span>
                </div>
                <div className="flex items-center space-x-2">
                  {passwordRules.uppercase ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-600">One uppercase letter</span>
                </div>
                <div className="flex items-center space-x-2">
                  {passwordRules.lowercase ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-600">One lowercase letter</span>
                </div>
                <div className="flex items-center space-x-2">
                  {passwordRules.number ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-600">One number</span>
                </div>
                <div className="flex items-center space-x-2">
                  {passwordRules.special ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-600">One special character (!@#$%^&*(),.?":{}|)</span>
                </div>
              </div>
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/gp-admin/users')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              // disabled={loading || Object.keys(errors).length > 0}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                'Add User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddUser