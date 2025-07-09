import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { gpAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmDialog from '../../components/ConfirmDialog'
import { 
  ArrowLeft,
  MapPin,
  Users,
  Building,
  FileText,
  Calendar,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  Plus
} from 'lucide-react'

const VillageDetails = () => {
  const { id } = useParams()
  const [village, setVillage] = useState(null)
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModal, setViewModal] = useState({ open: false, house: null })
  const [editModal, setEditModal] = useState({ open: false, house: null })
  const [editForm, setEditForm] = useState({
    ownerName: '',
    aadhaarNumber: '',
    mobileNumber: '',
    address: '',
    waterMeterNumber: '',
    previousMeterReading: '',
    sequenceNumber: '',
    usageType: 'residential',
    propertyNumber: '',
    isActive: true
  })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, ownerName: '' })
  const [submitting, setSubmitting] = useState(false)
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchVillageDetails()
  }, [id])

  const fetchVillageDetails = async () => {
    setLoading(true)
    try {
      const response = await gpAdminAPI.getVillage(id)
      const { village, houses } = response.data.data
      setVillage(village)
      setHouses(houses)
    } catch (error) {
      showError('Failed to fetch village details')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const openViewModal = async (houseId) => {
    try {
      const response = await gpAdminAPI.getHouse(houseId)
      setViewModal({ open: true, house: response.data.data.house })
    } catch (error) {
      showError('Failed to fetch house details')
      console.error('Fetch house error:', error)
    }
  }

  const closeViewModal = () => {
    setViewModal({ open: false, house: null })
  }

  const openEditModal = async (houseId) => {
    try {
      const response = await gpAdminAPI.getHouse(houseId)
      const house = response.data.data.house
      setEditForm({
        ownerName: house.ownerName,
        aadhaarNumber: house.aadhaarNumber,
        mobileNumber: house.mobileNumber,
        address: house.address,
        waterMeterNumber: house.waterMeterNumber,
        previousMeterReading: house.previousMeterReading,
        sequenceNumber: house.sequenceNumber,
        usageType: house.usageType,
        propertyNumber: house.propertyNumber,
        isActive: house.isActive
      })
      setEditModal({ open: true, house })
    } catch (error) {
      showError('Failed to fetch house details')
      console.error('Fetch house error:', error)
    }
  }

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (!editForm.ownerName || !editForm.aadhaarNumber || !editForm.mobileNumber || 
          !editForm.address || !editForm.waterMeterNumber || !editForm.previousMeterReading === '' ||
          !editForm.sequenceNumber || !editForm.usageType || !editForm.propertyNumber) {
        showError('All fields are required')
        return
      }
      if (isNaN(editForm.previousMeterReading) || editForm.previousMeterReading < 0) {
        showError('Previous meter reading must be a non-negative number')
        return
      }
      const payload = {
        ownerName: editForm.ownerName,
        aadhaarNumber: editForm.aadhaarNumber,
        mobileNumber: editForm.mobileNumber,
        address: editForm.address,
        waterMeterNumber: editForm.waterMeterNumber,
        previousMeterReading: parseFloat(editForm.previousMeterReading),
        sequenceNumber: editForm.sequenceNumber,
        usageType: editForm.usageType,
        propertyNumber: editForm.propertyNumber,
        isActive: editForm.isActive,
        village: id,
        gramPanchayat: village.gramPanchayat
      }
      await gpAdminAPI.updateHouse(editModal.house._id, payload)
      showSuccess('House updated successfully')
      setEditModal({ open: false, house: null })
      setEditForm({
        ownerName: '',
        aadhaarNumber: '',
        mobileNumber: '',
        address: '',
        waterMeterNumber: '',
        previousMeterReading: '',
        sequenceNumber: '',
        usageType: 'residential',
        propertyNumber: '',
        isActive: true
      })
      fetchVillageDetails()
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update house')
      console.error('Update house error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const openDeleteDialog = (houseId, ownerName) => {
    setDeleteDialog({ open: true, id: houseId, ownerName })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null, ownerName: '' })
  }

  const handleDelete = async (houseId) => {
    try {
      await gpAdminAPI.deleteHouse(houseId)
      showSuccess('House deleted successfully')
      fetchVillageDetails()
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete house')
      console.error('Delete house error:', error)
    } finally {
      closeDeleteDialog()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!village) {
    return (
      <div className="text-center py-16 max-w-4xl mx-auto">
        <MapPin className="w-20 h-20 text-gray-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Village not found</h3>
        <p className="text-gray-600 mb-6 text-sm">The requested village could not be found.</p>
        <button
          onClick={() => navigate('/gp-admin/villages')}
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Villages
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/gp-admin/villages')}
            className="p-3 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{village.name}</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Village details and houses</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/gp-admin/houses/add?village=${id}`)}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add House
          </button>
        </div>
      </div>

      {/* Village Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{village.name}</h2>
              <p className="text-gray-600 flex items-center mt-1 text-sm">
                <FileText className="w-4 h-4 mr-2" />
                ID: {village.uniqueId}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
              village.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {village.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="space-y-4">
            <div className="flex items-start">
              <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Population</p>
                <p className="text-sm text-gray-600">{village.population?.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Building className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Houses</p>
                <p className="text-sm text-gray-600">{houses.length}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Gram Panchayat</p>
                <p className="text-sm text-gray-600">{village.gramPanchayat?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Created</p>
                <p className="text-sm text-gray-600">
                  {new Date(village.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Houses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Houses in {village.name}</h2>
            <p className="text-gray-600 mt-1 text-sm">Manage houses in this village</p>
          </div>
          <button
            onClick={() => navigate(`/gp-admin/houses/add?village=${id}`)}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add House
          </button>
        </div>

      {houses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Property Number
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Water Meter Number
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Usage Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {houses.map((house, index) => (
                <motion.tr
                  key={house._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-all"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{house.ownerName}</div>
                    <div className="text-sm text-gray-500">{house.mobileNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{house.propertyNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{house.waterMeterNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{house.usageType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      house.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {house.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => navigate(`/gp-admin/houses/${house._id}`)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-all"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openEditModal(house._id)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-all"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(house._id, house.ownerName)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16">
          <Building className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No houses found</h3>
          <p className="text-gray-600 mb-6 text-sm">No houses have been added to this village yet.</p>
          <button
            onClick={() => navigate(`/gp-admin/houses/add?village=${id}`)}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First House
          </button>
        </div>
      )}
      </motion.div>

      {/* View House Modal */}
      <AnimatePresence>
        {viewModal.open && viewModal.house && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 overflow-y-auto py-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 my-auto sm:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {viewModal.house.ownerName}
                </h2>
                <button
                  onClick={closeViewModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">House Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <Users className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Owner Name</p>
                        <p className="text-sm text-gray-900">{viewModal.house.ownerName}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Aadhaar Number</p>
                        <p className="text-sm text-gray-900">{viewModal.house.aadhaarNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Mobile Number</p>
                        <p className="text-sm text-gray-900">{viewModal.house.mobileNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Address</p>
                        <p className="text-sm text-gray-900">{viewModal.house.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Water Meter Number</p>
                        <p className="text-sm text-gray-900">{viewModal.house.waterMeterNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Previous Meter Reading</p>
                        <p className="text-sm text-gray-900">{viewModal.house.previousMeterReading} KL</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Sequence Number</p>
                        <p className="text-sm text-gray-900">{viewModal.house.sequenceNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Building className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Usage Type</p>
                        <p className="text-sm text-gray-900 capitalize">{viewModal.house.usageType}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Property Number</p>
                        <p className="text-sm text-gray-900">{viewModal.house.propertyNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Status</p>
                        <p className="text-sm text-gray-900">
                          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                            viewModal.house.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {viewModal.house.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Created</p>
                        <p className="text-sm text-gray-900">
                          {new Date(viewModal.house.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={closeViewModal}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit House Modal */}
      <AnimatePresence>
        {editModal.open && editModal.house && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 overflow-y-auto py-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 my-auto sm:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Edit House
                </h2>
                <button
                  onClick={() => setEditModal({ open: false, house: null })}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Owner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={editForm.ownerName}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter owner name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Aadhaar Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={editForm.aadhaarNumber}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter Aadhaar number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mobileNumber"
                    value={editForm.mobileNumber}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter address"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Water Meter Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="waterMeterNumber"
                    value={editForm.waterMeterNumber}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter water meter number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Previous Meter Reading (KL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="previousMeterReading"
                    value={editForm.previousMeterReading}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter previous meter reading"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sequence Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sequenceNumber"
                    value={editForm.sequenceNumber}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter sequence number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Usage Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="usageType"
                    value={editForm.usageType}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    required
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="propertyNumber"
                    value={editForm.propertyNumber}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter property number"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editForm.isActive}
                    onChange={handleEditChange}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-semibold text-gray-700">
                    Active
                  </label>
                </div>
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditModal({ open: false, house: null })}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitting ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Updates
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={() => handleDelete(deleteDialog.id)}
        title="Delete House"
        message={`Are you sure you want to delete the house belonging to "${deleteDialog.ownerName}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}

export default VillageDetails