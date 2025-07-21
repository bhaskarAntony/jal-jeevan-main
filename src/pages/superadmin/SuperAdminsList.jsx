import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { superAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmDialog from '../../components/ConfirmDialog'
import { 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  Users, 
  Mail, 
  Phone, 
  Shield, 
  Filter, 
  Download, 
  MoreVertical, 
  Calendar, 
  Activity, 
  Edit, 
  X, 
  Save 
} from 'lucide-react'

const SuperAdminsList = () => {
  const [superAdmins, setSuperAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' })
  const [editModal, setEditModal] = useState({ open: false, admin: null })
  const [viewModal, setViewModal] = useState({ open: false, admin: null })
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    isActive: true
  })
  const [submitting, setSubmitting] = useState(false)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchSuperAdmins()
  }, [searchTerm])

  const fetchSuperAdmins = async () => {
    try {
      const response = await superAdminAPI.getSuperAdmins({ 
        search: searchTerm,
        page: 1,
        limit: 50 
      })
      setSuperAdmins(response.data.data.superAdmins)
    } catch (error) {
      showError('Failed to fetch Super Admins')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = async (id) => {
    try {
      const response = await superAdminAPI.getSingleSuperAdmin(id)
      const admin = response.data.data.superAdmin
      setEditForm({
        name: admin.name || '',
        email: admin.email || '',
        mobile: admin.mobile || '',
        password: '',
        isActive: admin.isActive ?? true
      })
      setEditModal({ open: true, admin })
    } catch (error) {
      showError('Failed to fetch Super Admin details')
      console.error('Fetch error:', error)
    }
  }

  const openViewModal = async (id) => {
    try {
      const response = await superAdminAPI.getSingleSuperAdmin(id)
      setViewModal({ open: true, admin: response.data.data.superAdmin })
    } catch (error) {
      showError('Failed to fetch Super Admin details')
      console.error('Fetch error:', error)
    }
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
      await superAdminAPI.updateSuperAdmin(editModal.admin._id, payload)
      showSuccess('Super Admin updated successfully')
      setEditModal({ open: false, admin: null })
      fetchSuperAdmins()
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update Super Admin')
      console.error('Update error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const closeEditModal = () => {
    setEditModal({ open: false, admin: null })
    setEditForm({
      name: '',
      email: '',
      mobile: '',
      password: '',
      isActive: true
    })
  }

  const closeViewModal = () => {
    setViewModal({ open: false, admin: null })
  }

  const handleDelete = async (id) => {
    try {
      await superAdminAPI.deleteSuperAdmin(id)
      showSuccess('Super Admin deleted successfully')
      fetchSuperAdmins()
    } catch (error) {
      showError('Failed to delete Super Admin')
      console.error('Delete error:', error)
    } finally {
      closeDeleteDialog()
    }
  }

  const openDeleteDialog = (id, name) => {
    setDeleteDialog({ open: true, id, name })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null, name: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Super Administrators</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Manage all Super Administrator accounts in the system
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/super-admin/super-admins/add"
            className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Super Admin
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Super Admins by name, email, or mobile number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
          {/* <button className="flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all lg:w-auto">
            <Filter className="w-5 h-5 mr-2" />
            Advanced Filters
          </button> */}
        </div>
      </motion.div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          {superAdmins.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Administrator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Account Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {superAdmins.map((admin, index) => (
                    <motion.tr
                      key={admin._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-all"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{admin.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Shield className="w-3 h-3 mr-1" />
                              Super Administrator
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            <span className="text-sm">{admin.email}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span className="text-sm">{admin.mobile}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              Created {new Date(admin.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Account ID: {admin._id.slice(-8)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Activity className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {admin.lastLogin 
                              ? new Date(admin.lastLogin).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'Never'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                          admin.isActive ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                         <Link to={`/super-admin/super-admins/${admin._id}`}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => openEditModal(admin._id)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(admin._id, admin.name)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Super Admins found</h3>
              <p className="text-gray-600 mb-6 text-sm">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first Super Admin'}
              </p>
              {!searchTerm && (
                <Link
                  to="/super-admin/super-admins/add"
                  className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Super Admin
                </Link>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {superAdmins.map((admin, index) => (
          <motion.div
            key={admin._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{admin.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Super Administrator
                  </p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-3" />
                <span>{admin.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-3" />
                <span>{admin.mobile}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-3" />
                <span>
                  Created {new Date(admin.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="w-4 h-4 mr-3" />
                <span>
                  Last login: {admin.lastLogin 
                    ? new Date(admin.lastLogin).toLocaleDateString('en-IN')
                    : 'Never'
                  }
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                admin.isActive ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
              }`}>
                {admin.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className="flex items-center space-x-2">
                <Link to={`/super-admin/super-admins/${admin._id}`}
                  className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-all"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Link>
                <button
                  onClick={() => openEditModal(admin._id)}
                  className="flex items-center px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-all"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => openDeleteDialog(admin._id, admin.name)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {superAdmins.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Super Admins found</h3>
            <p className="text-gray-600 mb-6 text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first Super Admin'}
            </p>
            {!searchTerm && (
              <Link
                to="/super-admin/super-admins/add"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Super Admin
              </Link>
            )}
          </div>
        )}
      </div>

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

      {/* View Super Admin Modal */}
      <AnimatePresence>
        {viewModal.open && viewModal.admin && (
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
                  Super Admin Details
                </h2>
                <button
                  onClick={closeViewModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{viewModal.admin.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Super Administrator
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Contact Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-gray-400 mr-4 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                        <p className="text-gray-900 font-medium">{viewModal.admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-gray-400 mr-4 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                        <p className="text-gray-900 font-medium">{viewModal.admin.mobile}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Account Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-gray-400 mr-4 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Account Created</p>
                        <p className="text-gray-900 font-medium">
                          {new Date(viewModal.admin.createdAt).toLocaleDateString('en-IN', {
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
                          {viewModal.admin.lastLogin 
                            ? new Date(viewModal.admin.lastLogin).toLocaleDateString('en-IN', {
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
                        <p className={`text-gray-900 font-medium ${viewModal.admin.isActive ? 'text-blue-600' : 'text-red-600'}`}>
                          {viewModal.admin.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={closeViewModal}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={() => handleDelete(deleteDialog.id)}
        title="Delete Super Admin"
        message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone and will revoke all administrative privileges.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}

export default SuperAdminsList