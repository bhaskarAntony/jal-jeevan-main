import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { gpAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { 
  ArrowLeft, 
  Building, 
  User, 
  Phone, 
  MapPin,
  CreditCard,
  FileText,
  Plus,
  Eye,
  Printer,
  IndianRupee,
  Calendar,
  QrCode,
  Copy,
  Download,
  X
} from 'lucide-react'

const HouseDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const [house, setHouse] = useState(null)
  const [bills, setBills] = useState([])
  const [qrCodeData, setQrCodeData] = useState({ upiId: '', merchantName: '' })
  const [qrCode, setQrCode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [isBillModalOpen, setIsBillModalOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [billDetails, setBillDetails] = useState(null)
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMode: 'cash',
    transactionId: '',
    remarks: ''
  })
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchHouseDetails()
  }, [id])

  const fetchHouseDetails = async () => {
    setLoading(true)
    try {
      // Fetch house details and bills using getBillByHouse
      const response = await gpAdminAPI.getBillByHouse(id)
      const { house, bills } = response.data.data
      setHouse(house)
      setBills(bills || [])

      // Fetch Gram Panchayat QR code data
      const gpResponse = await gpAdminAPI.getDashboard()
      const { qrCodeData, qrCode } = gpResponse.data.data
      setQrCodeData(qrCodeData || { upiId: '', merchantName: '' })
      setQrCode(qrCode || '')
    } catch (error) {
      showError('Failed to fetch house details or QR code data')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewBill = async (billId) => {
    try {
      const response = await gpAdminAPI.getBill(billId)
      setBillDetails(response.data.data)
      setSelectedBill(billId)
      setIsBillModalOpen(true)
    } catch (error) {
      showError('Failed to fetch bill details')
      console.error('Fetch bill error:', error)
    }
  }

  const handleDownloadPDF = async (billId) => {
    try {
      const response = await gpAdminAPI.downloadBillPDF(billId)
      const bill = bills.find(b => b._id === billId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `bill_${bill.billNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showSuccess('Bill PDF downloaded successfully')
    } catch (error) {
      showError('Failed to download bill PDF')
      console.error('Download PDF error:', error)
    }
  }

  const handleGenerateQRCode = async (billId) => {
    try {
      const response = await gpAdminAPI.generateQRCode(billId)
      setQrCode(response.data.data.qrCode)
    } catch (error) {
      showError('Failed to generate QR code')
      console.error('Generate QR code error:', error)
    }
  }

  const handleCopyUPI = () => {
    if (qrCodeData?.upiId) {
      navigator.clipboard.writeText(qrCodeData.upiId)
      showSuccess('UPI ID copied to clipboard!')
    } else {
      showError('No UPI ID available to copy')
    }
  }

  const handleDownloadQR = () => {
    if (qrCode) {
      const link = document.createElement('a')
      link.href = qrCode
      link.setAttribute('download', `bill_qrcode_${billDetails?.bill.billNumber || 'gp'}.png`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showSuccess('QR code downloaded successfully!')
    } else {
      showError('No QR code available to download')
    }
  }

  const handlePaymentChange = (e) => {
    const { name, value } = e.target
    setPaymentData(prev => ({ ...prev, [name]: value }))
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setPaymentLoading(true)
    try {
      const paymentPayload = {
        amount: parseFloat(paymentData.amount),
        paymentMode: paymentData.paymentMode,
        transactionId: paymentData.paymentMode === 'cash' ? null : paymentData.transactionId,
        remarks: paymentData.remarks || undefined
      }
      await gpAdminAPI.makePayment(selectedBill, paymentPayload)
      showSuccess('Payment recorded successfully')
      setPaymentData({ amount: '', paymentMode: 'cash', transactionId: '', remarks: '' })
      setIsBillModalOpen(false)
      setBillDetails(null)
      setQrCode(null)
      fetchHouseDetails()
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to record payment')
      console.error('Payment error:', error)
    } finally {
      setPaymentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!house) {
    return (
      <div className="text-center py-16 max-w-4xl mx-auto">
        <Building className="w-20 h-20 text-gray-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-3">House not found</h3>
        <p className="text-gray-600 mb-6 text-sm">The requested house could not be found.</p>
        <button
          onClick={() => navigate('/gp-admin/houses')}
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Houses
        </button>
      </div>
    )
  }

  const totalUnpaid = bills.filter(bill => bill.status !== 'paid').reduce((sum, bill) => sum + bill.remainingAmount, 0)

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/gp-admin/houses')}
            className="p-3 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{house.ownerName}</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">House details and payment history</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/gp-admin/new/bill`, { state: { loc: location.pathname } })}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Generate New Bill
          </button>
        </div>
      </div>

      {/* House Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{house.ownerName}</h2>
              <p className="text-gray-600 flex items-center mt-1 text-sm">
                <CreditCard className="w-4 h-4 mr-2" />
                Meter: {house.waterMeterNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
              house.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {house.isActive ? 'Active' : 'Inactive'}
            </span>
            <div className="mt-2 text-sm text-gray-500">
              Property: {house.propertyNumber}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Mobile Number</p>
                    <p className="text-sm text-gray-600">{house.mobileNumber}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Aadhaar Number</p>
                    <p className="text-sm text-gray-600">{house.aadhaarNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Village</p>
                    <p className="text-sm text-gray-600">{house.village.name}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Building className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Address</p>
                    <p className="text-sm text-gray-600">{house.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Usage Type</p>
                    <p className="text-sm text-gray-600 capitalize">{house.usageType}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CreditCard className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Previous Reading</p>
                    <p className="text-sm text-gray-600">{house.previousMeterReading.toFixed(2)} KL</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Sequence Number</p>
                    <p className="text-sm text-gray-600">{house.sequenceNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {totalUnpaid > 0 && (
          <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <IndianRupee className="w-6 h-6 text-red-600 mr-4" />
              <div>
                <h4 className="text-lg font-semibold text-red-900">Outstanding Amount</h4>
                <p className="text-red-700 mt-1 text-sm">
                  Total unpaid amount: <span className="font-bold">₹{totalUnpaid.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Bills History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
            <p className="text-gray-600 mt-1 text-sm">All water bills for this house</p>
          </div>
          <button
            onClick={() => navigate(`/gp-admin/new/bill`, { state: { loc: location.pathname } })}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Generate New Bill
          </button>
        </div>

        {bills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Bill Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Readings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Charges
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                      <div className="text-sm font-semibold text-gray-900">{bill.billNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bill.month} {bill.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Previous: {bill.previousReading.toFixed(2)} KL</div>
                        <div>Current: {bill.currentReading.toFixed(2)} KL</div>
                        <div>Usage: {bill.totalUsage.toFixed(2)} KL</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Demand: ₹{bill.currentDemand.toFixed(2)}</div>
                        <div>Arrears: ₹{bill.arrears.toFixed(2)}</div>
                        <div>Interest: ₹{bill.interest.toFixed(2)}</div>
                        <div>Others: ₹{bill.others.toFixed(2)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-900">₹{bill.totalAmount.toFixed(2)}</div>
                        {bill.remainingAmount > 0 && (
                          <div className="text-sm text-red-600">Due: ₹{bill.remainingAmount.toFixed(2)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bill.paidAmount > 0 && (
                          <>
                            <div>Paid: ₹{bill.paidAmount.toFixed(2)}</div>
                            <div>Mode: {bill.paymentMode ? bill.paymentMode.toUpperCase() : '-'}</div>
                            {bill.transactionId && (
                              <div className="text-xs text-gray-500">ID: {bill.transactionId}</div>
                            )}
                          </>
                        )}
                        {!bill.paidAmount && <div>-</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                        bill.status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Due: {new Date(bill.dueDate).toLocaleDateString('en-IN')}</div>
                        {bill.paidDate && (
                          <div className="text-sm text-green-600">
                            Paid: {new Date(bill.paidDate).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </div>
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
                          <button
                            onClick={() => { setSelectedBill(bill._id); setIsBillModalOpen(true); }}
                            className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-full transition-all"
                            title="Pay Bill"
                          >
                            <IndianRupee className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No bills found</h3>
            <p className="text-gray-600 mb-6 text-sm">No water bills have been generated for this house yet.</p>
            <button
              onClick={() => navigate(`/gp-admin/houses/${id}/generate-bill`)}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Generate First Bill
            </button>
          </div>
        )}
      </motion.div>

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
                      <IndianRupee className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
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
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <p className="text-sm font-semibold text-gray-700">UPI ID:</p>
                        <p className="text-sm text-gray-900">{qrCodeData.upiId || 'Not set'}</p>
                        {qrCodeData.upiId && (
                          <button
                            onClick={handleCopyUPI}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-all"
                            title="Copy UPI ID"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="text-sm font-semibold text-gray-700">Merchant:</p>
                        <p className="text-sm text-gray-900">{qrCodeData.merchantName || 'Not set'}</p>
                      </div>
                      <button
                        onClick={() => handleGenerateQRCode(billDetails.bill._id)}
                        className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all"
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
                          <button
                            onClick={handleDownloadQR}
                            className="mt-2 inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download QR Code
                          </button>
                        </div>
                      )}
                    </div>
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
    </div>
  )
}

export default HouseDetails