const express = require('express')
const router = express.Router()
const protect = require('../middleware/auth')
const {
  saveGazeSession,
  getGazeSessions
} = require('../controllers/gazeController')

router.post('/', protect, saveGazeSession)
router.get('/', protect, getGazeSessions)

module.exports = router