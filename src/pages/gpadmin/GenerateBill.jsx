import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { gpAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Plus, Search, Home, Calendar, X } from 'lucide-react'

const GenerateBill = () => {
  const location = useLocation();
  console.log(location);
  
  const [houses, setHouses] = useState([])
  const [filteredHouses, setFilteredHouses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [billData, setBillData] = useState({
    month: '',
    year: new Date().getFullYear(),
    currentReading: '',
    dueDate: '',
    previousReading:0,
    totalUsage:0
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchHouses()
  }, [])
  useEffect(()=>{
    setBillData({...billData, totalUsage:billData.previousReading+billData.currentReading})
  },[billData.currentReading, billData.previousReading])

  useEffect(() => {
    setFilteredHouses(
      houses.filter(house =>
        house.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        house.waterMeterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        house.village?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, houses])

  const fetchHouses = async () => {
    setLoading(true)
    try {
      const response = await gpAdminAPI.getHouses({ limit: 100 })
      setHouses(response.data.data.houses)
      setFilteredHouses(response.data.data.houses)
    } catch (error) {
      showError('Failed to fetch houses')
      console.error('Fetch houses error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHouseSelect = (house) => {
    setSelectedHouse(house)
    setSearchTerm('')
    setFilteredHouses(houses)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBillData(prev => ({
      ...prev,
      [name]: name === 'month' ? value : value
    }))
  }

  const handleDueDateChange = (e) => {
    setBillData(prev => ({ ...prev, dueDate: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedHouse) {
      showError('Please select a house')
      return
    }
    if (!billData.month || !billData.year || !billData.currentReading || !billData.dueDate) {
      showError('All fields are required')
      return
    }
    if (parseFloat(billData.currentReading) < 0) {
      showError('Current reading cannot be negative')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        month: billData.month,
        year: parseInt(billData.year),
        currentReading: parseFloat(billData.currentReading),
        previousReading:  parseFloat(billData.previousReading),
        totalUsage:parseFloat(billData.totalUsage),
        dueDate: new Date(billData.dueDate).toISOString()
      }
      await gpAdminAPI.generateBill(selectedHouse._id, payload)
      showSuccess('Bill generated successfully')
      navigate('/gp-admin/bills')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to generate bill')
      console.error('Generate bill error:', error)
    } finally {
      setSubmitting(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Generate New Bill</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Create a new water bill for a selected house
          </p>
        </div>
        <Link
          to={location.state.loc?location.state.loc:'/gp-admin/bills'}
          className="flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
        >
          <X className="w-5 h-5 mr-2" />
          Cancel
        </Link>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* House Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select House <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by owner name, meter number, or village..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
              />
            </div>
            {searchTerm && filteredHouses.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredHouses.map(house => (
                  <div
                    key={house._id}
                    onClick={() => handleHouseSelect(house)}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-all"
                  >
                    <Home className="w-5 h-5 text-emerald-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{house.ownerName}</p>
                      <p className="text-xs text-gray-500">
                        {house.waterMeterNumber} • {house.village?.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {searchTerm && filteredHouses.length === 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-500">
                No houses found
              </div>
            )}
            {selectedHouse && (
              <div className="mt-3 p-3 bg-emerald-50 rounded-lg flex items-center">
                <Home className="w-5 h-5 text-emerald-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedHouse.ownerName}</p>
                  <p className="text-xs text-gray-500">
                    {selectedHouse.waterMeterNumber} • {selectedHouse.village.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedHouse(null)}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Bill Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Month <span className="text-red-500">*</span>
              </label>
              <select
                name="month"
                value={billData.month}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                required
              >
                <option value="">Select Month</option>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="year"
                value={billData.year}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                placeholder="Enter year"
                min="2000"
                max="2099"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Previous Meter Reading (KL) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="previousReading"
                value={billData.previousReading}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Reading (KL) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="currentReading"
                value={billData.currentReading}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Usage(KL) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalUsage"
                value={billData.totalUsage}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={billData.dueDate}
                onChange={handleDueDateChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <Link
             to={location.state.loc?location.state.loc:'/gp-admin/bills'}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Generate Bill
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default GenerateBill