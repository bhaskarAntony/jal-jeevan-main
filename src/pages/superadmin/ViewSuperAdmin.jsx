import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  CheckCircle,
  Activity,
  Edit,
  Lock,
  Globe,
  Database,
  Settings,
  Users,
  BarChart3
} from 'lucide-react'

const ViewSuperAdmin = () => {
  const { id } = useParams()
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAdminDetails()
  }, [id])

  const fetchAdminDetails = async () => {
    try {
      // For now, using mock data since we don't have a specific endpoint
      // In real implementation, you would call: await superAdminAPI.getSuperAdmin(id)
      setTimeout(() => {
        setAdmin({
          _id: id,
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh.kumar@waterms.gov.in',
          mobile: '+91 9876543210',
          role: 'super_admin',
          createdAt: new Date('2024-01-10'),
          lastLogin: new Date('2024-01-20'),
          isActive: true,
          permissions: ['all'],
          stats: {
            gramPanchayatsManaged: 45,
            adminsCreated: 123,
            systemUptime: '99.9%',
            totalUsers: 1567
          }
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      showError('Failed to fetch administrator details')
      console.error('Fetch error:', error)
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
        <Shield className="w-20 h-20 text-gray-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Super Admin not found</h3>
        <p className="text-gray-600 mb-6">The requested Super Administrator could not be found.</p>
        <button
          onClick={() => navigate('/super-admin/super-admins')}
          className="btn-primary"
        >
          Back to List
        </button>
      </div>
    )
  }

  const permissions = [
    { name: 'Manage Gram Panchayats', description: 'Create, edit, and delete GPs', icon: Globe },
    { name: 'Create GP Admins', description: 'Add administrators for GPs', icon: Users },
    { name: 'Manage Super Admins', description: 'Create and manage super admins', icon: Shield },
    { name: 'System Configuration', description: 'Configure system-wide settings', icon: Settings },
    { name: 'View All Reports', description: 'Access comprehensive reports', icon: BarChart3 },
    { name: 'Data Export/Import', description: 'Bulk data operations', icon: Database },
    { name: 'User Management', description: 'Manage all user accounts', icon: Users },
    { name: 'System Monitoring', description: 'Monitor system health', icon: Activity }
  ]

  const activityLog = [
    { action: 'Created new GP "Bangalore Rural"', time: '2 hours ago', type: 'success' },
    { action: 'Added Super Admin "Dr. Priya Sharma"', time: '4 hours ago', type: 'info' },
    { action: 'Updated system configuration', time: '1 day ago', type: 'warning' },
    { action: 'Generated monthly report', time: '2 days ago', type: 'success' },
    { action: 'Performed system backup', time: '3 days ago', type: 'info' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/super-admin/super-admins')}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="page-title">Super Administrator</h1>
            <p className="page-subtitle">Complete super admin profile and system access</p>
          </div>
        </div>
        {/* <div className="flex items-center space-x-4">
          <button className="btn-secondary flex items-center">
            <Edit className="w-5 h-5 mr-2" />
            Edit Profile
          </button>
          <button className="btn-secondary flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Reset Password
          </button>
        </div> */}
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">GPs Managed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{admin.stats.gramPanchayatsManaged}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <Globe className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins Created</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{admin.stats.adminsCreated}</p>
            </div>
            <div className="bg-emerald-500 p-3 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{admin.stats.systemUptime}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{admin.stats.totalUsers}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div> */}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Admin Profile */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold text-gray-900">{admin.name}</h2>
                  <div className="flex items-center mt-2">
                    <Shield className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-blue-600 font-medium">Super Administrator</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Activity className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">System-wide access</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`badge ${admin.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {admin.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Activity className="w-4 h-4 mr-1" />
                  Recently active
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
                        <p className="text-sm font-medium text-gray-500">Access Level</p>
                        <p className="text-gray-900 font-medium">Full System Access</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Permissions */}
            {/* <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="section-header">System Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissions.map((permission, index) => {
                  const Icon = permission.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg"
                    >
                      <div className="flex items-start">
                        <Icon className="w-5 h-5 text-emerald-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-medium text-emerald-900">{permission.name}</h4>
                          <p className="text-sm text-emerald-700 mt-1">{permission.description}</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div> */}

            {/* Security Notice */}
            {/* <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start">
                <Shield className="w-6 h-6 text-blue-600 mt-0.5 mr-4" />
                <div>
                  <h4 className="text-lg font-medium text-blue-900">Super Administrator Access</h4>
                  <p className="text-blue-700 mt-2 leading-relaxed">
                    This user has complete administrative access to the Water Management System, 
                    including the ability to manage all Gram Panchayats, create other administrators, 
                    configure system-wide settings, and access all data across the platform. This level 
                    of access should be granted only to trusted personnel.
                  </p>
                </div>
              </div>
            </div> */}
          </motion.div>
        </div>

       
      </div>
    </div>
  )
}

export default ViewSuperAdmin