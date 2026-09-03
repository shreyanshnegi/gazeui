const db = require('../db')

// Save calibration data
const saveCalibration = async (req, res) => {
  try {
    const { calibration_points, accuracy } = req.body

    if (!calibration_points || !accuracy) {
      return res.status(400).json({ 
        error: 'Calibration points and accuracy are required' 
      })
    }

    // Delete previous calibration for this user
    await db.query(
      'DELETE FROM calibration_data WHERE user_id = $1',
      [req.user.id]
    )

    // Save new calibration
    const calibration = await db.query(
      `INSERT INTO calibration_data (user_id, calibration_points, accuracy) 
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, JSON.stringify(calibration_points), accuracy]
    )

    res.status(201).json(calibration.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
}

// Get latest calibration for logged in user
const getCalibration = async (req, res) => {
  try {
    const calibration = await db.query(
      `SELECT * FROM calibration_data 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [req.user.id]
    )

    if (calibration.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No calibration found. Please calibrate first.' 
      })
    }

    res.json(calibration.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { saveCalibration, getCalibration }