import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { superAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  CheckCircle,
  Activity,
  MapPin,
  Building2,
  Edit,
  Lock
} from 'lucide-react'

const ViewGPAdmin = () => {
  const { gpId, adminId } = useParams()
  const [admin, setAdmin] = useState(null)
  const [gramPanchayat, setGramPanchayat] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAdminDetails()
  }, [adminId, gpId])

  const fetchAdminDetails = async () => {
    try {
      // Fetch GP details first
      const gpResponse = await superAdminAPI.getGramPanchayat(gpId)
      setGramPanchayat(gpResponse.data.data.gramPanchayat)
      
      // Find the admin in the admins list
      const adminData = gpResponse.data.data.admins?.find(a => a._id === adminId)
      if (adminData) {
        setAdmin(adminData)
      } else {
        showError('Administrator not found')
      }
    } catch (error) {
      showError('Failed to fetch administrator details')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
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
      <div className="text-center py-16">
        <User className="w-20 h-20 text-gray-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Administrator not found</h3>
        <p className="text-gray-600 mb-6">The requested administrator could not be found.</p>
        <button
          onClick={() => navigate(`/super-admin/gram-panchayats/${gpId}`)}
          className="btn-primary"
        >
          Back to GP Details
        </button>
      </div>
    )
  }

  const permissions = [
    { name: 'Village Management', description: 'Create and manage villages', granted: true },
    { name: 'House Management', description: 'Register and manage houses', granted: true },
    { name: 'Bill Generation', description: 'Generate water bills', granted: true },
    { name: 'Payment Processing', description: 'Process bill payments', granted: true },
    { name: 'User Management', description: 'Manage mobile users', granted: true },
    { name: 'Reports & Analytics', description: 'View reports and analytics', granted: true },
    { name: 'Tariff Management', description: 'Configure water tariffs', granted: true },
    { name: 'System Settings', description: 'Manage GP settings', granted: true }
  ]

  const activityLog = [
    { action: 'Logged in', time: '2 hours ago', type: 'info' },
    { action: 'Generated 15 water bills', time: '4 hours ago', type: 'success' },
    { action: 'Added new village "Kempegowda Nagar"', time: '1 day ago', type: 'success' },
    { action: 'Updated water tariff rates', time: '2 days ago', type: 'warning' },
    { action: 'Processed 25 payments', time: '3 days ago', type: 'success' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/super-admin/gram-panchayats/${gpId}`)}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="page-title">Administrator Details</h1>
            <p className="page-subtitle">Complete administrator profile and permissions</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="btn-secondary flex items-center">
            <Edit className="w-5 h-5 mr-2" />
            Edit Profile
          </button>
          <button className="btn-secondary flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Reset Password
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Admin Profile */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold text-gray-900">{admin.name}</h2>
                  <div className="flex items-center mt-2">
                    <Shield className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-blue-600 font-medium">GP Administrator</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Building2 className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">{gramPanchayat?.name}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`badge ${admin.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {admin.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Activity className="w-4 h-4 mr-1" />
                  {admin.lastLogin ? 'Recently active' : 'Never logged in'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="section-header">Contact Information</h3>
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

                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mr-4 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Gram Panchayat</p>
                        <p className="text-gray-900 font-medium">{gramPanchayat?.name}</p>
                        <p className="text-sm text-gray-600">{gramPanchayat?.district}, {gramPanchayat?.state}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="section-header">Account Information</h3>
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
                          {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Never logged in'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Shield className="w-5 h-5 text-gray-400 mr-4 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Role</p>
                        <p className="text-gray-900 font-medium capitalize">
                          {admin.role?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="section-header">System Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissions.map((permission, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border ${
                      permission.granted 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <CheckCircle className={`w-5 h-5 mt-0.5 mr-3 ${
                        permission.granted ? 'text-emerald-500' : 'text-gray-400'
                      }`} />
                      <div>
                        <h4 className={`font-medium ${
                          permission.granted ? 'text-emerald-900' : 'text-gray-700'
                        }`}>
                          {permission.name}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          permission.granted ? 'text-emerald-700' : 'text-gray-500'
                        }`}>
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h3 className="section-header">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Bills Generated</span>
                <span className="font-semibold text-gray-900">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payments Processed</span>
                <span className="font-semibold text-gray-900">987</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Houses Managed</span>
                <span className="font-semibold text-gray-900">456</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Villages</span>
                <span className="font-semibold text-gray-900">12</span>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h3 className="section-header">Recent Activity</h3>
            <div className="space-y-4">
              {activityLog.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-emerald-500' : 
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="section-header">Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-secondary text-sm">
                Send Email Notification
              </button>
              <button className="w-full btn-secondary text-sm">
                Generate Activity Report
              </button>
              <button className="w-full btn-danger text-sm">
                Suspend Account
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ViewGPAdmin