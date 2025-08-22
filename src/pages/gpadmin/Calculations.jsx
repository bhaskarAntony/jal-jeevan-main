import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gpAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Calculator, Save, RotateCcw, Home, Building, Factory } from 'lucide-react'

const Calculations = () => {
  const [tariffData, setTariffData] = useState({
    domestic: {
      upTo7KL: 0,
      from7to10KL: 0,
      from10to15KL: 0,
      from15to20KL: 0,
      above20KL: 0
    },
    nonDomestic: {
      publicPrivateInstitutions: 0,
      commercialEnterprises: 0,
      industrialEnterprises: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchTariffData()
  }, [])

  const fetchTariffData = async () => {
    try {
      const response = await gpAdminAPI.getDashboard()
      const waterTariff = response.data.data.gramPanchayat.waterTariff || {
        domestic: {
          upTo7KL: 0,
          from7to10KL: 0,
          from10to15KL: 0,
          from15to20KL: 0,
          above20KL: 0
        },
        nonDomestic: {
          publicPrivateInstitutions: 0,
          commercialEnterprises: 0,
          industrialEnterprises: 0
        }
      }
      setTariffData(waterTariff)
      setLoading(false)
    } catch (error) {
      showError('Failed to fetch tariff data')
      console.error('Fetch error:', error)
      setLoading(false)
    }
  }

  const handleDomesticChange = (field, value) => {
    setTariffData(prev => ({
      ...prev,
      domestic: {
        ...prev.domestic,
        [field]: parseFloat(value) || 0
      }
    }))
  }

  const handleNonDomesticChange = (field, value) => {
    setTariffData(prev => ({
      ...prev,
      nonDomestic: {
        ...prev.nonDomestic,
        [field]: parseFloat(value) || 0
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await gpAdminAPI.updateTariff(tariffData)
      showSuccess('Tariff rates updated successfully!')
    } catch (error) {
      showError('Failed to update tariff rates')
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    fetchTariffData()
    showSuccess('Tariff rates reset to saved values')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Water Tariff Calculations</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Configure water tariff rates for different usage types
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleReset}
            className="flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domestic Tariff */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">Domestic Tariff</h2>
              <p className="text-gray-600 text-sm">Rates for residential usage (₹ per KL)</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Up to 7 KL
              </label>
              <input
                type="number"
                value={tariffData.domestic.upTo7KL}
                onChange={(e) => handleDomesticChange('upTo7KL', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 text-sm"
                placeholder="0.00"
                
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                7 to 10 KL
              </label>
              <input
                type="number"
                value={tariffData.domestic.from7to10KL}
                onChange={(e) => handleDomesticChange('from7to10KL', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 text-sm"
                placeholder="0.00"
                
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                10 to 15 KL
              </label>
              <input
                type="number"
                value={tariffData.domestic.from10to15KL}
                onChange={(e) => handleDomesticChange('from10to15KL', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 text-sm"
                placeholder="0.00"
                
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                15 to 20 KL
              </label>
              <input
                type="number"
                value={tariffData.domestic.from15to20KL}
                onChange={(e) => handleDomesticChange('from15to20KL', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 text-sm"
                placeholder="0.00"
                
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Above 20 KL
              </label>
              <input
                type="number"
                value={tariffData.domestic.above20KL}
                onChange={(e) => handleDomesticChange('above20KL', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 text-sm"
                placeholder="0.00"
                
                step="0.01"
              />
            </div>
          </div>
        </motion.div>

        {/* Non-Domestic Tariff */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">Non-Domestic Tariff</h2>
              <p className="text-gray-600 text-sm">Rates for commercial usage (₹ per KL)</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Public/Private Institutions
              </label>
              <input
                type="number"
                value={tariffData.nonDomestic.publicPrivateInstitutions}
                onChange={(e) => handleNonDomesticChange('publicPrivateInstitutions', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 text-sm"
                placeholder="0.00"
                
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Commercial Enterprises
              </label>
              <input
                type="number"
                value={tariffData.nonDomestic.commercialEnterprises}
                onChange={(e) => handleNonDomesticChange('commercialEnterprises', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 text-sm"
                placeholder="0.00"
                
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Industrial Enterprises
              </label>
              <input
                type="number"
                value={tariffData.nonDomestic.industrialEnterprises}
                onChange={(e) => handleNonDomesticChange('industrialEnterprises', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 text-sm"
                placeholder="0.00"
                
                step="0.01"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Calculation Example */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8"
      >
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Calculator className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">Calculation Example</h2>
            <p className="text-gray-600 text-sm">How the tariff is calculated for domestic usage</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">For 18 KL usage:</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>First 7 KL @ ₹{tariffData.domestic.upTo7KL.toFixed(2)}/KL:</span>
              <span>₹{(7 * tariffData.domestic.upTo7KL).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Next 3 KL @ ₹{tariffData.domestic.from7to10KL.toFixed(2)}/KL:</span>
              <span>₹{(3 * tariffData.domestic.from7to10KL).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Next 5 KL @ ₹{tariffData.domestic.from10to15KL.toFixed(2)}/KL:</span>
              <span>₹{(5 * tariffData.domestic.from10to15KL).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Next 3 KL @ ₹{tariffData.domestic.from15to20KL.toFixed(2)}/KL:</span>
              <span>₹{(3 * tariffData.domestic.from15to20KL).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
              <span>Total Amount:</span>
              <span>₹{(
                7 * tariffData.domestic.upTo7KL +
                3 * tariffData.domestic.from7to10KL +
                5 * tariffData.domestic.from10to15KL +
                3 * tariffData.domestic.from15to20KL
              ).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Calculations