const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')

// Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Encrypt the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Save user to database
    const newUser = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    )

    // Create JWT token
    const token = jwt.sign(
      { id: newUser.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: newUser.rows[0]
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
}

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.rows[0].password)

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email
      }
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
}

// Get current logged in user
const getMe = async (req, res) => {
  try {
    const user = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    )
    res.json(user.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { register, login, getMe }