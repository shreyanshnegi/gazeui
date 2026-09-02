const express = require('express')
const router = express.Router()
const protect = require('../middleware/auth')
const {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo
} = require('../controllers/todosController')

router.get('/', protect, getTodos)
router.post('/', protect, createTodo)
router.put('/:id', protect, updateTodo)
router.delete('/:id', protect, deleteTodo)

module.exports = router