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
import BackButton from '../../components/BackButton'

const Settings = () => {
  const [gpData, setGpData] = useState({
    name: '',
    uniqueId: '',
    district: '',
    taluk: '',
    state: '',
    address: '',
    pincode: '',
    DueDays: '',
    contactPerson: {
      name: '',
      mobile: ''
    }
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchGPData()
  }, [])

  // Real-time validation for mobile number and DueDays
  useEffect(() => {
    const newErrors = {}
    const cleanedMobile = gpData.contactPerson.mobile
      .replace(/[^\+\d]/g, '') // Remove any non-digit or non-plus characters
      .trim() // Remove leading/trailing whitespace
    console.log('Real-time Cleaned Mobile:', cleanedMobile) // Debug: Log the cleaned mobile number
    console.log('Raw Mobile Input:', gpData.contactPerson.mobile) // Debug: Log raw input
    if (!cleanedMobile) {
      newErrors.contactPersonMobile = 'Mobile number is required'
    } else if (!/^\+91[6-9]\d{9}$/.test(cleanedMobile)) {
      newErrors.contactPersonMobile = 'Mobile number must be 10 digits starting with 6-9 and prefixed with +91 (e.g., +919876543210)'
    } else {
      newErrors.contactPersonMobile = '' // Explicitly clear error
    }
    if (!gpData.DueDays) {
      newErrors.DueDays = 'Please select default due days'
    } else {
      newErrors.DueDays = '' // Explicitly clear error
    }
    setErrors((prev) => ({ ...prev, ...newErrors }))
  }, [gpData.contactPerson.mobile, gpData.DueDays])

  const fetchGPData = async () => {
    try {
      const response = await gpAdminAPI.getDashboard()
      const { gramPanchayat } = response.data.data
      setGpData({
        name: gramPanchayat.name || '',
        uniqueId: gramPanchayat.uniqueId || '',
        district: gramPanchayat.district || '',
        taluk: gramPanchayat.taluk || '',
        state: gramPanchayat.state || '',
        address: gramPanchayat.address || '',
        pincode: gramPanchayat.pincode || '',
        DueDays: gramPanchayat.DueDays || '',
        contactPerson: {
          name: gramPanchayat.contactPerson.name || '',
          mobile: gramPanchayat.contactPerson.mobile || ''
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
    console.log(`Updating ${section ? section + '.' : ''}${field}:`, value) // Debug: Log state updates
    if (section) {
      setGpData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }))
      setErrors(prev => ({ ...prev, [`${section}${field}`]: '' }))
    } else {
      setGpData(prev => ({
        ...prev,
        [field]: value
      }))
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!gpData.name.trim()) newErrors.name = 'Gram Panchayat name is required'
    if (!gpData.uniqueId.trim()) newErrors.uniqueId = 'Unique ID is required'
    if (!gpData.district.trim()) newErrors.district = 'District is required'
    if (!gpData.taluk.trim()) newErrors.taluk = 'Taluk is required'
    if (!gpData.state.trim()) newErrors.state = 'State is required'
    if (!gpData.address.trim()) newErrors.address = 'Address is required'
    if (!/^\d{6}$/.test(gpData.pincode)) newErrors.pincode = 'Pincode must be 6 digits'
    if (!gpData.DueDays) newErrors.DueDays = 'Please select default due days'
    if (!gpData.contactPerson.name.trim()) newErrors.contactPersonName = 'Contact person name is required'
    
    const cleanedMobile = gpData.contactPerson.mobile
      .replace(/[^\+\d]/g, '') // Remove any non-digit or non-plus characters
      .trim() // Remove leading/trailing whitespace
    console.log('Cleaned Mobile:', cleanedMobile) // Debug: Log the cleaned mobile number
    console.log('Raw Mobile Input:', gpData.contactPerson.mobile) // Debug: Log raw input
    if (!cleanedMobile) {
      newErrors.contactPersonMobile = 'Mobile number is required'
    } else if (!/^\+91[6-9]\d{9}$/.test(cleanedMobile)) {
      newErrors.contactPersonMobile = 'Mobile number must be 10 digits starting with 6-9 and prefixed with +91 (e.g., +919876543210)'
    } else {
      newErrors.contactPersonMobile = '' // Explicitly clear error
    }
    
    setErrors(newErrors)
    console.log('Errors:', newErrors) // Debug: Log the errors object
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    // if (!validateForm()) {
    //   showError('Please correct the errors in the form')
    //   return
    // }
    setSaving(true)
    try {
      await gpAdminAPI.updateGPSettings({
        name: gpData.name,
        uniqueId: gpData.uniqueId,
        district: gpData.district,
        taluk: gpData.taluk,
        state: gpData.state,
        address: gpData.address,
        pincode: gpData.pincode,
        DueDays: gpData.DueDays,
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
        <div className="flex items-center space-x-4">
          <BackButton link="/" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">GP Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your Gram Panchayat settings and configuration
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || Object.keys(errors).some(key => errors[key])}
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
                Gram Panchayat Name *
              </label>
              <input
                type="text"
                value={gpData.name}
                onChange={(e) => handleChange(null, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter GP name"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unique ID *
              </label>
              <input
                type="text"
                value={gpData.uniqueId}
                onChange={(e) => handleChange(null, 'uniqueId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter unique ID"
              />
              {errors.uniqueId && <p className="text-sm text-red-600 mt-1">{errors.uniqueId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <input
                  type="text"
                  value={gpData.district}
                  onChange={(e) => handleChange(null, 'district', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter district"
                />
                {errors.district && <p className="text-sm text-red-600 mt-1">{errors.district}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taluk *
                </label>
                <input
                  type="text"
                  value={gpData.taluk}
                  onChange={(e) => handleChange(null, 'taluk', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter taluk"
                />
                {errors.taluk && <p className="text-sm text-red-600 mt-1">{errors.taluk}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={gpData.state}
                  onChange={(e) => handleChange(null, 'state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter state"
                />
                {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={gpData.pincode}
                  onChange={(e) => handleChange(null, 'pincode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter pincode"
                />
                {errors.pincode && <p className="text-sm text-red-600 mt-1">{errors.pincode}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Due Days *
              </label>
              <select
                name="DueDays"
                id="days"
                value={gpData.DueDays}
                onChange={(e) => handleChange(null, 'DueDays', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="" disabled>Select Due Days</option>
                {[...Array(15)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} Day{i + 1 > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              {errors.DueDays && <p className="text-sm text-red-600 mt-1">{errors.DueDays}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complete Office Address *
              </label>
              <textarea
                value={gpData.address}
                onChange={(e) => handleChange(null, 'address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter complete address"
              />
              {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
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
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
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
                Contact Person Name *
              </label>
              <input
                type="text"
                value={gpData.contactPerson.name}
                onChange={(e) => handleChange('contactPerson', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter contact person name"
              />
              {errors.contactPersonName && <p className="text-sm text-red-600 mt-1">{errors.contactPersonName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                value={gpData.contactPerson.mobile}
                onChange={(e) => handleChange('contactPerson', 'mobile', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="+91 9876543210"
              />
              {errors.contactPersonMobile && <p className="text-sm text-red-600 mt-1">{errors.contactPersonMobile}</p>}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Settings