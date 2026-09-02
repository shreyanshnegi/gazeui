const { Pool } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

pool.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message)
  } else {
    console.log('Database connected successfully!')
  }
})

module.exports = pool