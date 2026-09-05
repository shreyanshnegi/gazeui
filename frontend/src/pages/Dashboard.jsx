import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/gaze')
      .then(res => {
        setStats(res.data.stats)
        setSessions(res.data.sessions)
      })
      .catch(() => {
        setStats(null)
        setSessions([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'text-green-400'
    if (accuracy >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getAccuracyBg = (accuracy) => {
    if (accuracy >= 80) return 'bg-green-400/10'
    if (accuracy >= 60) return 'bg-yellow-400/10'
    return 'bg-red-400/10'
  }

  const navItems = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard', active: true },
    { icon: '🎯', label: 'Calibrate', path: '/calibrate', active: false },
    { icon: '✅', label: 'Gaze App', path: '/app', active: false },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800/50 flex flex-col fixed h-full bg-gray-950 z-20">
        
        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-purple-500/30">
              👁️
            </div>
            <div>
              <p className="font-bold text-lg tracking-tight">GazeUI</p>
              <p className="text-gray-500 text-xs">Eye control system</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                item.active
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              {item.active && (
                <span className="ml-auto w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
              )}
            </button>
          ))}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-gray-800/50">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-900 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 px-3 py-2 rounded-lg transition-all text-left"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">

        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800/50 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-xl">Dashboard</h1>
            <p className="text-gray-500 text-xs">Overview of your gaze activity</p>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            Eye tracking ready
          </div>
        </div>

        <div className="px-8 py-8">

          {/* Welcome banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/40 via-purple-800/20 to-gray-900 border border-purple-500/20 rounded-2xl p-8 mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-800/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10">
              <p className="text-purple-300 text-sm font-medium mb-2">Welcome back</p>
              <h2 className="text-4xl font-bold mb-2 tracking-tight">
                Hey, {user?.name?.split(' ')[0]} 👋
              </h2>
              <p className="text-gray-400 max-w-md">
                Your eyes are your mouse. Control everything on screen just by looking at it.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => navigate('/calibrate')}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
                >
                  🎯 Calibrate first
                </button>
                <button
                  onClick={() => navigate('/app')}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/30"
                >
                  ✅ Launch app →
                </button>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              {
                label: 'Total sessions',
                value: loading ? '...' : stats?.total_sessions || '0',
                sub: 'eye tracking sessions',
                icon: '🎯',
                color: 'purple',
                glow: 'shadow-purple-500/10'
              },
              {
                label: 'Avg accuracy',
                value: loading ? '...' : stats?.avg_accuracy ? `${stats.avg_accuracy}%` : '0%',
                sub: 'gaze precision score',
                icon: '📊',
                color: 'green',
                glow: 'shadow-green-500/10'
              },
              {
                label: 'Total focus time',
                value: loading ? '...' : stats?.total_duration ? `${Math.round(stats.total_duration / 60)}m` : '0m',
                sub: 'spent in gaze sessions',
                icon: '⏱️',
                color: 'blue',
                glow: 'shadow-blue-500/10'
              }
            ].map((stat, i) => (
              <div
                key={i}
                className={`bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 shadow-xl ${stat.glow} transition-all hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <p className={`text-4xl font-bold mb-1 ${
                  stat.color === 'purple' ? 'text-white' :
                  stat.color === 'green' ? 'text-green-400' : 'text-blue-400'
                }`}>
                  {stat.value}
                </p>
                <p className="text-gray-600 text-xs">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-3 gap-4">

            {/* Recent sessions - takes 2 cols */}
            <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold">Recent sessions</h2>
                <span className="text-gray-500 text-xs bg-gray-800 px-2 py-1 rounded-lg">
                  {sessions.length} total
                </span>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                    👁️
                  </div>
                  <p className="text-gray-400 font-medium mb-1">No sessions yet</p>
                  <p className="text-gray-600 text-sm">
                    Calibrate and launch the app to record your first session
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.slice(0, 5).map(session => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between bg-gray-800/40 hover:bg-gray-800 rounded-xl px-4 py-3.5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-500/10 group-hover:bg-purple-500/20 rounded-xl flex items-center justify-center text-sm transition-colors">
                          👁️
                        </div>
                        <div>
                          <p className="text-sm font-medium">Gaze session</p>
                          <p className="text-gray-500 text-xs">{formatDate(session.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-gray-500 text-xs">Duration</p>
                          <p className="text-sm font-medium">{session.duration}s</p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg ${getAccuracyBg(session.accuracy)}`}>
                          <p className={`text-sm font-bold ${getAccuracyColor(session.accuracy)}`}>
                            {session.accuracy}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions - 1 col */}
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h2 className="font-semibold mb-4">Quick actions</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/calibrate')}
                    className="w-full flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 px-4 py-3 rounded-xl text-sm transition-colors text-left group"
                  >
                    <span className="text-lg">🎯</span>
                    <div>
                      <p className="font-medium text-sm">Calibrate</p>
                      <p className="text-gray-500 text-xs">Setup eyes</p>
                    </div>
                    <span className="ml-auto text-gray-600 group-hover:text-gray-400">→</span>
                  </button>
                  <button
                    onClick={() => navigate('/app')}
                    className="w-full flex items-center gap-3 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 px-4 py-3 rounded-xl text-sm transition-colors text-left group"
                  >
                    <span className="text-lg">✅</span>
                    <div>
                      <p className="font-medium text-sm text-purple-300">Gaze App</p>
                      <p className="text-purple-400/60 text-xs">Launch now</p>
                    </div>
                    <span className="ml-auto text-purple-500 group-hover:text-purple-300">→</span>
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 border border-purple-500/20 rounded-2xl p-5">
                <div className="text-2xl mb-3">💡</div>
                <h3 className="font-medium text-sm mb-1">Pro tip</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Calibrate in the same lighting you'll use the app. Better lighting = better accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard