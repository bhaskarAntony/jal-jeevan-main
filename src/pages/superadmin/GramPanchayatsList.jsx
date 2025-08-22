import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Mail,
  X,
  Save
} from 'lucide-react'

const GramPanchayatsList = () => {
  const [gramPanchayats, setGramPanchayats] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' })
  const [editModal, setEditModal] = useState({ open: false, gramPanchayat: null })
  const [editForm, setEditForm] = useState({
    name: '',
    uniqueId: '',
    district: '',
    taluk: '',
    address: '',
    pincode: '',
    state: '',
    contactPerson: { name: '', mobile: '' },
    waterTariff: {
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
    },
    qrCodeData: { upiId: '', merchantName: '' },
    isActive: true
  })
  const [submitting, setSubmitting] = useState(false)
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

 // Function to open edit modal and fetch data
const openEditModal = async (id) => {
  try {
    const response = await superAdminAPI.getGramPanchayat(id)
    const gp = response.data.data.gramPanchayat
    console.log(gp);
    
    setEditForm({
      name: gp.name || '',
      uniqueId: gp.uniqueId || '',
      district: gp.district || '',
      taluk: gp.taluk || '',
      address: gp.address || '',
      pincode: gp.pincode || '',
      state: gp.state || '',
      contactPerson: {
        name: gp.contactPerson?.name || '',
        mobile: gp.contactPerson?.mobile || ''
      },
      waterTariff: {
        domestic: {
          upTo7KL: gp.waterTariff?.domestic?.upTo7KL || 0,
          from7to10KL: gp.waterTariff?.domestic?.from7to10KL || 0,
          from10to15KL: gp.waterTariff?.domestic?.from10to15KL || 0,
          from15to20KL: gp.waterTariff?.domestic?.from15to20KL || 0,
          above20KL: gp.waterTariff?.domestic?.above20KL || 0
        },
        nonDomestic: {
          publicPrivateInstitutions: gp.waterTariff?.nonDomestic?.publicPrivateInstitutions || 0,
          commercialEnterprises: gp.waterTariff?.nonDomestic?.commercialEnterprises || 0,
          industrialEnterprises: gp.waterTariff?.nonDomestic?.industrialEnterprises || 0
        }
      },
      qrCodeData: {
        upiId: gp.qrCodeData?.upiId || '',
        merchantName: gp.qrCodeData?.merchantName || ''
      },
      isActive: gp.isActive ?? true
    })
    setEditModal({ open: true, gramPanchayat: gp })
  } catch (error) {
    showError('Failed to fetch Gram Panchayat details')
    console.error('Fetch GP error:', error)
  }
}

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      if (parent === 'contactPerson' || parent === 'qrCodeData') {
        setEditForm(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }))
      } else if (parent === 'waterTariff') {
        const [subParent, subChild] = child.split('.')
        setEditForm(prev => ({
          ...prev,
          waterTariff: {
            ...prev.waterTariff,
            [subParent]: {
              ...prev.waterTariff[subParent],
              [subChild]: value
            }
          }
        }))
      }
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const requiredFields = [
        'name', 'uniqueId', 'district', 'taluk', 'address', 'pincode', 'state',
        'contactPerson.name', 'contactPerson.mobile'
      ]
      for (const field of requiredFields) {
        const [parent, child] = field.split('.')
        if (child) {
          if (!editForm[parent][child]) {
            showError(`${field.replace('.', ' ')} is required`)
            return
          }
        } else if (!editForm[field]) {
          showError(`${field} is required`)
          return
        }
      }
      const numericFields = [
        'waterTariff.domestic.upTo7KL',
        'waterTariff.domestic.from7to10KL',
        'waterTariff.domestic.from10to15KL',
        'waterTariff.domestic.from15to20KL',
        'waterTariff.domestic.above20KL',
        'waterTariff.nonDomestic.publicPrivateInstitutions',
        'waterTariff.nonDomestic.commercialEnterprises',
        'waterTariff.nonDomestic.industrialEnterprises'
      ]
      for (const field of numericFields) {
        const [parent, subParent, subChild] = field.split('.')
        const value = editForm[parent][subParent][subChild]
        if (value && (isNaN(value) || value < 0)) {
          showError(`${field.replace('.', ' ')} must be a non-negative number`)
          return
        }
      }
      const payload = {
        ...editForm,
        waterTariff: {
          domestic: {
            upTo7KL: parseFloat(editForm.waterTariff.domestic.upTo7KL) || 0,
            from7to10KL: parseFloat(editForm.waterTariff.domestic.from7to10KL) || 0,
            from10to15KL: parseFloat(editForm.waterTariff.domestic.from10to15KL) || 0,
            from15to20KL: parseFloat(editForm.waterTariff.domestic.from15to20KL) || 0,
            above20KL: parseFloat(editForm.waterTariff.domestic.above20KL) || 0
          },
          nonDomestic: {
            publicPrivateInstitutions: parseFloat(editForm.waterTariff.nonDomestic.publicPrivateInstitutions) || 0,
            commercialEnterprises: parseFloat(editForm.waterTariff.nonDomestic.commercialEnterprises) || 0,
            industrialEnterprises: parseFloat(editForm.waterTariff.nonDomestic.industrialEnterprises) || 0
          }
        }
      }
      await superAdminAPI.updateGramPanchayat(editModal.gramPanchayat._id, payload)
      showSuccess('Gram Panchayat updated successfully')
      setEditModal({ open: false, gramPanchayat: null })
      fetchGramPanchayats()
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update Gram Panchayat')
      console.error('Update GP error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const closeEditModal = () => {
    setEditModal({ open: false, gramPanchayat: null })
    setEditForm({
      name: '',
      uniqueId: '',
      district: '',
      taluk: '',
      address: '',
      pincode: '',
      state: '',
      contactPerson: { name: '', mobile: '' },
      waterTariff: {
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
      },
      qrCodeData: { upiId: '', merchantName: '' },
      isActive: true
    })
  }

  const handleDelete = async (id) => {
    try {
      await superAdminAPI.deleteGramPanchayat(id)
      showSuccess('Gram Panchayat deleted successfully')
      fetchGramPanchayats()
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete Gram Panchayat')
      console.error('Delete error:', error)
    } finally {
      closeDeleteDialog()
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
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Gram Panchayats</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Manage all Gram Panchayats in the water management system
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/super-admin/gram-panchayats/add"
            className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
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
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Gram Panchayats by name, district, or unique ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          {gramPanchayats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Gram Panchayat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Administrators
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
                  {gramPanchayats.map((gp, index) => (
                    <motion.tr
                      key={gp._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-all"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{gp.name}</div>
                            <div className="text-sm text-gray-500">ID: {gp.uniqueId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{gp.district}</div>
                            <div className="text-sm text-gray-500">{gp.state}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{gp.contactPerson?.name}</div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            {gp.contactPerson?.mobile}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-600">{gp.adminUsers || 0}</span>
                            <span className="text-sm text-gray-500 ml-1">Admins</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-emerald-600" />
                            <span className="text-sm font-semibold text-emerald-600">{gp.mobileUsers || 0}</span>
                            <span className="text-sm text-gray-500 ml-1">Users</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                          gp.isActive ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {gp.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/super-admin/gram-panchayats/${gp._id}`)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(gp._id)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(gp._id, gp.name)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
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
              <p className="text-gray-600 mb-6 text-sm">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first Gram Panchayat'}
              </p>
              {!searchTerm && (
                <Link
                  to="/super-admin/gram-panchayats/add"
                  className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
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
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4"
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
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                gp.isActive ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
              }`}>
                {gp.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/super-admin/gram-panchayats/${gp._id}`)}
                  className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-all"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => openEditModal(gp._id)}
                  className="flex items-center px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-all"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => openDeleteDialog(gp._id, gp.name)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all"
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
            <p className="text-gray-600 mb-6 text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first Gram Panchayat'}
            </p>
            {!searchTerm && (
              <Link
                to="/super-admin/gram-panchayats/add"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Gram Panchayat
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Edit Gram Panchayat Modal */}
      <AnimatePresence>
        {editModal.open && editModal.gramPanchayat && (
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
                  Edit Gram Panchayat
                </h2>
                <button
                  onClick={closeEditModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter Gram Panchayat name"
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
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={editForm.district}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter district"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Taluk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="taluk"
                    value={editForm.taluk}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter taluk"
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
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={editForm.pincode}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter pincode"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={editForm.state}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter state"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson.name"
                    value={editForm.contactPerson.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter contact person name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Person Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson.mobile"
                    value={editForm.contactPerson.mobile}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter contact mobile"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Domestic Tariff: Up to 7KL
                  </label>
                  <input
                    type="number"
                    name="waterTariff.domestic.upTo7KL"
                    value={editForm.waterTariff.domestic.upTo7KL}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter tariff for up to 7KL"
                    
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Domestic Tariff: 7-10KL
                  </label>
                  <input
                    type="number"
                    name="waterTariff.domestic.from7to10KL"
                    value={editForm.waterTariff.domestic.from7to10KL}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter tariff for 7-10KL"
                    
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Domestic Tariff: 10-15KL
                  </label>
                  <input
                    type="number"
                    name="waterTariff.domestic.from10to15KL"
                    value={editForm.waterTariff.domestic.from10to15KL}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter tariff for 10-15KL"
                    
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Domestic Tariff: 15-20KL
                  </label>
                  <input
                    type="number"
                    name="waterTariff.domestic.from15to20KL"
                    value={editForm.waterTariff.domestic.from15to20KL}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter tariff for 15-20KL"
                    
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Domestic Tariff: Above 20KL
                  </label>
                  <input
                    type="number"
                    name="waterTariff.domestic.above20KL"
                    value={editForm.waterTariff.domestic.above20KL}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter tariff for above 20KL"
                    
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Non-Domestic Tariff: Public/Private Institutions
                  </label>
                  <input
                    type="number"
                    name="waterTariff.nonDomestic.publicPrivateInstitutions"
                    value={editForm.waterTariff.nonDomestic.publicPrivateInstitutions}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter tariff for public/private institutions"
                    
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Non-Domestic Tariff: Commercial Enterprises
                  </label>
                  <input
                    type="number"
                    name="waterTariff.nonDomestic.commercialEnterprises"
                    value={editForm.waterTariff.nonDomestic.commercialEnterprises}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter tariff for commercial enterprises"
                    
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Non-Domestic Tariff: Industrial Enterprises
                  </label>
                  <input
                    type="number"
                    name="waterTariff.nonDomestic.industrialEnterprises"
                    value={editForm.waterTariff.nonDomestic.industrialEnterprises}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter tariff for industrial enterprises"
                    
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    name="qrCodeData.upiId"
                    value={editForm.qrCodeData.upiId}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter UPI ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    name="qrCodeData.merchantName"
                    value={editForm.qrCodeData.merchantName}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter merchant name"
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
                    onClick={closeEditModal}
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
        title="Delete Gram Panchayat"
        message={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}

export default GramPanchayatsList