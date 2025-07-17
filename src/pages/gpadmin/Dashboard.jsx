import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { gpAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { 
  Building, 
  Users, 
  FileText, 
  DollarSign,
  TrendingUp,
  Activity,
  Plus,
  MapPin,
  IndianRupee
} from 'lucide-react'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await gpAdminAPI.getDashboard()
      setDashboardData(response.data.data)
    } catch (error) {
      showError('Failed to fetch dashboard data')
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Villages',
      value: dashboardData?.totalVillages || 0,
      icon: MapPin,
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      href: '/gp-admin/villages'
    },
    {
      name: 'Total Houses',
      value: dashboardData?.totalHouses || 0,
      icon: Building,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      href: '/gp-admin/houses'
    },
    {
      name: 'This Month Collection',
      value: `₹${dashboardData?.thisMonthCollection || 0}`,
      icon: IndianRupee,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      href: '/gp-admin/bills'
    },
    {
      name: 'Total Users',
      value: dashboardData?.totalUsers || 0,
      icon: Users,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      href: '/gp-admin/users'
    }
  ]

  const quickActions = [
    {
      name: 'Add Village',
      description: 'Create a new village',
      icon: MapPin,
      color: 'bg-emerald-500',
      href: '/gp-admin/villages/add'
    },
    {
      name: 'Add House',
      description: 'Register a new house',
      icon: Building,
      color: 'bg-blue-500',
      href: '/gp-admin/houses/add'
    },
    {
      name: 'Generate Bill',
      description: 'Create water bill',
      icon: FileText,
      color: 'bg-green-500',
      href: '/gp-admin/new/bill'
    },
    {
      name: 'Add User',
      description: 'Create new user account',
      icon: Users,
      color: 'bg-purple-500',
      href: '/gp-admin/users/add'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GP Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name} - {dashboardData?.gramPanchayat?.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-600">System Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(stat.href)}
              className="bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg border border-gray-200"
        >
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="space-y-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.name}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(action.href)}
                  className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className={`${action.color} p-2 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">{action.name}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  <Plus className="w-5 h-5 text-gray-400 ml-auto" />
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg border border-gray-200"
        >
          <div className="flex items-center mb-4">
            <Activity className="w-6 h-6 text-emerald-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Monthly Overview</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div>
                <p className="font-medium text-emerald-900">Paid Bills</p>
                <p className="text-sm text-emerald-600">This month</p>
              </div>
              <span className="text-2xl font-bold text-emerald-600">
                {dashboardData?.paidBills || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-yellow-900">Unpaid Bills</p>
                <p className="text-sm text-yellow-600">Pending payment</p>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {dashboardData?.unpaidBills || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Collection Rate</p>
                <p className="text-sm text-blue-600">Payment efficiency</p>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {dashboardData?.paidBills && dashboardData?.unpaidBills 
                  ? Math.round((dashboardData.paidBills / (dashboardData.paidBills + dashboardData.unpaidBills)) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Bills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-6 rounded-lg border border-gray-200"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bills</h2>
        {dashboardData?.recentBills && dashboardData.recentBills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Village
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentBills.slice(0, 5).map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bill.billNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bill.house?.ownerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {bill.house?.village?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{bill.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        bill.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : bill.status === 'partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent bills found</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Dashboard