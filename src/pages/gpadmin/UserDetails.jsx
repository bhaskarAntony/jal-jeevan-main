import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { gpAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import UpdateUserModal from './UpdateUserModal'
import { ArrowLeft, User, Mail, Phone, Shield, Calendar, Activity } from 'lucide-react'

const UserDetails = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const { showSuccess, showError } = useToast()
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    try {
      const response = await gpAdminAPI.getUser(id)
      setUser(response.data.data)
    } catch (error) {
      showError('Failed to fetch user details')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSuccess = () => {
    setIsUpdateModalOpen(false)
    fetchUser()
    showSuccess('User updated successfully')
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'gp_admin':
        return 'bg-blue-100 text-blue-800'
      case 'mobile_user':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">User not found</h3>
        <button
          onClick={() => navigate('/gp-admin/users')}
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Users
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/gp-admin/users')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
          aria-label="Back to users"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{user.name}</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage user details and account settings</p>
        </div>
      </div>

      {/* User Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8"
      >
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">User Information</h2>
            <p className="text-gray-600 text-sm">Details about the user account</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <User className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Full Name</p>
              <p className="text-base text-gray-900">{user.name}</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Mail className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Email</p>
              <p className="text-base text-gray-900">{user.email}</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Phone className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Mobile</p>
              <p className="text-base text-gray-900">{user.mobile}</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Shield className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Role</p>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getRoleBadge(user.role)}`}>
                {user.role === 'gp_admin' ? 'GP Admin' : 'Mobile User'}
              </span>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Activity className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Last Login</p>
              <p className="text-base text-gray-900">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN') : 'Never'}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Calendar className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Created At</p>
              <p className="text-base text-gray-900">{new Date(user.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Shield className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Status</p>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200 mt-8">
          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
          >
            Update User
          </button>
        </div>
      </motion.div>

      {/* Update User Modal */}
      <UpdateUserModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        user={user}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  )
}

export default UserDetails