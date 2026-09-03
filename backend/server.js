const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const db = require('./db')
const authRoutes = require('./routes/auth')
const todosRoutes = require('./routes/todos')
const gazeRoutes = require('./routes/gaze')
const calibrationRoutes = require('./routes/calibration')

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/todos', todosRoutes)
app.use('/api/gaze', gazeRoutes)
app.use('/api/calibration', calibrationRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', developer: 'Shreyansh' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})