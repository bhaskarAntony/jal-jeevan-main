import axios from 'axios'

// const API_BASE_URL = 'http://localhost:3001/api'
const API_BASE_URL = 'https://jal-jeevan.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Super Admin API calls
export const superAdminAPI = {
  // Dashboard
  getDashboard: () => api.get('/super-admin/dashboard'),
  
  // Gram Panchayats
  getGramPanchayats: (params) => api.get('/super-admin/gram-panchayats', { params }),
  createGramPanchayat: (data) => api.post('/super-admin/gram-panchayats', data),
  getGramPanchayat: (id) => api.get(`/super-admin/gram-panchayats/${id}`),
  updateGramPanchayat: (id, data) => api.put(`/super-admin/gram-panchayats/${id}`, data),
  deleteGramPanchayat: (id) => api.delete(`/super-admin/gram-panchayats/${id}`),
  
  // GP Admins
  createGPAdmin: (gpId, data) => api.post(`/super-admin/gram-panchayats/${gpId}/admins`, data),
  
  // Super Admins
  getSuperAdmins: (params) => api.get('/super-admin/super-admins', { params }),
  createSuperAdmin: (data) => api.post('/super-admin/super-admins', data),
  deleteSuperAdmin: (id) => api.delete(`/super-admin/super-admins/${id}`),
  getSingleSuperAdmin: (id) => api.get(`/super-admin/super-admins/${id}`),
  updateSuperAdmin: (id) => api.put(`/super-admin/super-admins/${id}`),
}

// GP Admin API calls
export const gpAdminAPI = {
  // Dashboard
  getDashboard: () => api.get('/gp-admin/dashboard'),
  
  // Villages
  getVillages: (params) => api.get('/gp-admin/villages', { params }),
  createVillage: (data) => api.post('/gp-admin/villages', data),
  getVillage: (id) => api.get(`/gp-admin/villages/${id}`),
  updateVillage: (id, data) => api.put(`/gp-admin/villages/${id}`, data),
  deleteVillage: (id) => api.delete(`/gp-admin/villages/${id}`),
  exportVillages: () => api.get('/gp-admin/villages/export', { responseType: 'blob' }),
  
  // Houses
  getHouses: (params) => api.get('/gp-admin/houses', { params }),
  createHouse: (data) => api.post('/gp-admin/houses', data),
  getHouse: (id) => api.get(`/gp-admin/houses/${id}`),
  updateHouse: (id, data) => api.put(`/gp-admin/houses/${id}`, data),
  deleteHouse: (id) => api.delete(`/gp-admin/houses/${id}`),
  uploadHouses: (formData) => api.post('/gp-admin/houses/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  exportHouses: () => api.get('/gp-admin/houses/export', { responseType: 'blob' }),
  
  // Bills
  getBills: (params) => api.get('/gp-admin/bills', { params }),
  generateBill: (houseId, data) => api.post(`/gp-admin/houses/${houseId}/bills`, data),
  getBill: (id) => api.get(`/gp-admin/bills/${id}`),
  downloadBillPDF: (id) => api.get(`/gp-admin/bills/${id}/pdf`, { responseType: 'blob' }),
  makePayment: (billId, data) => api.post(`/gp-admin/bills/${billId}/payment`, data),
  generateQRCode: (billId) => api.get(`/gp-admin/bills/${billId}/qr-code`),
  exportBills: () => api.get('/gp-admin/bills/export', { responseType: 'blob' }),
  
  // Users
  getUsers: (params) => api.get('/gp-admin/users', { params }),
  createUser: (data) => api.post('/gp-admin/users', data),
  getUser: (id) => api.get(`/gp-admin/users/${id}`),
  updateUser: (id, data) => api.put(`/gp-admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/gp-admin/users/${id}`),
  exportUsers: () => api.get('/gp-admin/users/export', { responseType: 'blob' }),
  
  // Settings
  updateTariff: (data) => api.put('/gp-admin/tariff', data),
  updateGPSettings: (data) => api.put('/gp-admin/settings', data),
  generateGPQRCode: () => api.get('/gp-admin/qr-code'),
}

export default api