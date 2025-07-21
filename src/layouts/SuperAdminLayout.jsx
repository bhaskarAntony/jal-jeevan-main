import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { 
  Menu, 
  X, 
  Home, 
  Building2, 
  Users, 
  LogOut,
  User,
  ChevronDown,
  Droplets,
  Settings,
  BarChart3,
  Bell,
  Search,
  HelpCircle
} from 'lucide-react'

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const { showSuccess } = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/super-admin/dashboard', 
      icon: Home,
      description: 'Overview and analytics'
    },
    { 
      name: 'Gram Panchayats', 
      href: '/super-admin/gram-panchayats', 
      icon: Building2,
      description: 'Manage all GPs'
    },
    { 
      name: 'Super Admins', 
      href: '/super-admin/super-admins', 
      icon: Users,
      description: 'Administrator accounts'
    },
    // { 
    //   name: 'Analytics', 
    //   href: '/super-admin/analytics', 
    //   icon: BarChart3,
    //   description: 'Reports and insights'
    // },
    // { 
    //   name: 'Settings', 
    //   href: '/super-admin/settings', 
    //   icon: Settings,
    //   description: 'System configuration'
    // },
  ]

  const handleLogout = () => {
    logout()
    showSuccess('Logged out successfully')
    navigate('/login')
  }

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const getPageTitle = () => {
    const currentNav = navigation.find(item => isActive(item.href))
    return currentNav?.name || 'Dashboard'
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600 border-b border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Super Admin</span>
              <p className="text-xs text-blue-100">Water Management</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-blue-200 p-1 rounded-md hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${active 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 mr-3 ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}`} />
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className={`text-xs ${active ? 'text-blue-500' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User Profile in Sidebar */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">Super Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            {/* <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
                />
              </div>
            </div> */}

            {/* Help */}
            {/* <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button> */}

            {/* Notifications */}
            {/* <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button> */}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">Super Admin</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    {/* <Link
                      to="/super-admin/profile"
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile Settings
                    </Link> */}
                    {/* <Link
                      to="/super-admin/settings"
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      System Settings
                    </Link> */}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SuperAdminLayout