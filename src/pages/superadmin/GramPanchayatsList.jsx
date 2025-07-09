import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { superAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmDialog from '../../components/ConfirmDialog'
import { 
  Plus, 
  Search, 
  Eye, 
  Trash2,
  Building2,
  Users,
  MapPin,
  Filter,
  Download,
  MoreVertical,
  Edit,
  Phone,
  Mail
} from 'lucide-react'

const GramPanchayatsList = () => {
  const [gramPanchayats, setGramPanchayats] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' })
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchGramPanchayats()
  }, [searchTerm])

  const fetchGramPanchayats = async () => {
    try {
      const response = await superAdminAPI.getGramPanchayats({ 
        search: searchTerm,
        page: 1,
        limit: 50 
      })
      setGramPanchayats(response.data.data.gramPanchayats)
    } catch (error) {
      showError('Failed to fetch Gram Panchayats')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await superAdminAPI.deleteGramPanchayat(id)
      showSuccess('Gram Panchayat deleted successfully')
      fetchGramPanchayats()
    } catch (error) {
      showError('Failed to delete Gram Panchayat')
      console.error('Delete error:', error)
    }
  }

  const openDeleteDialog = (id, name) => {
    setDeleteDialog({ open: true, id, name })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null, name: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gram Panchayats</h1>
          <p className="page-subtitle">
            Manage all Gram Panchayats in the water management system
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="btn-secondary flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Export Data
          </button>
          <Link
            to="/super-admin/gram-panchayats/add"
            className="btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Gram Panchayat
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Gram Panchayats by name, district, or unique ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 text-base"
            />
          </div>
          <button className="btn-secondary flex items-center lg:w-auto">
            <Filter className="w-5 h-5 mr-2" />
            Advanced Filters
          </button>
        </div>
      </motion.div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card overflow-hidden"
        >
          {gramPanchayats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Gram Panchayat</th>
                    <th className="table-header">Location</th>
                    <th className="table-header">Contact Person</th>
                    <th className="table-header">Administrators</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gramPanchayats.map((gp, index) => (
                    <motion.tr
                      key={gp._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="table-row"
                    >
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-base font-semibold text-gray-900">{gp.name}</div>
                            <div className="text-sm text-gray-500">ID: {gp.uniqueId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">{gp.district}</div>
                            <div className="text-sm text-gray-500">{gp.state}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <div className="font-medium text-gray-900">{gp.contactPerson?.name}</div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            {gp.contactPerson?.mobile}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="font-semibold text-blue-600">{gp.adminUsers || 0}</span>
                            <span className="text-sm text-gray-500 ml-1">Admins</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-emerald-600" />
                            <span className="font-semibold text-emerald-600">{gp.mobileUsers || 0}</span>
                            <span className="text-sm text-gray-500 ml-1">Users</span>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="badge badge-success">
                          Active
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/super-admin/gram-panchayats/${gp._id}`)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(gp._id, gp.name)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
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
              <Building2 className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Gram Panchayats found</h3>
              <p className="text-gray-600 mb-6 text-lg">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first Gram Panchayat'}
              </p>
              {!searchTerm && (
                <Link
                  to="/super-admin/gram-panchayats/add"
                  className="btn-primary inline-flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Gram Panchayat
                </Link>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {gramPanchayats.map((gp, index) => (
          <motion.div
            key={gp._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="mobile-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{gp.name}</h3>
                  <p className="text-sm text-gray-600">ID: {gp.uniqueId}</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-3" />
                <span>{gp.district}, {gp.state}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-3" />
                <span>{gp.contactPerson?.name} - {gp.contactPerson?.mobile}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  <span>{gp.adminUsers || 0} Admins</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-emerald-600" />
                  <span>{gp.mobileUsers || 0} Mobile Users</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="badge badge-success">
                Active
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/super-admin/gram-panchayats/${gp._id}`)}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => openDeleteDialog(gp._id, gp.name)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {gramPanchayats.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Gram Panchayats found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first Gram Panchayat'}
            </p>
            {!searchTerm && (
              <Link
                to="/super-admin/gram-panchayats/add"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Gram Panchayat
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={() => handleDelete(deleteDialog.id)}
        title="Delete Gram Panchayat"
        message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}

export default GramPanchayatsList