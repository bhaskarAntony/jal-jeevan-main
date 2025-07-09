const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const {
  getDashboard,
  getVillages,
  createVillage,
  getVillageDetails,
  updateVillage,
  deleteVillage,
  getHouses,
  createHouse,
  uploadHousesFromExcel,
  exportHousesData,
  getHouseDetails,
  updateHouse,
  deleteHouse,
  generateWaterBill,
  getBills,
  getBillDetails,
  downloadBillPDF,
  makePayment,
  generatePaymentQRCode,
  generateGPQRCode,
  updateWaterTariff,
  getUsers,
  createUser,
  getUserDetails,
  updateUser,
  deleteUser,
  exportUsersData,
  exportVillagesData,
  exportBillsData,
  updateGPSettings
} = require('../controllers/gpAdminController');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// Apply auth and GP admin authorization to all routes
router.use(auth);
router.use(authorize('gp_admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// Villages
router.route('/villages')
  .get(getVillages)
  .post(validate(schemas.createVillage), createVillage);

router.get('/villages/export', exportVillagesData);

router.route('/villages/:id')
  .get(getVillageDetails)
  .put(updateVillage)
  .delete(deleteVillage);

// Houses
router.route('/houses')
  .get(getHouses)
  .post(validate(schemas.createHouse), createHouse);

router.post('/houses/upload', upload.single('file'), uploadHousesFromExcel);
router.get('/houses/export', exportHousesData);

router.route('/houses/:id')
  .get(getHouseDetails)
  .put(updateHouse)
  .delete(deleteHouse);

// Bills
router.get('/bills', getBills);
router.get('/bills/export', exportBillsData);
router.post('/houses/:id/bills', validate(schemas.generateBill), generateWaterBill);

router.route('/bills/:id')
  .get(getBillDetails);

router.get('/bills/:id/pdf', downloadBillPDF);
router.post('/bills/:id/payment', validate(schemas.makePayment), makePayment);
router.get('/bills/:id/qr-code', generatePaymentQRCode);

// QR Code
router.get('/qr-code', generateGPQRCode);

// Tariff
router.put('/tariff', updateWaterTariff);

// Users
router.route('/users')
  .get(getUsers)
  .post(createUser);

router.get('/users/export', exportUsersData);

router.route('/users/:id')
  .get(getUserDetails)
  .put(updateUser)
  .delete(deleteUser);

// Settings
router.put('/settings', updateGPSettings);

module.exports = router;