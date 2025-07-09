import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { superAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ArrowLeft, Building2 } from 'lucide-react'

const AddGramPanchayat = () => {
  const [formData, setFormData] = useState({
    name: '',
    uniqueId: '',
    district: '',
    taluk: '',
    address: '',
    pincode: '',
    state: '',
    contactPerson: {
      name: '',
      mobile: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ]

  const districts = {
    'Karnataka': ['Bangalore Urban', 'Bangalore Rural', 'Mysore', 'Mandya', 'Hassan'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam']
  }

  const taluks = {
    'Bangalore Urban': ['Bangalore North', 'Bangalore South', 'Anekal'],
    'Mysore': ['Mysore', 'Hunsur', 'Nanjangud'],
    'Chennai': ['Chennai North', 'Chennai South', 'Tambaram']
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('contactPerson.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        contactPerson: {
          ...prev.contactPerson,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await superAdminAPI.createGramPanchayat(formData)
      showSuccess('Gram Panchayat created successfully!')
      navigate('/super-admin/gram-panchayats')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create Gram Panchayat')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/super-admin/gram-panchayats')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Gram Panchayat</h1>
          <p className="text-gray-600 mt-1">Create a new Gram Panchayat in the system</p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8"
      >
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">Gram Panchayat Details</h2>
            <p className="text-gray-600">Fill in the information below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gram Panchayat Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter Gram Panchayat name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unique ID *
              </label>
              <input
                type="text"
                name="uniqueId"
                required
                value={formData.uniqueId}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter unique ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select State</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District *
              </label>
              <select
                name="district"
                required
                value={formData.district}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select District</option>
                {formData.state && districts[formData.state]?.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taluk *
              </label>
              <select
                name="taluk"
                required
                value={formData.taluk}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Taluk</option>
                {formData.district && taluks[formData.district]?.map(taluk => (
                  <option key={taluk} value={taluk}>{taluk}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode *
              </label>
              <input
                type="text"
                name="pincode"
                required
                value={formData.pincode}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter pincode"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complete Address *
            </label>
            <textarea
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Enter complete address"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Person Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  name="contactPerson.name"
                  required
                  value={formData.contactPerson.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Mobile *
                </label>
                <input
                  type="tel"
                  name="contactPerson.mobile"
                  required
                  value={formData.contactPerson.mobile}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/super-admin/gram-panchayats')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                'Create Gram Panchayat'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AddGramPanchayat