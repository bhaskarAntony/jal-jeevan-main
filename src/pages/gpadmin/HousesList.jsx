import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { gpAdminAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import * as XLSX from 'xlsx';
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Building,
  MapPin,
  Phone,
  Download,
  Upload,
  Edit,
  X,
  Save,
  File,
  Filter
} from 'lucide-react';

const HousesList = () => {
  const [houses, setHouses] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tempVillageFilter, setTempVillageFilter] = useState('');
  const [tempBillStatusFilter, setTempBillStatusFilter] = useState('');
  const [villageFilter, setVillageFilter] = useState('');
  const [billStatusFilter, setBillStatusFilter] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [editModal, setEditModal] = useState({ open: false, house: null });
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [otpAction, setOtpAction] = useState(null); // 'edit' or 'delete'
  const [otpActionData, setOtpActionData] = useState(null); // Data for the action (e.g., house ID for delete)
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    ownerName: '',
    mobileNumber: '',
    address: '',
    waterMeterNumber: '',
    usageType: 'residential',
    propertyNumber: '',
    aadhaarNumber: '',
    previousMeterReading: 0,
    sequenceNumber: '',
    isActive: true
  });
  const [editLoading, setEditLoading] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [villageId, setVillageId] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const { showSuccess, showError } = useToast();
  const { user, requestLoginOTP, verifyLoginOTP } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVillages();
    fetchHouses();
  }, [searchTerm, villageFilter, billStatusFilter]);

  const fetchVillages = async () => {
    try {
      const response = await gpAdminAPI.getVillages();
      setVillages(response.data.data.villages || []);
    } catch (error) {
      showError('Failed to fetch villages');
      console.error('Fetch villages error:', error);
    }
  };

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const response = await gpAdminAPI.getHouses({
        search: searchTerm || undefined,
        villageId: villageFilter || undefined,
        billStatus: billStatusFilter || undefined
      });
      let fetchedHouses = response.data.data.houses || [];
      fetchedHouses = sortHouses(fetchedHouses, sortOption);
      setHouses(fetchedHouses);
    } catch (error) {
      showError('Failed to fetch houses');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortHouses = (houses, sortOption) => {
    const sorted = [...houses];
    switch (sortOption) {
      case 'ownerNameAsc':
        return sorted.sort((a, b) => a.ownerName.localeCompare(b.ownerName));
      case 'ownerNameDesc':
        return sorted.sort((a, b) => b.ownerName.localeCompare(b.ownerName));
      case 'totalDueAsc':
        return sorted.sort((a, b) => (a.totalDue || 0) - (b.totalDue || 0));
      case 'totalDueDesc':
        return sorted.sort((a, b) => (b.totalDue || 0) - (a.totalDue || 0));
      default:
        return sorted;
    }
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleVillageFilterChange = (e) => {
    setTempVillageFilter(e.target.value);
  };

  const handleBillStatusFilterChange = (e) => {
    setTempBillStatusFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
    setHouses(sortHouses(houses, newSortOption));
  };

  const handleApplyFilters = () => {
    setVillageFilter(tempVillageFilter);
    setBillStatusFilter(tempBillStatusFilter);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setTempVillageFilter('');
    setTempBillStatusFilter('');
    setVillageFilter('');
    setBillStatusFilter('');
    setSortOption('');
  };

  const openEditModal = async (id) => {
    try {
      const response = await gpAdminAPI.getHouse(id);
      const house = response.data.data.house;
      setEditForm({
        ownerName: house.ownerName || '',
        mobileNumber: house.mobileNumber || '',
        address: house.address || '',
        waterMeterNumber: house.waterMeterNumber || '',
        usageType: house.usageType || 'residential',
        propertyNumber: house.propertyNumber || '',
        aadhaarNumber: house.aadhaarNumber || '',
        previousMeterReading: house.previousMeterReading || 0,
        sequenceNumber: house.sequenceNumber || '',
        isActive: house.isActive ?? true
      });
      setOtpAction('edit');
      setOtpActionData({ house });
      setIsOTPModalOpen(true); // Show OTP verification popup
    } catch (error) {
      showError('Failed to fetch house details');
      console.error('Fetch error:', error);
    }
  };

  const closeEditModal = () => {
    setEditModal({ open: false, house: null });
    setEditForm({
      ownerName: '',
      mobileNumber: '',
      address: '',
      waterMeterNumber: '',
      usageType: 'residential',
      propertyNumber: '',
      aadhaarNumber: '',
      previousMeterReading: 0,
      sequenceNumber: '',
      isActive: true
    });
  };

  const openDeleteDialog = (id, name) => {
    setOtpAction('delete');
    setOtpActionData({ id, name });
    setIsOTPModalOpen(true); // Show OTP verification popup
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null, name: '' });
  };

  const handleSendOTP = async () => {
    try {
      setOtpLoading(true);
      const otpResponse = await requestLoginOTP(user.email);
      if (otpResponse.success) {
        showSuccess(otpResponse.message);
        setShowOTPInput(true);
      } else {
        showError(otpResponse.message);
      }
    } catch (error) {
      showError('Failed to send OTP');
      console.error('Send OTP error:', error);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setOtpLoading(true);
      const response = await verifyLoginOTP(user.email, otpInput);
      if (response.success) {
        showSuccess('OTP verified successfully');
        setIsOTPModalOpen(false);
        setShowOTPInput(false);
        setOtpInput('');
        if (otpAction === 'edit') {
          setEditModal({ open: true, house: otpActionData.house });
        } else if (otpAction === 'delete') {
          setDeleteDialog({ open: true, id: otpActionData.id, name: otpActionData.name });
        }
        setOtpAction(null);
        setOtpActionData(null);
      } else {
        showError(response.message);
      }
    } catch (error) {
      showError('Invalid OTP');
      console.error('Verify OTP error:', error);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const requiredFields = ['ownerName', 'mobileNumber', 'address', 'waterMeterNumber', 'usageType', 'propertyNumber', 'sequenceNumber'];
      for (const field of requiredFields) {
        if (!editForm[field]) {
          showError(`${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`);
          return;
        }
      }
      await gpAdminAPI.updateHouse(editModal.house._id, editForm);
      showSuccess('House updated successfully');
      closeEditModal();
      fetchHouses();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update house');
      console.error('Update error:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await gpAdminAPI.deleteHouse(id);
      showSuccess('House deleted successfully');
      fetchHouses();
    } catch (error) {
      showError('Failed to delete house');
      console.error('Delete error:', error);
    } finally {
      closeDeleteDialog();
    }
  };

  const handleExport = async () => {
    try {
      const response = await gpAdminAPI.exportHouses();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'houses_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSuccess('Houses data exported successfully');
    } catch (error) {
      showError('Failed to export houses data');
    }
  };

  const openUploadModal = () => {
    setUploadModal(true);
  };

  const closeUploadModal = () => {
    setUploadModal(false);
    setUploadFile(null);
    setVillageId('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!villageId) {
      showError('Please select a village');
      return;
    }
    if (!uploadFile) {
      showError('Please select an Excel file');
      return;
    }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('villageId', villageId);
      formData.append('file', uploadFile);
      const response = await gpAdminAPI.uploadHouses(formData);
      showSuccess(response.data.message);
      fetchHouses();
      closeUploadModal();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to upload houses');
      console.error('Upload error:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownloadSampleExcel = () => {
    const sampleData = [
      {
        'Owner Name': 'John Doe',
        'Aadhaar Number': '123456789012',
        'Mobile Number': '9876543210',
        'Address': '123 Main St',
        'Water Meter Number': 'WM12345',
        'Previous Meter Reading': 100,
        'Sequence Number': 'SEQ001',
        'Usage Type': 'residential',
        'Property Number': 'PROP001'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Houses');
    XLSX.writeFile(wb, 'sample_houses.xlsx');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Houses Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage all houses and their water connections
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={openUploadModal}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
          <Link
            to="/gp-admin/houses/add"
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add House
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 flex-wrap">
          <div className="flex-1 flex items-center space-x-2 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search houses by owner name, meter number, mobile, or village..."
                value={searchInput}
                onChange={handleSearchChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                ref={searchInputRef}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                autoFocus
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
            >
              Search
            </button>
          </div>
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <select
              value={tempVillageFilter}
              onChange={handleVillageFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm min-w-[120px]"
            >
              <option value="">All Villages</option>
              {villages.map(village => (
                <option key={village._id} value={village._id}>{village.name}</option>
              ))}
            </select>
            <select
              value={tempBillStatusFilter}
              onChange={handleBillStatusFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm min-w-[120px]"
            >
              <option value="">All Bills</option>
              <option value="unpaid">Unpaid Bills</option>
              <option value="paid">Paid Bills</option>
            </select>
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm min-w-[120px]"
            >
              <option value="">Sort: None</option>
              <option value="ownerNameAsc">Owner Name (A-Z)</option>
              <option value="ownerNameDesc">Owner Name (Z-A)</option>
              <option value="totalDueAsc">Total Due (Low to High)</option>
              <option value="totalDueDesc">Total Due (High to Low)</option>
            </select>
            <button
              onClick={handleApplyFilters}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {houses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact & Village
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Billing Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {houses.map((house, index) => (
                    <motion.tr
                      onClick={() => navigate(`/gp-admin/houses/${house._id}`)}
                      key={house._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Building className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{house.ownerName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{house.mobileNumber}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{house.village?.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            Property: {house.propertyNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            Meter: {house.waterMeterNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            Sequence: {house.sequenceNumber}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            Type: {house.usageType}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            Unpaid: {house.unpaidBillsCount || 0}
                          </div>
                          <div className={`text-sm ${(house.totalDue || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            Due: ₹{house.totalDue || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          house.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {house.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/gp-admin/houses/${house._id}`); }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(house._id); }}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openDeleteDialog(house._id, house.ownerName); }}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No houses found</h3>
              <p className="text-gray-600 mb-4 text-sm">
                {searchTerm || villageFilter || billStatusFilter ? 'Try adjusting your search or filter terms' : 'Get started by adding your first house'}
              </p>
              {!searchTerm && !villageFilter && !billStatusFilter && (
                <Link
                  to="/gp-admin/houses/add"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add House
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {houses.map((house, index) => (
          <motion.div
            key={house._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Building className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">{house.ownerName}</h3>
                  <p className="text-xs text-gray-500">Meter: {house.waterMeterNumber}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                house.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {house.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center text-xs text-gray-600">
                <Phone className="w-3 h-3 mr-2" />
                <span>{house.mobileNumber}</span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <MapPin className="w-3 h-3 mr-2" />
                <span>{house.village?.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Property: {house.propertyNumber}</span>
                <span className="text-gray-600">Sequence: {house.sequenceNumber}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 capitalize">Type: {house.usageType}</span>
                <span className="text-gray-600">Unpaid Bills: {house.unpaidBillsCount || 0}</span>
              </div>
              <div className="flex items-center justify-end text-xs">
                <span className={`font-medium ${(house.totalDue || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Due: ₹{house.totalDue || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/gp-admin/houses/${house._id}`)}
                  className="flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </button>
                <button
                  onClick={() => openEditModal(house._id)}
                  className="flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </button>
              </div>
              <button
                onClick={() => openDeleteDialog(house._id, house.ownerName)}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}

        {houses.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No houses found</h3>
            <p className="text-gray-600 mb-4 text-sm">
              {searchTerm || villageFilter || billStatusFilter ? 'Try adjusting your search or filter terms' : 'Get started by adding your first house'}
            </p>
            {!searchTerm && !villageFilter && !billStatusFilter && (
              <Link
                to="/gp-admin/houses/add"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add House
              </Link>
            )}
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {isOTPModalOpen && (
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
                  Verify OTP to {otpAction === 'edit' ? 'Edit' : 'Delete'}
                </h2>
                <button
                  onClick={() => { setIsOTPModalOpen(false); setShowOTPInput(false); setOtpInput(''); setOtpAction(null); setOtpActionData(null); }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-5">
                {!showOTPInput ? (
                  <>
                    <p className="text-sm text-gray-600">
                      To {otpAction === 'edit' ? 'edit' : 'delete'} this house, you need to verify your identity with an OTP sent to {user.email}.
                    </p>
                    <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => { setIsOTPModalOpen(false); setShowOTPInput(false); setOtpInput(''); setOtpAction(null); setOtpActionData(null); }}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendOTP}
                        disabled={otpLoading}
                        className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {otpLoading ? (
                          <LoadingSpinner size="sm" color="white" />
                        ) : (
                          'Send OTP'
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      An OTP has been sent to {user.email}. Please enter it below to proceed with {otpAction === 'edit' ? 'editing' : 'deleting'} the house.
                    </p>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        OTP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                        placeholder="Enter OTP"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => { setIsOTPModalOpen(false); setShowOTPInput(false); setOtpInput(''); setOtpAction(null); setOtpActionData(null); }}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleVerifyOTP}
                        disabled={otpLoading || !otpInput}
                        className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {otpLoading ? (
                          <LoadingSpinner size="sm" color="white" />
                        ) : (
                          'Verify OTP'
                        )}
                      </button>
                    </div>
                  </>
                )}
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
                  onClick={closeEditModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
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
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
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
                  <input
                    type="text"
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter address"
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
                    <option value="institutional">Institutional</option>
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
                    Aadhaar Number
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
                    Previous Meter Reading
                  </label>
                  <input
                    type="number"
                    name="previousMeterReading"
                    value={editForm.previousMeterReading}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter previous meter reading"
                    min="0"
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
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {editLoading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
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

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {uploadModal && (
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
                  Bulk Import Houses
                </h2>
                <button
                  onClick={closeUploadModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Village <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={villageId}
                    onChange={(e) => setVillageId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    required
                  >
                    <option value="">Select a village</option>
                    {villages.map(village => (
                      <option key={village._id} value={village._id}>{village.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Excel File <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <File className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          {uploadFile ? uploadFile.name : 'Click to select Excel file'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleDownloadSampleExcel}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Sample Excel
                  </button>
                </div>
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeUploadModal}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploadLoading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
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
        message={`Are you sure you want to delete the house owned by "${deleteDialog.name}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default HousesList;