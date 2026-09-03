const db = require('../db')

// Save a gaze session
const saveGazeSession = async (req, res) => {
  try {
    const { duration, accuracy } = req.body

    if (!duration || !accuracy) {
      return res.status(400).json({ error: 'Duration and accuracy are required' })
    }

    const session = await db.query(
      'INSERT INTO gaze_sessions (user_id, duration, accuracy) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, duration, accuracy]
    )

    res.status(201).json(session.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
}

// Get all gaze sessions for logged in user
const getGazeSessions = async (req, res) => {
  try {
    const sessions = await db.query(
      `SELECT 
        id,
        duration,
        accuracy,
        created_at
       FROM gaze_sessions 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    )

    const stats = await db.query(
      `SELECT 
        COUNT(*) as total_sessions,
        ROUND(AVG(accuracy)::numeric, 2) as avg_accuracy,
        SUM(duration) as total_duration
       FROM gaze_sessions 
       WHERE user_id = $1`,
      [req.user.id]
    )

    res.json({
      sessions: sessions.rows,
      stats: stats.rows[0]
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { saveGazeSession, getGazeSessions }