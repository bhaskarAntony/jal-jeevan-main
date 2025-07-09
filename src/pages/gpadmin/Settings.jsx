import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '../../contexts/ToastContext'
import { 
  Building, 
  User,
  MapPin
} from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'
import { gpAdminAPI } from '../../services/api'

const Settings = () => {
  const [gpData, setGpData] = useState({
    name: '',
    uniqueId: '',
    district: '',
    taluk: '',
    state: '',
    address: '',
    pincode: '',
    contactPerson: {
      name: '',
      mobile: ''
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchGPData()
  }, [])

  const fetchGPData = async () => {
    try {
      const response = await gpAdminAPI.getDashboard()
      const { gramPanchayat } = response.data.data
      setGpData({
        name: gramPanchayat.name,
        uniqueId: gramPanchayat.uniqueId,
        district: gramPanchayat.district,
        taluk: gramPanchayat.taluk,
        state: gramPanchayat.state,
        address: gramPanchayat.address,
        pincode: gramPanchayat.pincode,
        contactPerson: {
          name: gramPanchayat.contactPerson.name,
          mobile: gramPanchayat.contactPerson.mobile
        }
      })
      setLoading(false)
    } catch (error) {
      showError('Failed to fetch GP data')
      console.error('Fetch error:', error)
      setLoading(false)
    }
  }

  const handleChange = (section, field, value) => {
    if (section) {
      setGpData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }))
    } else {
      setGpData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Use gpAdminAPI.updateGPSettings to update the settings
      await gpAdminAPI.updateGPSettings({
        name: gpData.name,
        uniqueId: gpData.uniqueId,
        district: gpData.district,
        taluk: gpData.taluk,
        state: gpData.state,
        address: gpData.address,
        pincode: gpData.pincode,
        contactPerson: {
          name: gpData.contactPerson.name,
          mobile: gpData.contactPerson.mobile
        }
      })
      showSuccess('Settings updated successfully!')
    } catch (error) {
      showError('Failed to update settings')
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GP Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your Gram Panchayat settings and configuration
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <LoadingSpinner size="sm" color="white" />
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <p className="text-gray-600">Gram Panchayat details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gram Panchayat Name
              </label>
              <input
                type="text"
                value={gpData.name}
                onChange={(e) => handleChange(null, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter GP name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unique ID
              </label>
              <input
                type="text"
                value={gpData.uniqueId}
                onChange={(e) => handleChange(null, 'uniqueId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter unique ID"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <input
                  type="text"
                  value={gpData.district}
                  onChange={(e) => handleChange(null, 'district', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter district"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taluk
                </label>
                <input
                  type="text"
                  value={gpData.taluk}
                  onChange={(e) => handleChange(null, 'taluk', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter taluk"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={gpData.state}
                  onChange={(e) => handleChange(null, 'state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={gpData.pincode}
                  onChange={(e) => handleChange(null, 'pincode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter pincode"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complete Address
              </label>
              <textarea
                value={gpData.address}
                onChange={(e) => handleChange(null, 'address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter complete address"
              />
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-green-100 wokół-lg flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Contact Person</h2>
              <p className="text-gray-600">Primary contact details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person Name
              </label>
              <input
                type="text"
                value={gpData.contactPerson.name}
                onChange={(e) => handleChange('contactPerson', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter contact person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={gpData.contactPerson.mobile}
                onChange={(e) => handleChange('contactPerson', 'mobile', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter mobile number"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Settings