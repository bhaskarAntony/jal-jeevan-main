import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { gpAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Save, X, QrCode, FileText, Edit, Check, Download } from 'lucide-react'

const QRCodePage = () => {
  const [qrCodeData, setQrCodeData] = useState({ upiId: '', merchantName: '' })
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [generatingQR, setGeneratingQR] = useState(false)
  const [editing, setEditing] = useState(false)
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const response = await gpAdminAPI.getDashboard()
      const { qrCodeData, qrCode } = response.data.data.gramPanchayat;
      console.log(response.data.data);
      
      setQrCodeData(qrCodeData || { upiId: '', merchantName: '' })
      setQrCodeUrl(qrCode || '')
    } catch (error) {
      showError('Failed to fetch QR code data')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async () => {
    if (!qrCodeData.upiId || !qrCodeData.merchantName) {
      showError('UPI ID and Merchant Name are required to generate QR code')
      return
    }
    setGeneratingQR(true)
    try {
      const response = await gpAdminAPI.generateGPQRCode({
        upiId: qrCodeData.upiId,
        merchantName: qrCodeData.merchantName
      })
      // const url = window.URL.createObjectURL(new Blob([]))
      setQrCodeUrl(response.data.data.qrCode)
      showSuccess('QR Code generated successfully')
    } catch (error) {
      showError('Failed to generate QR code')
      console.error('QR Code error:', error)
    } finally {
      setGeneratingQR(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setQrCodeData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateQRCode = async () => {
    if (!qrCodeData.upiId || !qrCodeData.merchantName) {
      showError('UPI ID and Merchant Name are required')
      return
    }
    setSubmitting(true)
    try {
      const payload = { qrCodeData }
      await gpAdminAPI.updateGPSettings(payload)
      await generateQRCode()
      setEditing(false)
      showSuccess('QR Code data updated successfully')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update QR code data')
      console.error('QR Code update error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.setAttribute('download', `gp_qrcode_${qrCodeData.upiId.split('@')[0] || 'gp'}.png`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showSuccess('QR Code downloaded successfully')
    } else {
      showError('No QR code available to download')
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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">QR Code Settings</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Manage payment QR code details for your Gram Panchayat
          </p>
        </div>
        <button
          onClick={() => navigate('/gp-admin/dashboard')}
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
        >
          <X className="w-5 h-5 mr-2" />
          Cancel
        </button>
      </div>

      {/* QR Code Data and Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Preview */}
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment QR Code</h2>
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Payment QR Code"
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            {qrCodeUrl && (
              <button
                type="button"
                onClick={handleDownloadQRCode}
                className="mt-4 inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
              >
                <Download className="w-5 h-5 mr-2" />
                Download QR Code
              </button>
            )}
          </div>

          {/* QR Code Data Form */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">QR Code Data</h2>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  UPI ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="upiId"
                    value={qrCodeData.upiId}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm ${!editing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter UPI ID (e.g., gp.peresandra@upi)"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Merchant Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="merchantName"
                    value={qrCodeData.merchantName}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm ${!editing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Enter merchant name"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {editing && (
                <button
                  type="button"
                  onClick={handleUpdateQRCode}
                  disabled={submitting || generatingQR}
                  className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Update QR Code Data
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={generateQRCode}
                disabled={generatingQR || submitting}
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {generatingQR ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <>
                    <QrCode className="w-5 h-5 mr-2" />
                    Generate QR Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default QRCodePage