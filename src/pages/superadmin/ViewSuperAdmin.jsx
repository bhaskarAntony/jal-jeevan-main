import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { superAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { 
  ArrowLeft, 
  Shield, 
  Mail, 
  Phone, 
  Calendar, 
  Activity, 
  CheckCircle, 
  Edit, 
  X, 
  Save 
} from 'lucide-react'

const ViewSuperAdmin = () => {
  const { id } = useParams()
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState({ open: false, admin: null })
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    isActive: true
  })
  const [submitting, setSubmitting] = useState(false)
  const { showError, showSuccess } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAdminDetails()
  }, [id])

  const fetchAdminDetails = async () => {
    try {
      const response = await superAdminAPI.getSingleSuperAdmin(id)
      const adminData = response.data.data.superAdmin
      setAdmin(adminData)
      setEditForm({
        name: adminData.name || '',
        email: adminData.email || '',
        mobile: adminData.mobile || '',
        password: '',
        isActive: adminData.isActive ?? true
      })
      setEditModal({ open: false, admin: adminData })
    } catch (error) {
      showError('Failed to fetch Super Admin details')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = () => {
    setEditModal({ open: true, admin })
  }

  const closeEditModal = () => {
    setEditModal({ open: false, admin: null })
    setEditForm({
      name: admin?.name || '',
      email: admin?.email || '',
      mobile: admin?.mobile || '',
      password: '',
      isActive: admin?.isActive ?? true
    })
  }

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const requiredFields = ['name', 'email', 'mobile']
      for (const field of requiredFields) {
        if (!editForm[field]) {
          showError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
          return
        }
      }
      const payload = {
        name: editForm.name,
        email: editForm.email,
        mobile: editForm.mobile,
        isActive: editForm.isActive
      }
      if (editForm.password) {
        payload.password = editForm.password
      }
      await superAdminAPI.updateSuperAdmin(id, payload)
      showSuccess('Super Admin updated successfully')
      setEditModal({ open: false, admin: null })
      fetchAdminDetails() // Refresh the page with updated data
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update Super Admin')
      console.error('Update error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="text-center py-16 max-w-7xl mx-auto">
        <Shield className="w-20 h-20 text-gray-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Super Admin not found</h3>
        <p className="text-gray-600 mb-6 text-sm">The requested Super Administrator could not be found.</p>
        <button
          onClick={() => navigate('/super-admin/super-admins')}
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to List
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/super-admin/super-admins')}
            className="p-3 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Super Administrator</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Complete super admin profile and system access</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={openEditModal}
            className="flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="ml-4 sm:ml-6">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{admin.name}</h2>
              <div className="flex items-center mt-2">
                <Shield className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-blue-600 font-medium text-sm">Super Administrator</span>
              </div>
              <div className="flex items-center mt-1">
                <Activity className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-gray-600 text-sm">System-wide access</span>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:text-right">
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
              admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {admin.isActive ? 'Active' : 'Inactive'}
            </span>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Activity className="w-4 h-4 mr-1" />
              {admin.lastLogin 
                ? `Last active ${new Date(admin.lastLogin).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric'
                  })}`
                : 'Never logged in'
              }
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-gray-400 mr-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="text-gray-900 font-medium">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-400 mr-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                    <p className="text-gray-900 font-medium">{admin.mobile}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Account Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Account Created</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(admin.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Activity className="w-5 h-5 text-gray-400 mr-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Login</p>
                    <p className="text-gray-900 font-medium">
                      {admin.lastLogin 
                        ? new Date(admin.lastLogin).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Never logged in'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-gray-400 mr-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Access Level</p>
                    <p className="text-gray-900 font-medium">Full System Access</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-gray-400 mr-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className={`text-gray-900 font-medium ${admin.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-gray-400 mr-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Account ID</p>
                    <p className="text-gray-900 font-medium">{admin._id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Super Admin Modal */}
      <AnimatePresence>
        {editModal.open && editModal.admin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 overflow-y-auto py-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 my-auto sm:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Edit Super Admin
                </h2>
                <button
                  onClick={closeEditModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={editForm.mobile}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={editForm.password}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter new password (optional)"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editForm.isActive}
                    onChange={handleEditChange}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-semibold text-gray-700">
                    Active
                  </label>
                </div>
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitting ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ViewSuperAdmin