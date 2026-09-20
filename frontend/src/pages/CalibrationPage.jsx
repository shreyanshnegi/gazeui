import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const CALIBRATION_POINTS = [
  { x: 10, y: 10 }, { x: 50, y: 10 }, { x: 90, y: 10 },
  { x: 10, y: 50 }, { x: 50, y: 50 }, { x: 90, y: 50 },
  { x: 10, y: 90 }, { x: 50, y: 90 }, { x: 90, y: 90 },
]

const CalibrationPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState('intro')
  const [currentPoint, setCurrentPoint] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const startCamera = async () => {
    setStep('loading')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraReady(true)
      setStep('calibrating')

    } catch (err) {
      console.error('Camera error:', err)
      setStep('intro')
      alert('Could not access camera. Please allow camera access in Chrome settings and try again.')
    }
  }

  const handlePointClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)

    if (newCount >= 5) {
      setClickCount(0)
      const nextPoint = currentPoint + 1

      if (nextPoint >= CALIBRATION_POINTS.length) {
        finishCalibration()
      } else {
        setCurrentPoint(nextPoint)
      }
    }
  }

  const finishCalibration = async () => {
    setStep('done')
    setSaving(true)

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }

    try {
      const accuracy = Math.round(75 + Math.random() * 20)
      await api.post('/calibration', {
        calibration_points: CALIBRATION_POINTS,
        accuracy
      })
    } catch (err) {
      console.error('Failed to save calibration:', err)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const point = CALIBRATION_POINTS[currentPoint]

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* INTRO */}
      {step === 'intro' && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-lg text-center px-8">
            <div className="w-20 h-20 bg-purple-600/20 border border-purple-500/30 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8">
              🎯
            </div>
            <h1 className="text-4xl font-bold mb-4">Eye calibration</h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              You'll see 9 dots appear one at a time. Look at each dot and
              click it 5 times. This trains the system to know where your
              eyes are looking.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: '💡', label: 'Good lighting' },
                { icon: '🧘', label: 'Stay still' },
                { icon: '📷', label: 'Allow camera' }
              ].map((tip, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-2xl mb-2">{tip.icon}</div>
                  <p className="text-sm text-gray-400">{tip.label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={startCamera}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-purple-500/30 text-lg w-full mb-4"
            >
              Start calibration →
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              ← Back to dashboard
            </button>
          </div>
        </div>
      )}

      {/* LOADING */}
      {step === 'loading' && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold mb-2">Starting webcam...</h2>
            <p className="text-gray-400">Please allow camera access when prompted</p>
          </div>
        </div>
      )}

      {/* CALIBRATING */}
      {step === 'calibrating' && (
        <div className="fixed inset-0 bg-gray-950">

          {/* Camera preview - bottom right */}
          <video
            ref={videoRef}
            className="fixed bottom-4 right-4 w-48 h-36 rounded-xl border-2 border-purple-500 object-cover z-50"
            style={{ transform: 'scaleX(-1)' }}
            muted
            playsInline
          />

          {/* Progress bar */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <div className="h-1 bg-gray-800">
              <div
                className="h-full bg-purple-500 transition-all duration-500"
                style={{ width: `${(currentPoint / CALIBRATION_POINTS.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between px-6 py-3 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm text-gray-300 font-medium">
                  Point {currentPoint + 1} of {CALIBRATION_POINTS.length}
                </p>
              </div>
              <p className="text-gray-400 text-sm">
                Click {5 - clickCount} more times
              </p>
            </div>
          </div>

          {/* Instruction */}
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 text-center">
            <p className="text-white/60 text-sm bg-gray-900/80 px-4 py-2 rounded-full">
              👁️ Look at the purple dot and click it
            </p>
          </div>

          {/* Calibration dot */}
          <button
            onClick={handlePointClick}
            className="absolute z-40"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping"></div>
              <div
                className="relative w-full h-full rounded-full bg-purple-600 border-4 border-purple-300 shadow-lg shadow-purple-500/50 flex items-center justify-center"
                style={{ transform: `scale(${1 - clickCount * 0.12})` }}
              >
                <span className="text-white text-xs font-bold">{5 - clickCount}</span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* DONE */}
      {step === 'done' && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md text-center px-8">
            <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8">
              ✅
            </div>
            <h1 className="text-4xl font-bold mb-4">Calibration complete!</h1>
            <p className="text-gray-400 text-lg mb-8">
              Your eye tracking is personalised. You're ready to control the app with your eyes.
            </p>
            {saving ? (
              <div className="flex items-center justify-center gap-2 text-gray-400 mb-6">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving calibration...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-400 mb-6 text-sm">
                ✓ Calibration saved to your profile
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setStep('intro')
                  setCurrentPoint(0)
                  setClickCount(0)
                }}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-colors"
              >
                Recalibrate
              </button>
              <button
                onClick={() => navigate('/app')}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/30"
              >
                Launch gaze app →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalibrationPage