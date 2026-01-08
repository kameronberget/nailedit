import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { useEffect, useRef, useState } from 'react'

import { Camera } from '@mediapipe/camera_utils'
import { HAND_CONNECTIONS } from '@mediapipe/hands'
import { Hands } from '@mediapipe/hands'
import Image from 'next/image'

interface SizingGuideProps {
  onClose: () => void
  onSizeSelected: (size: string) => void
}

type CalibrationStep = 'coin-selection' | 'coin-measurement' | 'hand-measurement'

// Coin sizes in millimeters (diameter)
const COIN_SIZES = {
  quarter: 24.26, // US Quarter
  penny: 19.05,   // US Penny
  dime: 17.91,     // US Dime
  nickel: 21.21,  // US Nickel
  other: null,     // User will input size
}

export default function SizingGuide({ onClose, onSizeSelected }: SizingGuideProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState<CalibrationStep>('coin-selection')
  const [selectedCoin, setSelectedCoin] = useState<keyof typeof COIN_SIZES>('quarter')
  const [customCoinSize, setCustomCoinSize] = useState('')
  const [coinPoints, setCoinPoints] = useState<{ x: number; y: number }[]>([])
  const [calibrationData, setCalibrationData] = useState<{ mmPerPixel: number } | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [detectedSize, setDetectedSize] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handsRef = useRef<Hands | null>(null)
  const cameraRef = useRef<Camera | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isCapturingRef = useRef(false)
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle canvas clicks for coin calibration
  useEffect(() => {
    if (!canvasRef.current || step !== 'coin-measurement') return

    const canvas = canvasRef.current

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setCoinPoints((prev) => {
        if (prev.length < 2) {
          return [...prev, { x, y }]
        } else {
          // Reset and start over
          return [{ x, y }]
        }
      })
    }

    canvas.addEventListener('click', handleCanvasClick)

    return () => {
      canvas.removeEventListener('click', handleCanvasClick)
    }
  }, [step])

  // Check for camera availability and iOS compatibility
  const checkCameraSupport = async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Check if we're on iOS and need to use legacy API
      const nav = navigator as any
      const legacyGetUserMedia = nav.getUserMedia || 
                                 nav.webkitGetUserMedia || 
                                 nav.mozGetUserMedia
      
      if (!legacyGetUserMedia) {
        return false
      }
    }
    return true
  }

  // Initialize camera with iOS compatibility
  const initializeCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const hasSupport = await checkCameraSupport()
    if (!hasSupport) {
      setError('Camera access is not available. Please ensure you are using HTTPS or localhost, and grant camera permissions.')
      setIsLoading(false)
      return
    }

    let isMounted = true
    let stream: MediaStream | null = null
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      },
    })

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    hands.onResults((results) => {
      if (!isMounted || !canvasRef.current || !videoRef.current) return

      const canvasCtx = canvasRef.current.getContext('2d')
      if (!canvasCtx) return

      canvasCtx.save()
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      )

      // Draw coin calibration points if in coin measurement step
      if (step === 'coin-measurement') {
        const currentPoints = coinPoints
        if (currentPoints.length > 0) {
          currentPoints.forEach((point, index) => {
            canvasCtx.fillStyle = index === 0 ? '#00FF00' : '#FF0000'
            canvasCtx.beginPath()
            canvasCtx.arc(point.x, point.y, 8, 0, 2 * Math.PI)
            canvasCtx.fill()
            
            if (currentPoints.length === 2) {
              // Draw line between points
              canvasCtx.strokeStyle = '#FFFF00'
              canvasCtx.lineWidth = 2
              canvasCtx.beginPath()
              canvasCtx.moveTo(currentPoints[0].x, currentPoints[0].y)
              canvasCtx.lineTo(currentPoints[1].x, currentPoints[1].y)
              canvasCtx.stroke()
            }
          })
        }
      }

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0]
        
        // Draw hand landmarks
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2,
        })
        drawLandmarks(canvasCtx, landmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3,
        })

        // Calculate nail sizes if capturing and calibrated
        if (isCapturingRef.current && step === 'hand-measurement' && calibrationData) {
          const size = calculateNailSize(landmarks, canvasRef.current.width, canvasRef.current.height, calibrationData.mmPerPixel)
          setDetectedSize(size)
        }
      }

      canvasCtx.restore()
    })

    handsRef.current = hands

    // Try to initialize camera with better error handling for iOS
    try {
      // Request camera access with current facing mode
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })
      
      streamRef.current = stream

      if (!videoRef.current) return

      // Set video source
      videoRef.current.srcObject = stream
      
      // Detect iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      
      // For iOS, use manual frame capture (MediaPipe Camera doesn't work on iOS)
      if (isIOS) {
        videoRef.current.onloadedmetadata = () => {
          if (!isMounted || !videoRef.current) return
          
          videoRef.current.play().then(() => {
            const captureFrame = async () => {
              if (!isMounted || !videoRef.current || !handsRef.current) return
              
              // Check if video is ready
              if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                try {
                  await handsRef.current.send({ image: videoRef.current })
                } catch (err) {
                  if (isMounted) {
                    console.error('Error sending frame:', err)
                  }
                }
              }
              
              if (isMounted) {
                animationFrameRef.current = requestAnimationFrame(captureFrame)
              }
            }
            
            captureFrame()
            
            if (isMounted) {
              setIsLoading(false)
            }
          }).catch((err) => {
            console.error('Error playing video:', err)
            if (isMounted) {
              setError('Failed to start camera. Please ensure camera permissions are granted.')
              setIsLoading(false)
            }
          })
        }
      } else {
        // For non-iOS, try MediaPipe Camera first, fallback to manual
        try {
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (isMounted && videoRef.current && handsRef.current) {
                try {
                  await handsRef.current.send({ image: videoRef.current })
                } catch (err) {
                  if (isMounted) {
                    console.error('Error sending frame to MediaPipe:', err)
                  }
                }
              }
            },
            width: 640,
            height: 480,
          })

          camera.start()
          cameraRef.current = camera
          
          if (isMounted) {
            setIsLoading(false)
          }
        } catch (cameraError) {
          // Fallback: manual frame capture
          console.warn('MediaPipe Camera not available, using manual capture:', cameraError)
          videoRef.current.onloadedmetadata = () => {
            if (!isMounted || !videoRef.current) return
            
            videoRef.current.play().then(() => {
              const captureFrame = async () => {
                if (!isMounted || !videoRef.current || !handsRef.current) return
                
                if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                  try {
                    await handsRef.current.send({ image: videoRef.current })
                  } catch (err) {
                    if (isMounted) {
                      console.error('Error sending frame:', err)
                    }
                  }
                }
                
                if (isMounted) {
                  animationFrameRef.current = requestAnimationFrame(captureFrame)
                }
              }
              
              captureFrame()
              
              if (isMounted) {
                setIsLoading(false)
              }
            }).catch((err) => {
              console.error('Error playing video:', err)
              if (isMounted) {
                setError('Failed to start camera.')
                setIsLoading(false)
              }
            })
          }
        }
      }
    } catch (err: any) {
      console.error('Camera access error:', err)
      if (isMounted) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera permission denied. Please allow camera access in your browser settings.')
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera found. Please ensure a camera is connected.')
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Camera is already in use by another application.')
        } else {
          setError(`Camera error: ${err.message || 'Unable to access camera. Please ensure you are using HTTPS.'}`)
        }
        setIsLoading(false)
      }
      return
    }
    
    if (isMounted) {
      setIsLoading(false)
    }

    return () => {
      isMounted = false
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current)
      }
      if (cameraRef.current) {
        try {
          cameraRef.current.stop()
        } catch (err) {
          // Ignore cleanup errors
        }
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
      }
      if (handsRef.current) {
        try {
          handsRef.current.close()
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    }
  }

  useEffect(() => {
    // Only initialize camera when not in coin-selection step
    if (step !== 'coin-selection') {
      initializeCamera()
    } else {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, coinPoints.length, calibrationData, facingMode])

  const calculateNailSize = (
    landmarks: any[],
    canvasWidth: number,
    canvasHeight: number,
    mmPerPixel: number
  ): string => {
    // MediaPipe hand landmarks indices
    // Fingertips: Thumb: 4, Index: 8, Middle: 12, Ring: 16, Pinky: 20
    // Finger bases: Thumb: 2, Index: 5, Middle: 9, Ring: 13, Pinky: 17
    // Nail beds (where nail starts): Thumb: 3, Index: 6, Middle: 10, Ring: 14, Pinky: 18
    const fingertipIndices = [4, 8, 12, 16, 20]
    const nailBedIndices = [3, 6, 10, 14, 18]
    const fingerWidthIndices = [
      [5, 17], // Index finger width (MCP joints)
      [9, 13], // Middle finger width
      [13, 17], // Ring finger width
    ]

    let totalNailWidth = 0
    let totalNailLength = 0
    let validMeasurements = 0

    // Measure nail width and length for each finger
    fingertipIndices.forEach((tipIdx, i) => {
      const tip = landmarks[tipIdx]
      const nailBed = landmarks[nailBedIndices[i]]

      // Calculate nail length (from nail bed to fingertip)
      const dxLength = (tip.x - nailBed.x) * canvasWidth
      const dyLength = (tip.y - nailBed.y) * canvasHeight
      const nailLengthPixels = Math.sqrt(dxLength * dxLength + dyLength * dyLength)
      const nailLengthMM = nailLengthPixels * mmPerPixel

      // Calculate nail width (perpendicular to length)
      // Use finger width as approximation for nail width
      let nailWidthMM = 0
      if (i > 0 && i <= 3) {
        // For index, middle, ring fingers, estimate width from finger width
        const widthLandmarks = fingerWidthIndices[i - 1]
        const width1 = landmarks[widthLandmarks[0]]
        const width2 = landmarks[widthLandmarks[1]]
        const dxWidth = (width1.x - width2.x) * canvasWidth
        const dyWidth = (width1.y - width2.y) * canvasHeight
        const fingerWidthPixels = Math.sqrt(dxWidth * dxWidth + dyWidth * dyWidth)
        // Nail width is approximately 60-70% of finger width
        nailWidthMM = (fingerWidthPixels * 0.65) * mmPerPixel
      } else {
        // For thumb and pinky, estimate based on nail length (typical ratio)
        nailWidthMM = nailLengthMM * 0.8
      }

      // Calculate nail area (approximate as ellipse)
      const nailArea = Math.PI * (nailLengthMM / 2) * (nailWidthMM / 2)

      // Use a combination of length, width, and area for sizing
      // Average nail size metric
      const nailSizeMetric = (nailLengthMM * 0.4) + (nailWidthMM * 0.4) + (Math.sqrt(nailArea) * 0.2)

      if (nailLengthMM > 0 && nailLengthMM < 30 && nailWidthMM > 0 && nailWidthMM < 20) {
        totalNailLength += nailLengthMM
        totalNailWidth += nailWidthMM
        validMeasurements++
      }
    })

    if (validMeasurements === 0) return 'M'

    const avgNailLength = totalNailLength / validMeasurements
    const avgNailWidth = totalNailWidth / validMeasurements
    const avgNailArea = Math.PI * (avgNailLength / 2) * (avgNailWidth / 2)

    // Improved sizing based on multiple factors
    // Small: length < 7mm or area < 35mm²
    // Medium: length 7-11mm and area 35-65mm²
    // Large: length > 11mm or area > 65mm²
    if (avgNailLength < 7 || avgNailArea < 35) {
      return 'S'
    } else if (avgNailLength <= 11 && avgNailArea <= 65) {
      return 'M'
    } else {
      return 'LG'
    }
  }


  const handleCalibrate = () => {
    if (coinPoints.length !== 2 || !canvasRef.current) {
      setError('Please click two points on opposite edges of the coin')
      return
    }

    const coinSizeMM = selectedCoin === 'other' 
      ? parseFloat(customCoinSize)
      : COIN_SIZES[selectedCoin]

    if (!coinSizeMM || coinSizeMM <= 0) {
      setError('Please enter a valid coin size')
      return
    }

    // Calculate distance between two points in pixels
    const dx = coinPoints[1].x - coinPoints[0].x
    const dy = coinPoints[1].y - coinPoints[0].y
    const coinDiameterPixels = Math.sqrt(dx * dx + dy * dy)

    if (coinDiameterPixels <= 0) {
      setError('Invalid measurement. Please try again.')
      return
    }

    // Calculate mm per pixel
    const mmPerPixel = coinSizeMM / coinDiameterPixels
    setCalibrationData({ mmPerPixel })
    setStep('hand-measurement')
    setError(null)
  }

  const handleCapture = () => {
    if (!calibrationData) {
      setError('Please complete calibration first')
      return
    }

    setError(null)
    isCapturingRef.current = true
    
    // Wait a moment for detection to stabilize and capture
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current)
    }
    
    captureTimeoutRef.current = setTimeout(() => {
      if (canvasRef.current && videoRef.current) {
        try {
          const canvas = canvasRef.current
          const imageData = canvas.toDataURL('image/png')
          setCapturedImage(imageData)
          isCapturingRef.current = false
        } catch (err) {
          console.error('Error capturing image:', err)
          setError('Failed to capture image. Please try again.')
          isCapturingRef.current = false
        }
      }
    }, 1500) // Slightly longer to ensure detection is stable
  }

  const handleRetake = () => {
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current)
    }
    isCapturingRef.current = false
    setCapturedImage(null)
    setDetectedSize(null)
    setError(null)
    setStep('hand-measurement')
  }

  const handleResetCalibration = () => {
    setStep('coin-selection')
    setCoinPoints([])
    setCalibrationData(null)
    setError(null)
  }

  // Function to switch camera
  const switchCamera = async () => {
    if (isSwitchingCamera) return
    
    setIsSwitchingCamera(true)
    setError(null)
    setIsLoading(true)
    
    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    if (cameraRef.current) {
      try {
        cameraRef.current.stop()
      } catch (err) {
        // Ignore errors
      }
      cameraRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    // Switch facing mode
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacingMode)
    
    // Small delay to ensure cleanup is complete
    setTimeout(() => {
      setIsSwitchingCamera(false)
      // The useEffect will re-run and initialize the new camera
    }, 100)
  }

  const handleConfirm = () => {
    if (detectedSize) {
      onSizeSelected(detectedSize)
    } else {
      setError('Please ensure your hand is visible in the frame')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-elegant font-bold text-gray-900">Sizing Guide</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {step === 'coin-selection' ? (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Step 1: Select Your Coin</h3>
                <p className="text-gray-600 mb-4">
                  Place a coin next to your hand for accurate calibration. Select the type of coin you&apos;re using:
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {Object.entries(COIN_SIZES).filter(([key]) => key !== 'other').map(([key, size]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCoin(key as keyof typeof COIN_SIZES)}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        selectedCoin === key
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-semibold capitalize">{key}</div>
                      <div className="text-sm text-gray-600">{size}mm diameter</div>
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedCoin('other')}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      selectedCoin === 'other'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    <div className="font-semibold">Other</div>
                    <div className="text-sm text-gray-600">Custom size</div>
                  </button>
                </div>

                {selectedCoin === 'other' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coin Diameter (mm)
                    </label>
                    <input
                      type="number"
                      value={customCoinSize}
                      onChange={(e) => setCustomCoinSize(e.target.value)}
                      placeholder="Enter diameter in millimeters"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      step="0.1"
                      min="0"
                    />
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> A US Quarter (24.26mm) works best for calibration. Place it flat on the same surface as your hand.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('coin-measurement')}
                  disabled={selectedCoin === 'other' && (!customCoinSize || parseFloat(customCoinSize) <= 0)}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Calibration
                </button>
                <button
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : step === 'coin-measurement' ? (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Step 2: Measure the Coin</h3>
                <p className="text-gray-600 mb-2">
                  Place your hand and the coin in view. Click on two opposite edges of the coin to measure its diameter.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {coinPoints.length === 0 && 'Click on the first edge of the coin'}
                  {coinPoints.length === 1 && 'Click on the opposite edge of the coin'}
                  {coinPoints.length === 2 && 'Click "Calibrate" to continue, or click again to remeasure'}
                </p>
              </div>

              {isLoading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <p className="mt-2 text-gray-600">Loading camera...</p>
                </div>
              )}

              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                  width={640}
                  height={480}
                />
                <button
                  onClick={switchCamera}
                  disabled={isSwitchingCamera || isLoading}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title={`Switch to ${facingMode === 'user' ? 'back' : 'front'} camera`}
                >
                  {isSwitchingCamera ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleCalibrate}
                  disabled={coinPoints.length !== 2 || isLoading}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Calibrate
                </button>
                <button
                  onClick={handleResetCalibration}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
              </div>
            </div>
          ) : !capturedImage ? (
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">Step 3: Measure Your Hand</h3>
                  {calibrationData && (
                    <button
                      onClick={handleResetCalibration}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Recalibrate
                    </button>
                  )}
                </div>
                <p className="text-gray-600 mb-2">
                  Position your hand in front of the camera with your palm facing you.
                </p>
                <p className="text-sm text-gray-500">
                  Make sure all fingers are visible and well-lit. The coin can be removed now.
                </p>
                {calibrationData && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                    ✓ Calibrated: {calibrationData.mmPerPixel.toFixed(4)} mm per pixel
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <p className="mt-2 text-gray-600">Loading camera...</p>
                </div>
              )}

              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                  width={640}
                  height={480}
                />
                <button
                  onClick={switchCamera}
                  disabled={isSwitchingCamera || isLoading}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
                  title={`Switch to ${facingMode === 'user' ? 'back' : 'front'} camera`}
                >
                  {isSwitchingCamera ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleCapture}
                  disabled={isLoading || !calibrationData || isSwitchingCamera}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Capture & Measure
                </button>
                <button
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Measurement Complete</h3>
                {detectedSize && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Detected Size:</span>
                    </p>
                    <p className="text-3xl font-bold text-primary-600">{detectedSize}</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={capturedImage || ''}
                  alt="Captured hand"
                  className="w-full rounded-lg border border-gray-200"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleConfirm}
                  disabled={!detectedSize}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Use This Size
                </button>
                <button
                  onClick={handleRetake}
                  className="btn-secondary flex-1"
                >
                  Retake
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

