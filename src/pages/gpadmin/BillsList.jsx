import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { gpAdminAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Plus, Search, Eye, FileText, Filter, Download, Printer, DollarSign, Calendar, User, X, QrCode, Pencil, Trash2
} from 'lucide-react';

const BillsList = () => {
  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, total: 1, count: 0, totalRecords: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [billDetails, setBillDetails] = useState(null);
  const [editFormData, setEditFormData] = useState({
    currentReading: '',
    month: '',
    year: '',
    dueDate: '',
    interest: '',
    others: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMode: 'cash',
    transactionId: '',
    remarks: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchBills();
  }, [searchTerm, statusFilter, pagination.current]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await gpAdminAPI.getBills({
        page: pagination.current,
        limit: 10,
        search: searchTerm,
        status: statusFilter
      });
      setBills(response.data.data.bills);
      setPagination(response.data.data.pagination);
    } catch (error) {
      showError('Failed to fetch bills');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleViewBill = async (billId) => {
    try {
      const response = await gpAdminAPI.getBill(billId);
      setBillDetails(response.data.data);
      setSelectedBill(billId);
      setIsBillModalOpen(true);
    } catch (error) {
      showError('Failed to fetch bill details');
      console.error('Fetch bill error:', error);
    }
  };

  const handleEditBill = async (billId) => {
    try {
      const response = await gpAdminAPI.getBill(billId);
      const bill = response.data.data.bill;
      setEditFormData({
        currentReading: bill.currentReading.toString(),
        month: bill.month,
        year: bill.year.toString(),
        dueDate: new Date(bill.dueDate).toISOString().split('T')[0],
        interest: bill.interest.toString(),
        others: bill.others.toString()
      });
      setSelectedBill(billId);
      setIsEditModalOpen(true);
    } catch (error) {
      showError('Failed to fetch bill details for editing');
      console.error('Fetch bill error:', error);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const payload = {
        currentReading: parseFloat(editFormData.currentReading),
        month: editFormData.month,
        year: parseInt(editFormData.year),
        dueDate: editFormData.dueDate,
        interest: parseFloat(editFormData.interest) || 0,
        others: parseFloat(editFormData.others) || 0
      };
      await gpAdminAPI.updateBill(selectedBill, payload);
      showSuccess('Bill updated successfully');
      setIsEditModalOpen(false);
      setEditFormData({
        currentReading: '',
        month: '',
        year: '',
        dueDate: '',
        interest: '',
        others: ''
      });
      fetchBills();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update bill');
      console.error('Edit bill error:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      try {
        await gpAdminAPI.deleteBill(billId);
        showSuccess('Bill deleted successfully');
        fetchBills();
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to delete bill');
        console.error('Delete bill error:', error);
      }
    }
  };

  const handleDownloadPDF = async (billId) => {
    try {
      const response = await gpAdminAPI.downloadBillPDF(billId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill_${bills.find(b => b._id === billId).billNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess('Bill PDF downloaded successfully');
    } catch (error) {
      showError('Failed to download bill PDF');
      console.error('Download PDF error:', error);
    }
  };

  const handleExportBills = async () => {
    try {
      const response = await gpAdminAPI.exportBills();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bills_export.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess('Bills exported successfully');
    } catch (error) {
      showError('Failed to export bills');
      console.error('Export bills error:', error);
    }
  };

  const handleGenerateQRCode = async (billId) => {
    try {
      const response = await gpAdminAPI.generateQRCode(billId);
      setQrCode(response.data.data.qrCode);
    } catch (error) {
      showError('Failed to generate QR code');
      console.error('Generate QR code error:', error);
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    try {
      const paymentPayload = {
        amount: parseFloat(paymentData.amount),
        paymentMode: paymentData.paymentMode,
        transactionId: paymentData.paymentMode === 'cash' ? null : paymentData.transactionId,
        remarks: paymentData.remarks || undefined
      };
      await gpAdminAPI.makePayment(selectedBill, paymentPayload);
      showSuccess('Payment recorded successfully');
      setPaymentData({ amount: '', paymentMode: 'cash', transactionId: '', remarks: '' });
      setIsBillModalOpen(false);
      fetchBills();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to record payment');
      console.error('Payment error:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Bills Management</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Manage all water bills and payments
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExportBills}
            className="flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Data
          </button>
          <Link
            to="/gp-admin/new/bill"
            className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Generate Bill
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
              placeholder="Search bills by number, customer name, meter number, or village..."
              value={searchTerm}
              autoFocus
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm lg:w-48"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {bills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Bill Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bills.map((bill, index) => (
                  <motion.tr
                    key={bill._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-all"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{bill.billNumber}</div>
                          <div className="text-sm text-gray-500">{bill.month} {bill.year}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{bill.house.ownerName}</div>
                        <div className="text-sm text-gray-500">
                          {bill.house.waterMeterNumber} • {bill.house.village?.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">₹{bill.totalAmount.toFixed(2)}</div>
                        {bill.remainingAmount > 0 && (
                          <div className="text-sm text-red-600">Due: ₹{bill.remainingAmount.toFixed(2)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(bill.dueDate).toLocaleDateString('en-IN')}
                      </div>
                      {bill.paidDate && (
                        <div className="text-sm text-green-600">
                          Paid: {new Date(bill.paidDate).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(bill.status)}`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewBill(bill._id)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-all"
                          title="View Bill"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(bill._id)}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-all"
                          title="Download PDF"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                        {bill.status !== 'paid' && (
                          <>
                            <button
                              onClick={() => handleEditBill(bill._id)}
                              className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-all"
                              title="Edit Bill"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBill(bill._id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-all"
                              title="Delete Bill"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => { setSelectedBill(bill._id); setIsBillModalOpen(true); }}
                              className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-full transition-all"
                              title="Pay Bill"
                            >
                              <DollarSign className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bills found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter ? 'Try adjusting your search or filter terms' : 'Get started by generating your first bill'}
            </p>
            {!searchTerm && !statusFilter && (
              <Link
                to="/gp-admin/bills/generate"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Generate Bill
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {bills.map((bill, index) => (
          <motion.div
            key={bill._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">{bill.billNumber}</h3>
                  <p className="text-xs text-gray-500">{bill.month} {bill.year}</p>
                </div>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(bill.status)}`}>
                {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>{bill.house.ownerName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-gray-900">₹{bill.totalAmount.toFixed(2)}</span>
              </div>
              {bill.remainingAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Due Amount:</span>
                  <span className="font-medium text-red-600">₹{bill.remainingAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Due: {new Date(bill.dueDate).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewBill(bill._id)}
                  className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-all"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => handleDownloadPDF(bill._id)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-all"
                >
                  <Printer className="w-4 h-4" />
                </button>
                {bill.status !== 'paid' && (
                  <>
                    <button
                      onClick={() => handleEditBill(bill._id)}
                      className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBill(bill._id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              {bill.status !== 'paid' && (
                <button
                  onClick={() => { setSelectedBill(bill._id); setIsBillModalOpen(true); }}
                  className="flex items-center px-3 py-1 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-all"
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Pay
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {bills.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bills found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter ? 'Try adjusting your search or filter terms' : 'Get started by generating your first bill'}
            </p>
            {!searchTerm && !statusFilter && (
              <Link
                to="/gp-admin/bills/generate"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Generate Bill
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {bills.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing {pagination.count} of {pagination.totalRecords} bills
          </div>
          <div className="flex space-x-2">
            {Array.from({ length: pagination.total }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  pagination.current === page
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bill Details Modal */}
      <AnimatePresence>
        {isBillModalOpen && billDetails && (
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
                  Bill {billDetails.bill.billNumber}
                </h2>
                <button
                  onClick={() => { setIsBillModalOpen(false); setBillDetails(null); setQrCode(null); }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Bill Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <User className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Customer</p>
                        <p className="text-sm text-gray-900">{billDetails.bill.house.ownerName}</p>
                        <p className="text-sm text-gray-500">{billDetails.bill.house.village?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Meter Readings</p>
                        <p className="text-sm text-gray-900">
                          Previous: {billDetails.bill.previousReading} KL
                        </p>
                        <p className="text-sm text-gray-900">
                          Current: {billDetails.bill.currentReading} KL
                        </p>
                        <p className="text-sm text-gray-900">
                          Usage: {billDetails.bill.totalUsage} KL
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <DollarSign className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Amount</p>
                        <p className="text-sm text-gray-900">
                          Current Demand: ₹{billDetails.bill.currentDemand.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-900">
                          Arrears: ₹{billDetails.bill.arrears.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-900">
                          Interest: ₹{billDetails.bill.interest.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-900">
                          Others: ₹{billDetails.bill.others.toFixed(2)}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          Total: ₹{billDetails.bill.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-red-600">
                          Due: ₹{billDetails.bill.remainingAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Dates</p>
                        <p className="text-sm text-gray-900">
                          Due: {new Date(billDetails.bill.dueDate).toLocaleDateString('en-IN')}
                        </p>
                        {billDetails.bill.paidDate && (
                          <p className="text-sm text-green-600">
                            Paid: {new Date(billDetails.bill.paidDate).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                {billDetails.payments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                    <div className="space-y-3">
                      {billDetails.payments.map((payment, index) => (
                        <div key={index} className="border-b border-gray-200 pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                ₹{payment.amount.toFixed(2)} ({payment.paymentMode})
                              </p>
                              <p className="text-xs text-gray-500">
                                By {payment.collectedBy.name} on{' '}
                                {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                              </p>
                              {payment.transactionId && (
                                <p className="text-xs text-gray-500">
                                  Transaction ID: {payment.transactionId}
                                </p>
                              )}
                              {payment.remarks && (
                                <p className="text-xs text-gray-500 italic">
                                  Remarks: {payment.remarks}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* QR Code */}
                {billDetails.bill.status !== 'paid' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">UPI Payment</h3>
                    <button
                      onClick={() => handleGenerateQRCode(billDetails.bill._id)}
                      className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all mb-4"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Generate QR Code
                    </button>
                    {qrCode && (
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <img src={qrCode} alt="UPI QR Code" className="mx-auto mb-2 max-w-[200px]" />
                        <p className="text-sm text-gray-600">
                          Scan to pay ₹{billDetails.bill.remainingAmount.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Form */}
                {billDetails.bill.status !== 'paid' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Payment</h3>
                    <form onSubmit={handlePaymentSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Amount <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={paymentData.amount}
                          onChange={handlePaymentChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                          placeholder="Enter amount"
                          min="0.01"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Payment Mode <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="paymentMode"
                          value={paymentData.paymentMode}
                          onChange={handlePaymentChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                        >
                          <option value="cash">Cash</option>
                          <option value="upi">UPI</option>
                          <option value="online">Online</option>
                        </select>
                      </div>
                      {paymentData.paymentMode !== 'cash' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Transaction ID
                          </label>
                          <input
                            type="text"
                            name="transactionId"
                            value={paymentData.transactionId}
                            onChange={handlePaymentChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                            placeholder="Enter transaction ID"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Remarks (Optional)
                        </label>
                        <textarea
                          name="remarks"
                          value={paymentData.remarks}
                          onChange={handlePaymentChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                          placeholder="Enter any remarks"
                          rows="4"
                        />
                      </div>
                      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => { setIsBillModalOpen(false); setBillDetails(null); setQrCode(null); }}
                          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={paymentLoading}
                          className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {paymentLoading ? (
                            <LoadingSpinner size="sm" color="white" />
                          ) : (
                            'Record Payment'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Bill Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
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
                  Edit Bill
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Reading (KL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="currentReading"
                    value={editFormData.currentReading}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter current reading"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Month <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="month"
                    value={editFormData.month}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map(month => (
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
                    value={editFormData.year}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter year"
                    min="2000"
                    max="2099"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={editFormData.dueDate}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Interest
                  </label>
                  <input
                    type="number"
                    name="interest"
                    value={editFormData.interest}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter interest amount"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Others
                  </label>
                  <input
                    type="number"
                    name="others"
                    value={editFormData.others}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                    placeholder="Enter other charges"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {editLoading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      'Update Bill'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillsList;