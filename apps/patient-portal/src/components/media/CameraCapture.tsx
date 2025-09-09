'use client'

import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { 
  CameraIcon, 
  XMarkIcon, 
  ArrowPathIcon,
  CheckIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onClose: () => void
  isOpen: boolean
}

export function CameraCapture({ onCapture, onClose, isOpen }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [isCapturing, setIsCapturing] = useState(false)

  const capture = useCallback(() => {
    if (!webcamRef.current) return
    
    setIsCapturing(true)
    
    // Add a small delay for animation
    setTimeout(() => {
      const imageSrc = webcamRef.current?.getScreenshot()
      if (imageSrc) {
        setCapturedImage(imageSrc)
      }
      setIsCapturing(false)
    }, 200)
  }, [])

  const retake = useCallback(() => {
    setCapturedImage(null)
  }, [])

  const confirm = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage)
      setCapturedImage(null)
      onClose()
    }
  }, [capturedImage, onCapture, onClose])

  const switchCamera = useCallback(() => {
    setFacingMode(current => current === 'user' ? 'environment' : 'user')
  }, [])

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: facingMode
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-black/50 safe-area-pt">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/30 text-white touch-target touch-feedback"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <h2 className="text-white font-medium">Take Photo</h2>
            
            <button
              onClick={switchCamera}
              className="p-2 rounded-full bg-black/30 text-white touch-target touch-feedback"
            >
              <ArrowPathIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Camera View */}
          <div className="flex-1 relative overflow-hidden">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.9}
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
                mirrored={facingMode === 'user'}
              />
            )}

            {/* Flash effect */}
            <AnimatePresence>
              {isCapturing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="absolute inset-0 bg-white"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-black/50 safe-area-pb">
            {capturedImage ? (
              <div className="flex items-center justify-center space-x-8">
                <button
                  onClick={retake}
                  className="flex flex-col items-center space-y-2 text-white touch-target touch-feedback"
                >
                  <div className="p-3 rounded-full bg-white/20">
                    <ArrowPathIcon className="h-6 w-6" />
                  </div>
                  <span className="text-sm">Retake</span>
                </button>
                
                <button
                  onClick={confirm}
                  className="flex flex-col items-center space-y-2 text-white touch-target touch-feedback"
                >
                  <div className="p-3 rounded-full bg-primary-600">
                    <CheckIcon className="h-6 w-6" />
                  </div>
                  <span className="text-sm">Use Photo</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <button
                  onClick={capture}
                  disabled={isCapturing}
                  className="relative p-2 touch-target touch-feedback"
                >
                  <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 active:bg-white/20 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                      <CameraIcon className="h-8 w-8 text-gray-900" />
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Guidelines */}
          {!capturedImage && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-white/30 rounded-lg"></div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// File upload component for non-camera devices
interface FileUploadProps {
  onUpload: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  children: React.ReactNode
}

export function FileUpload({ 
  onUpload, 
  accept = 'image/*', 
  multiple = false,
  maxFiles = 1,
  children 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files).slice(0, maxFiles)
    onUpload(fileArray)
  }, [onUpload, maxFiles])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`cursor-pointer transition-all duration-200 ${
          isDragging ? 'bg-primary-50 border-primary-300' : ''
        }`}
      >
        {children}
      </div>
    </>
  )
}

// Combined media upload button
interface MediaUploadButtonProps {
  onImageCapture: (imageData: string) => void
  onFileUpload: (files: File[]) => void
}

export function MediaUploadButton({ onImageCapture, onFileUpload }: MediaUploadButtonProps) {
  const [showCamera, setShowCamera] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const handleCameraCapture = useCallback((imageData: string) => {
    onImageCapture(imageData)
    setShowCamera(false)
  }, [onImageCapture])

  const handleFileUpload = useCallback((files: File[]) => {
    onFileUpload(files)
    setShowOptions(false)
  }, [onFileUpload])

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="btn-primary flex items-center space-x-2"
        >
          <PhotoIcon className="h-5 w-5" />
          <span>Add Media</span>
        </button>

        {/* Options Menu */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-float border border-gray-100 py-2 min-w-48 z-50"
            >
              <button
                onClick={() => {
                  setShowCamera(true)
                  setShowOptions(false)
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
              >
                <CameraIcon className="h-5 w-5 text-gray-500" />
                <span>Take Photo</span>
              </button>
              
              <FileUpload onUpload={handleFileUpload} accept="image/*,video/*" multiple>
                <div className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3">
                  <PhotoIcon className="h-5 w-5 text-gray-500" />
                  <span>Choose Files</span>
                </div>
              </FileUpload>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Camera Modal */}
      <CameraCapture
        isOpen={showCamera}
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />

      {/* Backdrop */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOptions(false)}
            className="fixed inset-0 z-40"
          />
        )}
      </AnimatePresence>
    </>
  )
}