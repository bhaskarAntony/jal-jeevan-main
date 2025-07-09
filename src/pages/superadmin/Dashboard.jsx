import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { superAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { 
  Building2, 
  Users, 
  Home, 
  Plus,
  TrendingUp,
  Activity,
  BarChart3,
  ArrowUpRight,
  Calendar,
  Globe,
  Shield,
  Database,
  Zap,
  CheckCircle
} from 'lucide-react'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await superAdminAPI.getDashboard()
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
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Gram Panchayats',
      value: dashboardData?.totalGramPanchayats || 0,
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      href: '/super-admin/gram-panchayats',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Total Villages',
      value: dashboardData?.totalVillages || 0,
      icon: Home,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      href: '/super-admin/gram-panchayats',
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Total Houses',
      value: dashboardData?.totalHouses || 0,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      href: '/super-admin/gram-panchayats',
      change: '+15%',
      changeType: 'increase'
    },
    // {
    //   name: 'System Coverage',
    //   value: '98.5%',
    //   icon: Globe,
    //   color: 'from-orange-500 to-orange-600',
    //   bgColor: 'bg-orange-50',
    //   iconColor: 'text-orange-600',
    //   href: '/super-admin/analytics',
    //   change: '+2.1%',
    //   changeType: 'increase'
    // }
  ]

  const quickActions = [
    {
      name: 'Add Gram Panchayat',
      description: 'Register a new Gram Panchayat in the system',
      icon: Building2,
      color: 'bg-blue-600',
      href: '/super-admin/gram-panchayats/add'
    },
    {
      name: 'Create Super Admin',
      description: 'Add a new Super Administrator account',
      icon: Shield,
      color: 'bg-emerald-600',
      href: '/super-admin/super-admins/add'
    },
    // {
    //   name: 'View Analytics',
    //   description: 'Access detailed system analytics and reports',
    //   icon: BarChart3,
    //   color: 'bg-purple-600',
    //   href: '/super-admin/analytics'
    // },
    // {
    //   name: 'System Settings',
    //   description: 'Configure system-wide settings and preferences',
    //   icon: Database,
    //   color: 'bg-orange-600',
    //   href: '/super-admin/settings'
    // }
  ]

  const recentActivities = [
    {
      id: 1,
      action: 'New Gram Panchayat registered',
      details: 'Bangalore Rural GP was added to the system',
      time: '2 hours ago',
      type: 'success',
      user: 'System Admin'
    },
    {
      id: 2,
      action: 'Super Admin created',
      details: 'New administrator account for Karnataka region',
      time: '4 hours ago',
      type: 'info',
      user: 'Dr. Rajesh Kumar'
    },
    {
      id: 3,
      action: 'System maintenance completed',
      details: 'Database optimization and backup completed',
      time: '1 day ago',
      type: 'success',
      user: 'System'
    },
    {
      id: 4,
      action: 'Monthly report generated',
      details: 'December 2024 system usage report available',
      time: '2 days ago',
      type: 'info',
      user: 'Auto System'
    },
    {
      id: 5,
      action: 'Security audit completed',
      details: 'All security checks passed successfully',
      time: '3 days ago',
      type: 'success',
      user: 'Security Team'
    }
  ]

  const systemMetrics = [
    { name: 'Uptime', value: '99.9%', status: 'excellent' },
    { name: 'Response Time', value: '1.2s', status: 'good' },
    { name: 'Active Users', value: '2.4k', status: 'excellent' },
    { name: 'Data Sync', value: '100%', status: 'excellent' }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-primary rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your water management system today.
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-2 text-blue-100">
            <Calendar className="w-5 h-5" />
            <span className="text-base">{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(stat.href)}
              className="stat-card group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <span className={`font-semibold ${
                    stat.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <ArrowUpRight className={`w-4 h-4 ${
                    stat.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                <p className="text-gray-600 mt-1">Frequently used administrative tasks</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.div
                    key={action.name}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate(action.href)}
                    className="flex items-center p-6 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <div className={`${action.color} p-3 rounded-xl`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-5 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.name}
                      </h3>
                      <p className="text-gray-600 mt-1 text-sm">{action.description}</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        {/* <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <p className="text-gray-600 text-sm mt-1">Latest system updates</p>
              </div>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>{activity.time}</span>
                      <span className="mx-2">•</span>
                      <span>{activity.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 text-sm text-blue-600 hover:text-blue-700 font-semibold">
              View all activities
            </button>
          </div>
        </motion.div> */}
      </div>

      {/* System Status */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Status</h2>
            <p className="text-gray-600 mt-1">Current system health and performance metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-emerald-600">All Systems Operational</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {systemMetrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={`text-center p-6 rounded-xl ${
                metric.status === 'excellent' ? 'bg-emerald-50 border border-emerald-200' :
                metric.status === 'good' ? 'bg-blue-50 border border-blue-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className={`w-5 h-5 ${
                  metric.status === 'excellent' ? 'text-emerald-500' :
                  metric.status === 'good' ? 'text-blue-500' :
                  'text-yellow-500'
                }`} />
              </div>
              <div className={`text-3xl font-bold mb-2 ${
                metric.status === 'excellent' ? 'text-emerald-600' :
                metric.status === 'good' ? 'text-blue-600' :
                'text-yellow-600'
              }`}>
                {metric.value}
              </div>
              <div className={`text-sm font-semibold ${
                metric.status === 'excellent' ? 'text-emerald-800' :
                metric.status === 'good' ? 'text-blue-800' :
                'text-yellow-800'
              }`}>
                {metric.name}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start">
            <Zap className="w-6 h-6 text-blue-600 mt-0.5 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">System Performance</h3>
              <p className="text-blue-700 mt-2">
                All systems are running optimally. The last maintenance was completed successfully 
                with zero downtime. Next scheduled maintenance is in 15 days.
              </p>
              <div className="flex items-center mt-4 space-x-4">
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View Detailed Report
                </button>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Schedule Maintenance
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div> */}
    </div>
  )
}

export default Dashboard