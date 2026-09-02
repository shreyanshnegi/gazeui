const fs = require('fs')
const pool = require('./db')

const schema = fs.readFileSync('./schema.sql', 'utf8')

pool.query(schema)
  .then(() => {
    console.log('Tables created successfully!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Error creating tables:', err.message)
    process.exit(1)
  })