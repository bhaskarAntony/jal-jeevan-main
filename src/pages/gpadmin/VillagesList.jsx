import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { gpAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmDialog from '../../components/ConfirmDialog'
import { 
  Plus, 
  Search, 
  Eye, 
  Trash2,
  MapPin,
  Users,
  Filter,
  Download,
  Edit,
  X,
  Save,
  FileText,
  Building,
  Calendar
} from 'lucide-react'

const VillagesList = () => {
  const [villages, setVillages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' })
  const [viewModal, setViewModal] = useState({ open: false, village: null })
  const [editModal, setEditModal] = useState({ open: false, village: null })
  const [editForm, setEditForm] = useState({ name: '', uniqueId: '', population: '', isActive: true })
  const [submitting, setSubmitting] = useState(false)
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchVillages()
  }, [searchTerm])

  const fetchVillages = async () => {
    setLoading(true)
    try {
      const response = await gpAdminAPI.getVillages({ search: searchTerm })
      setVillages(response.data.data.villages)
    } catch (error) {
      showError('Failed to fetch villages')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await gpAdminAPI.deleteVillage(id)
      showSuccess('Village deleted successfully')
      fetchVillages()
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete village')
      console.error('Delete error:', error)
    } finally {
      closeDeleteDialog()
    }
  }

  const handleExportVillages = async () => {
    try {
      const response = await gpAdminAPI.exportVillages()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'villages_export.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showSuccess('Villages exported successfully')
    } catch (error) {
      showError('Failed to export villages')
      console.error('Export villages error:', error)
    }
  }

  const openDeleteDialog = (id, name) => {
    setDeleteDialog({ open: true, id, name })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null, name: '' })
  }

  const openViewModal = async (id) => {
    try {
      const response = await gpAdminAPI.getVillage(id);
      console.log(response);
      
      setViewModal({ open: true, village: response.data.data })
    } catch (error) {
      showError('Failed to fetch village details')
      console.error('Fetch village error:', error)
    }
  }

  const closeViewModal = () => {
    setViewModal({ open: false, village: null })
  }

  const openEditModal = async (id) => {
    try {
      const response = await gpAdminAPI.getVillage(id)
      const village = response.data.data
      setEditForm({
        name: village.name,
        uniqueId: village.uniqueId,
        population: village.population,
        isActive: village.isActive
      })
      setEditModal({ open: true, village })
    } catch (error) {
      showError('Failed to fetch village details')
      console.error('Fetch village error:', error)
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
      if (!editForm.name || !editForm.uniqueId || !editForm.population) {
        showError('All fields are required')
        return
      }
      if (isNaN(editForm.population) || editForm.population <= 0) {
        showError('Population must be a positive number')
        return
      }
      const payload = {
        name: editForm.name,
        uniqueId: editForm.uniqueId,
        population: parseInt(editForm.population),
        isActive: editForm.isActive
      }
      await gpAdminAPI.updateVillage(editModal.village._id, payload)
      showSuccess('Village updated successfully')
      setEditModal({ open: false, village: null })
      setEditForm({ name: '', uniqueId: '', population: '', isActive: true })
      fetchVillages()
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update village')
      console.error('Update village error:', error)
    } finally {
      setSubmitting(false)
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
    <div className="space-y-6 max-w-7xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Villages Management</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Manage all villages in your Gram Panchayat
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExportVillages}
            className="flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Data
          </button>
          <Link
            to="/gp-admin/villages/add"
            className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Village
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search villages by name or unique ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
          <button
            className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all lg:w-auto"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {villages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Village
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Population
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Houses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {villages.map((village, index) => (
                  <motion.tr
                    key={village._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-all"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{village.name}</div>
                          <div className="text-sm text-gray-500">ID: {village.uniqueId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{village.population?.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{village.houseCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(village.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        village.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {village.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => navigate(`/gp-admin/village/${village._id}`)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-all"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(village._id)}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-all"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(village._id, village.name)}
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
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No villages found</h3>
            <p className="text-gray-600 mb-6 text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first village'}
            </p>
            {!searchTerm && (
              <Link
                to="/gp-admin/villages/add"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Village
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {villages.map((village, index) => (
          <motion.div
            key={village._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">{village.name}</h3>
                  <p className="text-xs text-gray-500">ID: {village.uniqueId}</p>
                </div>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                village.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {village.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Population:</span>
                <span className="font-medium text-gray-900">{village.population?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Houses:</span>
                <span className="font-medium text-gray-900">{village.houseCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium text-gray-900">
                  {new Date(village.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                 onClick={() => navigate(`/gp-admin/village/${village._id}`)}
                  className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-all"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => openEditModal(village._id)}
                  className="flex items-center px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-all"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
              </div>
              <button
                onClick={() => openDeleteDialog(village._id, village.name)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}

        {villages.length === 0 && (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No villages found</h3>
            <p className="text-gray-600 mb-6 text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first village'}
            </p>
            {!searchTerm && (
              <Link
                to="/gp-admin/villages/add"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Village
              </Link>
            )}
          </div>
        )}
      </div>

      {/* View Village Modal */}
      <AnimatePresence>
        {viewModal.open && viewModal.village && (
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
                  {viewModal.village.name}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Village Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Name</p>
                        <p className="text-sm text-gray-900">{viewModal.village.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Unique ID</p>
                        <p className="text-sm text-gray-900">{viewModal.village.uniqueId}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Users className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Population</p>
                        <p className="text-sm text-gray-900">{viewModal.village.population?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Building className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Houses</p>
                        <p className="text-sm text-gray-900">{viewModal.village.houseCount || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Users className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Gram Panchayat</p>
                        <p className="text-sm text-gray-900">{viewModal.village.gramPanchayat?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Created</p>
                        <p className="text-sm text-gray-900">
                          {new Date(viewModal.village.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Status</p>
                        <p className="text-sm text-gray-900">
                          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                            viewModal.village.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {viewModal.village.isActive ? 'Active' : 'Inactive'}
                          </span>
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

      {/* Edit Village Modal */}
      <AnimatePresence>
        {editModal.open && editModal.village && (
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
                  Edit Village
                </h2>
                <button
                  onClick={() => setEditModal({ open: false, village: null })}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Village Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter village name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unique ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="uniqueId"
                    value={editForm.uniqueId}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter unique ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Population <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="population"
                    value={editForm.population}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter population"
                    min="1"
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
                    onClick={() => setEditModal({ open: false, village: null })}
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
                        Save Changes
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
        title="Delete Village"
        message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}

export default VillagesList