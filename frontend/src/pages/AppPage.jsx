import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const AppPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [gazePos, setGazePos] = useState({ x: -100, y: -100 })
  const [dwellTarget, setDwellTarget] = useState(null)
  const [dwellProgress, setDwellProgress] = useState(0)
  const [sessionStart] = useState(Date.now())
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const dwellTimer = useRef(null)
  const dwellInterval = useRef(null)
  const gazeMoveRef = useRef(null)

  // Load todos
  useEffect(() => {
    api.get('/todos')
      .then(res => setTodos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Start camera for gaze simulation
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' }
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (err) {
        console.error('Camera error:', err)
      }
    }
    startCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  // Simulate gaze following mouse (real gaze tracking needs WebGazer)
  // For demo: mouse position = gaze position
  useEffect(() => {
    const handleMouseMove = (e) => {
      setGazePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Dwell detection
  const startDwell = (targetId, action) => {
    if (dwellTarget === targetId) return
    clearDwell()

    setDwellTarget(targetId)
    setDwellProgress(0)

    let progress = 0
    dwellInterval.current = setInterval(() => {
      progress += 2
      setDwellProgress(progress)
    }, 14)

    dwellTimer.current = setTimeout(() => {
      clearDwell()
      action()
    }, 700)
  }

  const clearDwell = () => {
    clearTimeout(dwellTimer.current)
    clearInterval(dwellInterval.current)
    setDwellTarget(null)
    setDwellProgress(0)
  }

  // Todo actions
  const addTodo = async () => {
    if (!newTodo.trim()) return
    try {
      const res = await api.post('/todos', { title: newTodo })
      setTodos([res.data, ...todos])
      setNewTodo('')
    } catch (err) {
      console.error(err)
    }
  }

  const completeTodo = async (id, completed) => {
    try {
      const res = await api.put(`/todos/${id}`, { completed: !completed })
      setTodos(todos.map(t => t.id === id ? res.data : t))
    } catch (err) {
      console.error(err)
    }
  }

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`)
      setTodos(todos.filter(t => t.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  // Save session when leaving
  const handleExit = async () => {
    const duration = Math.round((Date.now() - sessionStart) / 1000)
    try {
      await api.post('/gaze', { duration, accuracy: 85 })
    } catch (err) {
      console.error(err)
    }
    navigate('/dashboard')
  }

  const GazeButton = ({ id, onClick, className, children }) => {
    const isActive = dwellTarget === id
    return (
      <button
        className={`relative overflow-hidden ${className}`}
        onMouseEnter={() => startDwell(id, onClick)}
        onMouseLeave={clearDwell}
        onClick={onClick}
      >
        {isActive && (
          <div
            className="absolute bottom-0 left-0 h-1 bg-white/50 transition-none"
            style={{ width: `${dwellProgress}%` }}
          />
        )}
        {children}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-950/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-sm">
            👁️
          </div>
          <div>
            <h1 className="font-bold">Gaze Todo App</h1>
            <p className="text-gray-500 text-xs">Control with your eyes — hover to select</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            Gaze active
          </div>
          <GazeButton
            id="exit-btn"
            onClick={handleExit}
            className="bg-gray-800 hover:bg-gray-700 text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Exit session
          </GazeButton>
        </div>
      </div>

      <div className="flex flex-1">

        {/* Main content */}
        <div className="flex-1 px-8 py-8 max-w-2xl mx-auto w-full">

          {/* Add todo */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
            <p className="text-gray-400 text-sm mb-3">Add new task</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={newTodo}
                onChange={e => setNewTodo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTodo()}
                placeholder="Type a task and press Enter..."
                className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-purple-500 focus:outline-none text-sm"
              />
              <GazeButton
                id="add-btn"
                onClick={addTodo}
                className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl font-medium text-sm transition-colors"
              >
                Add ✓
              </GazeButton>
            </div>
          </div>

          {/* Todo list */}
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-gray-400">No tasks yet — add one above!</p>
              </div>
            ) : (
              todos.map(todo => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-4 bg-gray-900 border rounded-2xl px-5 py-4 transition-all ${
                    todo.completed
                      ? 'border-gray-800 opacity-60'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {/* Complete button */}
                  <GazeButton
                    id={`complete-${todo.id}`}
                    onClick={() => completeTodo(todo.id, todo.completed)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      todo.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-600 hover:border-purple-500'
                    }`}
                  >
                    {todo.completed && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </GazeButton>

                  {/* Title */}
                  <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                    {todo.title}
                  </span>

                  {/* Dwell hint */}
                  {dwellTarget === `complete-${todo.id}` && (
                    <span className="text-purple-400 text-xs animate-pulse">
                      👁️ hold...
                    </span>
                  )}

                  {/* Delete button */}
                  <GazeButton
                    id={`delete-${todo.id}`}
                    onClick={() => deleteTodo(todo.id)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center text-sm transition-colors"
                  >
                    ✕
                  </GazeButton>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel - camera + instructions */}
        <div className="w-72 border-l border-gray-800 p-6 space-y-6">

          {/* Camera feed */}
          <div>
            <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">Camera feed</p>
            <div className="relative rounded-xl overflow-hidden border border-purple-500/30 bg-gray-900">
              <video
                ref={videoRef}
                className="w-full h-44 object-cover"
                style={{ transform: 'scaleX(-1)' }}
                muted
                playsInline
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-green-400 text-xs">Live</span>
              </div>
            </div>
          </div>

          {/* How to use */}
          <div>
            <p className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">How to use</p>
            <div className="space-y-3">
              {[
                { icon: '👁️', text: 'Hover over a button to start dwell' },
                { icon: '⏱️', text: 'Hold gaze for 0.7s to click' },
                { icon: '✅', text: 'Hover circle to complete task' },
                { icon: '✕', text: 'Hover X to delete task' },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-base">{tip.icon}</span>
                  <p className="text-gray-400 text-xs leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">Session</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tasks</span>
                <span className="font-medium">{todos.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Completed</span>
                <span className="font-medium text-green-400">
                  {todos.filter(t => t.completed).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gaze cursor */}
      <div
        className="fixed pointer-events-none z-50 transition-none"
        style={{
          left: gazePos.x - 12,
          top: gazePos.y - 12,
        }}
      >
        <div className="w-6 h-6 rounded-full border-2 border-purple-400 bg-purple-400/20">
          {dwellTarget && (
            <div
              className="absolute inset-0 rounded-full bg-purple-400/40"
              style={{
                transform: `scale(${dwellProgress / 100})`,
                transition: 'transform 0.1s linear'
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AppPage