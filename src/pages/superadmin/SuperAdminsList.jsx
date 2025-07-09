import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
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
  Edit
} from 'lucide-react'

const SuperAdminsList = () => {
  const [superAdmins, setSuperAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' })
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

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

  const handleDelete = async (id) => {
    try {
      await superAdminAPI.deleteSuperAdmin(id)
      showSuccess('Super Admin deleted successfully')
      fetchSuperAdmins()
    } catch (error) {
      showError('Failed to delete Super Admin')
      console.error('Delete error:', error)
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
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Super Administrators</h1>
          <p className="page-subtitle">
            Manage all Super Administrator accounts in the system
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* <button className="btn-secondary flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Export Data
          </button> */}
          <Link
            to="/super-admin/super-admins/add"
            className="btn-primary flex items-center"
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
        className="card p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Super Admins by name, email, or mobile number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 text-base"
            />
          </div>
          <button className="btn-secondary flex items-center lg:w-auto">
            <Filter className="w-5 h-5 mr-2" />
            Advanced Filters
          </button>
        </div>
      </motion.div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card overflow-hidden"
        >
          {superAdmins.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Administrator</th>
                    <th className="table-header">Contact Information</th>
                    <th className="table-header">Account Details</th>
                    <th className="table-header">Last Activity</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {superAdmins.map((admin, index) => (
                    <motion.tr
                      key={admin._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="table-row"
                    >
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-base font-semibold text-gray-900">{admin.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Shield className="w-3 h-3 mr-1" />
                              Super Administrator
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
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
                      <td className="table-cell">
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
                      <td className="table-cell">
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
                      <td className="table-cell">
                        <span className={`badge ${
                          admin.isActive 
                            ? 'badge-success' 
                            : 'badge-danger'
                        }`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/super-admin/super-admins/${admin._id}`)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(admin._id, admin.name)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
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
              <p className="text-gray-600 mb-6 text-lg">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first Super Admin'}
              </p>
              {!searchTerm && (
                <Link
                  to="/super-admin/super-admins/add"
                  className="btn-primary inline-flex items-center"
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
            className="mobile-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
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
              <span className={`badge ${
                admin.isActive 
                  ? 'badge-success' 
                  : 'badge-danger'
              }`}>
                {admin.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/super-admin/super-admins/${admin._id}`)}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </button>
                <button
                  onClick={() => openDeleteDialog(admin._id, admin.name)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
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
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first Super Admin'}
            </p>
            {!searchTerm && (
              <Link
                to="/super-admin/super-admins/add"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Super Admin
              </Link>
            )}
          </div>
        )}
      </div>

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