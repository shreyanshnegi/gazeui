const express = require('express')
const router = express.Router()
const protect = require('../middleware/auth')
const {
  saveCalibration,
  getCalibration
} = require('../controllers/calibrationController')

router.post('/', protect, saveCalibration)
router.get('/', protect, getCalibration)

module.exports = router