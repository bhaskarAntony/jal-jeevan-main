import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  Menu,
  X,
  Home,
  Building,
  Users,
  FileText,
  Settings,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  Droplets,
  Calculator,
  QrCode,
  MapPin
} from 'lucide-react';

const GPAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { showSuccess, showWarning } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const profileButtonRef = useRef(null);

  const SESSION_TIMEOUT = 900000; // 2 minutes in milliseconds
  const WARNING_TIMEOUT = 890000; // 1 minute 45 seconds (15 seconds before logout)

  const navigation = [
    { name: 'Dashboard', href: '/gp-admin/dashboard', icon: Home },
    { name: 'Houses', href: '/gp-admin/houses', icon: Building },
    { name: 'Villages', href: '/gp-admin/villages', icon: MapPin },
    { name: 'Bills', href: '/gp-admin/bills', icon: FileText },
    {
      name: 'Settings',
      icon: Settings,
      subItems: [
        { name: 'Calculations', href: '/gp-admin/calculations', icon: Calculator },
        { name: 'Users List', href: '/gp-admin/users', icon: Users },
        // { name: 'QR Code', href: '/gp-admin/qr-code', icon: QrCode }
      ]
    },
    { name: 'GP Profile', href: '/gp-admin/settings', icon: Settings }
  ];

  // Reset the session timeout timer
  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    // Set warning toast 15 seconds before logout
    warningTimeoutRef.current = setTimeout(() => {
      showWarning('Your session will expire in 15 seconds due to inactivity.');
    }, WARNING_TIMEOUT);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      logout();
      showSuccess('Session timed out due to inactivity');
      navigate('/login');
    }, SESSION_TIMEOUT);
  };

  // Handle user activity to reset the timer
  const handleActivity = () => {
    resetTimeout();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Set up event listeners and initial timer
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleActivity));

    // Start the timer on mount
    resetTimeout();

    // Clean up on unmount
    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, []);

  const handleLogout = () => {
    logout();
    showSuccess('Logged out successfully');
    navigate('/login');
  };

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const getPageTitle = () => {
    for (const item of navigation) {
      if (item.subItems) {
        const subItem = item.subItems.find(sub => isActive(sub.href));
        if (subItem) return subItem.name;
      }
      if (isActive(item.href)) return item.name;
    }
    return 'Dashboard';
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex bg-gray-50">
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
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white lg:static lg:inset-0"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-6 bg-emerald-600">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">GP Admin</span>
                  <p className="text-xs text-emerald-100">Water Management</p>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="text-white hover:text-emerald-200 p-1 rounded-md hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                if (item.subItems) {
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        className={`
                          group flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full transition-all duration-200
                          ${settingsOpen ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'}
                        `}
                      >
                        <Icon className={`w-5 h-5 mr-3 ${settingsOpen ? 'text-emerald-600' : 'text-gray-500 group-hover:text-emerald-600'}`} />
                        <span>{item.name}</span>
                        <ChevronRight
                          className={`w-4 h-4 ml-auto transition-transform ${settingsOpen ? 'rotate-90' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {settingsOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 space-y-1"
                          >
                            {item.subItems.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const active = isActive(subItem.href);
                              return (
                                <Link
                                  key={subItem.name}
                                  to={subItem.href}
                                  className={`
                                    group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                                    ${active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'}
                                  `}
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  <SubIcon className={`w-4 h-4 mr-3 ${active ? 'text-emerald-600' : 'text-gray-500 group-hover:text-emerald-600'}`} />
                                  <span>{subItem.name}</span>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                      ${active ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600' : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'}
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${active ? 'text-emerald-600' : 'text-gray-500 group-hover:text-emerald-600'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile in Sidebar */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.gramPanchayat?.name}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
            {/* Profile Dropdown */}
            <div className="relative" ref={profileButtonRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 p-2 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">GP Admin</p>
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
                    <Link
                      to="/gp-admin/settings"
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      GP Profile
                    </Link>
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
  );
};

export default GPAdminLayout;