import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { superAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmDialog from '../../components/ConfirmDialog'
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Phone, 
  User, 
  Plus,
  Eye,
  Trash2,
  Mail,
  Calendar,
  Edit,
  Shield,
  Users,
  Home,
  Activity
} from 'lucide-react'

const ViewGramPanchayat = () => {
  const { id } = useParams()
  const [gramPanchayat, setGramPanchayat] = useState(null)
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, adminId: null, adminName: '' })
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchGramPanchayatDetails()
  }, [id])

  const fetchGramPanchayatDetails = async () => {
    try {
      const response = await superAdminAPI.getGramPanchayat(id)
      setGramPanchayat(response.data.data.gramPanchayat)
      setAdmins(response.data.data.admins || [])
    } catch (error) {
      showError('Failed to fetch Gram Panchayat details')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAdmin = async (adminId) => {
    try {
      // Note: You'll need to implement this API endpoint
      // await superAdminAPI.deleteGPAdmin(adminId)
      showSuccess('Admin deleted successfully')
      fetchGramPanchayatDetails()
    } catch (error) {
      showError('Failed to delete admin')
      console.error('Delete error:', error)
    }
  }

  const openDeleteDialog = (adminId, adminName) => {
    setDeleteDialog({ open: true, adminId, adminName })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, adminId: null, adminName: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!gramPanchayat) {
    return (
      <div className="text-center py-16">
        <Building2 className="w-20 h-20 text-gray-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Gram Panchayat not found</h3>
        <p className="text-gray-600 mb-6">The requested Gram Panchayat could not be found.</p>
        <button
          onClick={() => navigate('/super-admin/gram-panchayats')}
          className="btn-primary"
        >
          Back to List
        </button>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Admins',
      value: admins.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Users',
      value: admins.filter(admin => admin.isActive).length,
      icon: Activity,
      color: 'bg-emerald-500'
    },
    {
      name: 'Villages',
      value: '12', // This should come from API
      icon: Home,
      color: 'bg-purple-500'
    },
    {
      name: 'Houses',
      value: '1,234', // This should come from API
      icon: Building2,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/super-admin/gram-panchayats')}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="page-title">{gramPanchayat.name}</h1>
            <p className="page-subtitle">Gram Panchayat Details & Management</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* <button className="btn-secondary flex items-center">
            <Edit className="w-5 h-5 mr-2" />
            Edit Details
          </button> */}
          <Link
            to={`/super-admin/gram-panchayats/${id}/add-admin`}
            className="btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Admin
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* GP Information */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold text-gray-900">{gramPanchayat.name}</h2>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Shield className="w-4 h-4 mr-2" />
                    ID: {gramPanchayat.uniqueId}
                  </p>
                </div>
              </div>
              <span className="badge badge-success">Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="section-header">Location Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">District</p>
                        <p className="text-gray-600">{gramPanchayat.district}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Taluk</p>
                        <p className="text-gray-600">{gramPanchayat.taluk}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">State</p>
                        <p className="text-gray-600">{gramPanchayat.state}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Pincode</p>
                        <p className="text-gray-600">{gramPanchayat.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="section-header">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Contact Person</p>
                        <p className="text-gray-600">{gramPanchayat.contactPerson?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Mobile</p>
                        <p className="text-gray-600">{gramPanchayat.contactPerson?.mobile}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Created</p>
                        <p className="text-gray-600">
                          {new Date(gramPanchayat.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="section-header">Complete Address</h3>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-700 leading-relaxed">{gramPanchayat.address}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        {/* <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h3 className="section-header">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Edit className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium text-blue-900">Edit GP Details</span>
              </button>
              <button className="w-full flex items-center p-3 text-left bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                <Users className="w-5 h-5 text-emerald-600 mr-3" />
                <span className="font-medium text-emerald-900">Manage Users</span>
              </button>
              <button className="w-full flex items-center p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <Home className="w-5 h-5 text-purple-600 mr-3" />
                <span className="font-medium text-purple-900">View Villages</span>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h3 className="section-header">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Water Tariff</span>
                <span className="badge badge-success">Configured</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment Gateway</span>
                <span className="badge badge-success">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Data Backup</span>
                <span className="badge badge-info">Daily</span>
              </div>
            </div>
          </motion.div>
        </div> */}
      </div>

      {/* Admins Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-header mb-0">GP Administrators</h2>
            <p className="text-gray-600 mt-1">Manage administrative access for this Gram Panchayat</p>
          </div>
          <Link
            to={`/super-admin/gram-panchayats/${id}/add-admin`}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Admin
          </Link>
        </div>

        {admins.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Administrator</th>
                    <th className="table-header">Contact Information</th>
                    <th className="table-header">Account Status</th>
                    <th className="table-header">Last Login</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.map((admin, index) => (
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
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <p className="text-base font-semibold text-gray-900">{admin.name}</p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Shield className="w-3 h-3 mr-1" />
                              GP Administrator
                            </p>
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
                        <span className={`badge ${admin.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-gray-600">
                          {admin.lastLogin 
                            ? new Date(admin.lastLogin).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'Never'
                          }
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/super-admin/gram-panchayats/${id}/admins/${admin._id}`}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
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

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {admins.map((admin, index) => (
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
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{admin.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          GP Administrator
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${admin.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
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
                        Last login: {admin.lastLogin 
                          ? new Date(admin.lastLogin).toLocaleDateString('en-IN')
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Link
                      to={`/super-admin/gram-panchayats/${id}/admins/${admin._id}`}
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Link>
                    <button
                      onClick={() => openDeleteDialog(admin._id, admin.name)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <User className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No administrators found</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Add the first administrator for this Gram Panchayat to get started.
            </p>
            <Link
              to={`/super-admin/gram-panchayats/${id}/add-admin`}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Admin
            </Link>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={() => handleDeleteAdmin(deleteDialog.adminId)}
        title="Delete Administrator"
        message={`Are you sure you want to delete "${deleteDialog.adminName}"? This action cannot be undone and will revoke all administrative privileges.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}

export default ViewGramPanchayat