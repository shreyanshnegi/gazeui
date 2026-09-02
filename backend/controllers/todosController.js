const db = require('../db')

// Get all todos for logged in user
const getTodos = async (req, res) => {
  try {
    const todos = await db.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json(todos.rows)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
}

// Create a new todo
const createTodo = async (req, res) => {
  try {
    const { title } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const newTodo = await db.query(
      'INSERT INTO todos (user_id, title) VALUES ($1, $2) RETURNING *',
      [req.user.id, title]
    )

    res.status(201).json(newTodo.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
}

// Update todo (mark complete or incomplete)
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params
    const { completed } = req.body

    const todo = await db.query(
      'UPDATE todos SET completed = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [completed, id, req.user.id]
    )

    if (todo.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' })
    }

    res.json(todo.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
}

// Delete a todo
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params

    const todo = await db.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    )

    if (todo.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' })
    }

    res.json({ message: 'Todo deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo }