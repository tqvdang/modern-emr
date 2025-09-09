'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  MicrophoneIcon, 
  StopIcon, 
  PlayIcon,
  PauseIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import RecordRTC from 'recordrtc'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  onClose: () => void
  isOpen: boolean
  maxDuration?: number // in seconds
}

export function VoiceRecorder({ 
  onRecordingComplete, 
  onClose, 
  isOpen, 
  maxDuration = 300 // 5 minutes
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [volume, setVolume] = useState(0)
  
  const recorderRef = useRef<RecordRTC | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.destroy()
      recorderRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setIsRecording(false)
    setIsPaused(false)
    setDuration(0)
    setVolume(0)
  }, [audioUrl])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      streamRef.current = stream

      // Create audio analyser for volume visualization
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
        bufferSize: 4096
      })

      recorder.startRecording()
      recorderRef.current = recorder
      setIsRecording(true)
      setDuration(0)

      // Start timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)

      // Start volume monitoring
      const updateVolume = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
          setVolume(average / 255)
        }
        if (isRecording) {
          animationRef.current = requestAnimationFrame(updateVolume)
        }
      }
      updateVolume()

    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Unable to access microphone. Please check permissions.')
    }
  }, [isRecording, maxDuration])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!recorderRef.current || !isRecording) return

    recorderRef.current.stopRecording(() => {
      if (recorderRef.current) {
        const blob = recorderRef.current.getBlob()
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
      }
    })

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    setIsRecording(false)
    setVolume(0)
  }, [isRecording])

  // Play/pause audio
  const togglePlayback = useCallback(() => {
    if (!audioUrl || !audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [audioUrl, isPlaying])

  // Delete recording
  const deleteRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
  }, [audioUrl])

  // Save recording
  const saveRecording = useCallback(() => {
    if (audioBlob && duration > 0) {
      onRecordingComplete(audioBlob, duration)
      cleanup()
      onClose()
    }
  }, [audioBlob, duration, onRecordingComplete, cleanup, onClose])

  // Format time
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Handle audio events
  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false)
  }, [])

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      cleanup()
    }
    return cleanup
  }, [isOpen, cleanup])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Voice Recording</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 touch-target"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Recording Interface */}
          <div className="space-y-6">
            {/* Time Display */}
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-gray-900">
                {formatTime(duration)}
              </div>
              {maxDuration && (
                <div className="text-sm text-gray-500 mt-1">
                  Max: {formatTime(maxDuration)}
                </div>
              )}
            </div>

            {/* Volume Visualization */}
            {isRecording && (
              <div className="flex justify-center">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 20 }, (_, i) => (
                    <motion.div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        volume * 20 > i ? 'bg-red-500' : 'bg-gray-200'
                      }`}
                      style={{
                        height: `${Math.max(4, Math.min(32, 4 + (volume * 20 > i ? volume * 28 : 0)))}px`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center items-center space-x-4">
              {!audioBlob ? (
                // Recording controls
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-4 rounded-full touch-target touch-feedback ${
                    isRecording 
                      ? 'bg-red-500 text-white' 
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isRecording ? (
                    <StopIcon className="h-8 w-8" />
                  ) : (
                    <MicrophoneIcon className="h-8 w-8" />
                  )}
                </button>
              ) : (
                // Playback controls
                <>
                  <button
                    onClick={deleteRecording}
                    className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 touch-target touch-feedback"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                  
                  <button
                    onClick={togglePlayback}
                    className="p-4 rounded-full bg-primary-600 text-white hover:bg-primary-700 touch-target touch-feedback"
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-8 w-8" />
                    ) : (
                      <PlayIcon className="h-8 w-8" />
                    )}
                  </button>
                  
                  <button
                    onClick={saveRecording}
                    className="p-3 rounded-full bg-green-100 text-green-600 hover:bg-green-200 touch-target touch-feedback"
                  >
                    <CheckIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-gray-500">
              {!audioBlob ? (
                isRecording ? (
                  <div>
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span>Recording in progress...</span>
                    </div>
                    <div>Tap the stop button when finished</div>
                  </div>
                ) : (
                  'Tap the microphone to start recording'
                )
              ) : (
                'Review your recording and save or delete'
              )}
            </div>
          </div>

          {/* Hidden audio element for playback */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Quick voice memo button
interface VoiceMemoButtonProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
}

export function VoiceMemoButton({ onRecordingComplete }: VoiceMemoButtonProps) {
  const [showRecorder, setShowRecorder] = useState(false)

  const handleRecordingComplete = useCallback((audioBlob: Blob, duration: number) => {
    onRecordingComplete(audioBlob, duration)
    setShowRecorder(false)
  }, [onRecordingComplete])

  return (
    <>
      <button
        onClick={() => setShowRecorder(true)}
        className="btn-secondary flex items-center space-x-2"
      >
        <MicrophoneIcon className="h-5 w-5" />
        <span>Voice Memo</span>
      </button>

      <VoiceRecorder
        isOpen={showRecorder}
        onRecordingComplete={handleRecordingComplete}
        onClose={() => setShowRecorder(false)}
        maxDuration={300} // 5 minutes
      />
    </>
  )
}