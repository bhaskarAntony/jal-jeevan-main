import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { gpAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ArrowLeft, Building, User, MapPin, Phone, CreditCard } from 'lucide-react'

const AddHouse = () => {
  const [formData, setFormData] = useState({
    village: '',
    ownerName: '',
    aadhaarNumber: '',
    mobileNumber: '',
    address: '',
    waterMeterNumber: '',
    previousMeterReading: 0,
    usageType: 'residential',
    propertyNumber: ''
  })
  const [errors, setErrors] = useState({})
  const [villages, setVillages] = useState([])
  const [loading, setLoading] = useState(false)
  const [villagesLoading, setVillagesLoading] = useState(true)
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchVillages()
  }, [])

  const fetchVillages = async () => {
    try {
      const response = await gpAdminAPI.getVillages()
      setVillages(response.data.data.villages || [])
    } catch (error) {
      showError('Failed to fetch villages')
      console.error('Fetch error:', error)
    } finally {
      setVillagesLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.village) newErrors.village = 'Village is required'
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required'
    if (!/^\d{12}$/.test(formData.aadhaarNumber)) newErrors.aadhaarNumber = 'Aadhaar number must be exactly 12 digits'
    if (!/^\+?\d{10,13}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Mobile number must be 10-13 digits'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.waterMeterNumber.trim()) newErrors.waterMeterNumber = 'Water meter number is required'
    if (!formData.propertyNumber.trim()) newErrors.propertyNumber = 'Property number is required'
    if (formData.previousMeterReading < 0) newErrors.previousMeterReading = 'Meter reading cannot be negative'
    if (!formData.usageType) newErrors.usageType = 'Usage type is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    // Clear error for the field being edited
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      showError('Please correct the errors in the form')
      return
    }
    setLoading(true)
    try {
      await gpAdminAPI.createHouse(formData)
      showSuccess('House added successfully!')
      navigate('/gp-admin/houses')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add house')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/gp-admin/houses')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New House</h1>
            <p className="text-gray-600 mt-1">Register a new house and water connection</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-900">House Details</h2>
            <p className="text-gray-600">Fill in the information below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Village *
                </label>
                <select
                  name="village"
                  required
                  value={formData.village}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={villagesLoading}
                >
                  <option value="">Select Village</option>
                  {villages.map(village => (
                    <option key={village._id} value={village._id}>
                      {village.name}
                    </option>
                  ))}
                </select>
                {villagesLoading && <p className="text-sm text-gray-500 mt-1">Loading villages...</p>}
                {errors.village && <p className="text-sm text-red-600 mt-1">{errors.village}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  required
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter owner's full name"
                />
                {errors.ownerName && <p className="text-sm text-red-600 mt-1">{errors.ownerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Number *
                </label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  required
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="1234-5678-9012"
                />
                {errors.aadhaarNumber && <p className="text-sm text-red-600 mt-1">{errors.aadhaarNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  required
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+91 9876543210"
                />
                {errors.mobileNumber && <p className="text-sm text-red-600 mt-1">{errors.mobileNumber}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complete Address *
                </label>
                <textarea
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter complete address"
                />
                {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Property Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Water Meter Number *
                </label>
                <input
                  type="text"
                  name="waterMeterNumber"
                  required
                  value={formData.waterMeterNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="WM001"
                />
                {errors.waterMeterNumber && <p className="text-sm text-red-600 mt-1">{errors.waterMeterNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Number *
                </label>
                <input
                  type="text"
                  name="propertyNumber"
                  required
                  value={formData.propertyNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="P001"
                />
                {errors.propertyNumber && <p className="text-sm text-red-600 mt-1">{errors.propertyNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage Type *
                </label>
                <select
                  name="usageType"
                  required
                  value={formData.usageType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="institutional">Institutional</option>
                  <option value="industrial">Industrial</option>
                </select>
                {errors.usageType && <p className="text-sm text-red-600 mt-1">{errors.usageType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Meter Reading
                </label>
                <input
                  type="number"
                  name="previousMeterReading"
                  value={formData.previousMeterReading}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">Leave as 0 for new connections</p>
                {errors.previousMeterReading && <p className="text-sm text-red-600 mt-1">{errors.previousMeterReading}</p>}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/gp-admin/houses')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              // disabled={loading || Object.keys(errors).length > 0}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                'Add House'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddHouse