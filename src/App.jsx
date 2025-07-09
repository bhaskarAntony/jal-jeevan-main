import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import Toast from './components/Toast'

// Auth Pages
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyOTP from './pages/auth/VerifyOTP'

// Super Admin Pages
import SuperAdminLayout from './layouts/SuperAdminLayout'
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import GramPanchayatsList from './pages/superadmin/GramPanchayatsList'
import AddGramPanchayat from './pages/superadmin/AddGramPanchayat'
import ViewGramPanchayat from './pages/superadmin/ViewGramPanchayat'
import AddGPAdmin from './pages/superadmin/AddGPAdmin'
import ViewGPAdmin from './pages/superadmin/ViewGPAdmin'
import SuperAdminsList from './pages/superadmin/SuperAdminsList'
import AddSuperAdmin from './pages/superadmin/AddSuperAdmin'
import ViewSuperAdmin from './pages/superadmin/ViewSuperAdmin'

// GP Admin Pages
import GPAdminLayout from './layouts/GPAdminLayout'
import GPAdminDashboard from './pages/gpadmin/Dashboard'
import HousesList from './pages/gpadmin/HousesList'
import AddHouse from './pages/gpadmin/AddHouse'
import HouseDetails from './pages/gpadmin/HouseDetails'
import VillagesList from './pages/gpadmin/VillagesList'
import AddVillage from './pages/gpadmin/AddVillage'
import UsersList from './pages/gpadmin/UsersList'
import AddUser from './pages/gpadmin/AddUser'
import BillsList from './pages/gpadmin/BillsList'
import Calculations from './pages/gpadmin/Calculations'
import QRCodePage from './pages/gpadmin/QRCode'
import Settings from './pages/gpadmin/Settings'
import UserDetails from './pages/gpadmin/UserDetails'
import GenerateBill from './pages/gpadmin/GenerateBill'
import VillageDetails from './pages/gpadmin/VillageDetails'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              
              {/* Super Admin Routes */}
              <Route path="/super-admin" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<SuperAdminDashboard />} />
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="gram-panchayats" element={<GramPanchayatsList />} />
                <Route path="gram-panchayats/add" element={<AddGramPanchayat />} />
                <Route path="gram-panchayats/:id" element={<ViewGramPanchayat />} />
                <Route path="gram-panchayats/:id/add-admin" element={<AddGPAdmin />} />
                <Route path="gram-panchayats/:gpId/admins/:adminId" element={<ViewGPAdmin />} />
                <Route path="super-admins" element={<SuperAdminsList />} />
                <Route path="super-admins/add" element={<AddSuperAdmin />} />
                <Route path="super-admins/:id" element={<ViewSuperAdmin />} />
              </Route>

              {/* GP Admin Routes */}
              <Route path="/gp-admin" element={
                <ProtectedRoute allowedRoles={['gp_admin']}>
                  <GPAdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<GPAdminDashboard />} />
                <Route path="dashboard" element={<GPAdminDashboard />} />
                <Route path="houses" element={<HousesList />} />
                <Route path="houses/add" element={<AddHouse />} />
                <Route path="houses/:id" element={<HouseDetails />} />
                <Route path="villages" element={<VillagesList />} />
                <Route path="village/:id" element={<VillageDetails />} />
                <Route path="villages/add" element={<AddVillage />} />
                <Route path="users" element={<UsersList />} />
                <Route path="user/:id" element={<UserDetails />} />
                <Route path="users/add" element={<AddUser />} />
                <Route path="bills" element={<BillsList />} />
                <Route path="new/bill" element={<GenerateBill />} />
                <Route path="calculations" element={<Calculations />} />
                <Route path="qr-code" element={<QRCodePage />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Default Redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toast />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App