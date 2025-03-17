"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline"

function UploadPage() {
  const [audioFile, setAudioFile] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [recordingMessage, setRecordingMessage] = useState("")
  const [transcription, setTranscription] = useState("")
  const [diarization, setDiarization] = useState([]) // Diarization as an array of objects
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0) // State for upload progress
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunks = useRef([])

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0])
    setErrorMessage("")
  }

  const handleUpload = () => {
    if (!audioFile) {
      setErrorMessage("No file selected")
      return
    }

    setIsUploading(true)
    setIsTranscribing(true)
    setTranscription("")
    setRecordingMessage("")

    const formData = new FormData()
    formData.append("audio", audioFile)

    const xhr = new XMLHttpRequest()

    // Track progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100)
        setUploadProgress(percentComplete)
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText)

        if (result.transcription) {
          setTranscription(result.transcription)
        } else {
          setTranscription("Transcription failed. Please try again.")
        }

        if (result.diarization && Array.isArray(result.diarization)) {
          setDiarization(result.diarization)
        } else {
          setDiarization([])
        }

        setErrorMessage("")
      } else {
        setErrorMessage("Error uploading audio")
        setTranscription("")
      }

      setIsUploading(false)
      setIsTranscribing(false)
    }

    xhr.onerror = () => {
      setErrorMessage("Error uploading audio")
      setIsUploading(false)
      setIsTranscribing(false)
      setTranscription("")
    }

    xhr.open("POST", "http://127.0.0.1:5000/upload")
    xhr.send(formData)
  }

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorderRef.current = new MediaRecorder(stream)
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data)
    }
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" })
      const audioFile = new File([audioBlob], "recordedAudio.wav", { type: "audio/wav" })
      setAudioFile(audioFile)
      audioChunks.current = []
    }
    mediaRecorderRef.current.start()
    setRecordingMessage("Recording started...")
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause()
      setRecordingMessage("Recording paused.")
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume()
      setRecordingMessage("Recording resumed.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setRecordingMessage("Recording stopped.")
      setTimeout(() => {
        setRecordingMessage("")
      }, 2000)
    }
  }

  // Audio wave animation for decorative purposes
  const AudioWave = () => {
    return (
      <div className="flex items-center justify-center h-12 gap-1 my-2">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-purple-500 rounded-full"
            animate={{
              height: [15, 30, 15],
            }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full border border-purple-100"
      >
        <div className="flex items-center justify-center mb-6">
          <SpeakerWaveIcon className="w-10 h-10 text-purple-600 mr-3" />
          <h1 className="text-4xl font-bold text-center text-purple-800 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Audio Transcription Magic
          </h1>
        </div>

        <div className="flex justify-center mb-6">
          <AudioWave />
        </div>

        <div className="flex flex-col items-center mb-8">
          <label
            htmlFor="audio-file"
            className="w-64 flex flex-col items-center px-4 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg tracking-wide uppercase border border-purple-700 cursor-pointer hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            <CloudArrowUpIcon className="w-8 h-8" />
            <span className="mt-2 text-base leading-normal">Select audio file</span>
            <input type="file" id="audio-file" accept="audio/*" onChange={handleFileChange} className="hidden" />
          </label>
          {audioFile && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-sm text-gray-600 bg-purple-50 px-4 py-2 rounded-full"
            >
              Selected file: {audioFile.name}
            </motion.p>
          )}
        </div>

        <motion.button
          className={`w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all ${
            isUploading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          onClick={handleUpload}
          disabled={isUploading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isUploading ? `Uploading... ${uploadProgress}%` : "Transcribe Audio"}
        </motion.button>

        {isUploading && (
          <div className="mt-6">
            <div className="relative pt-1">
              <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-purple-200">
                <motion.div
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        )}

        {isTranscribing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex flex-col items-center bg-purple-50 p-6 rounded-xl"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-purple-600 text-sm font-medium">Processing</span>
              </div>
              <svg className="animate-spin w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="opacity-25"
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle
                  className="opacity-75 text-purple-600"
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="283"
                  strokeDashoffset="100"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="mt-4 text-purple-800 font-medium">Transcribing your audio...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a moment depending on the file size</p>

            <div className="mt-4 flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-purple-600"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center mt-6 p-4 bg-red-50 rounded-xl border border-red-100"
          >
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{errorMessage}</span>
          </motion.div>
        )}

        {transcription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white p-6 rounded-xl border border-purple-100 shadow-md"
          >
            <h2 className="text-2xl font-semibold text-purple-800 mb-4 flex items-center">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
              Transcription Result
            </h2>
            <textarea
              value={transcription}
              readOnly
              rows="6"
              className="w-full p-4 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow bg-purple-50"
            ></textarea>
          </motion.div>
        )}

        {diarization.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white p-6 rounded-xl border border-purple-100 shadow-md"
          >
            <h2 className="text-2xl font-semibold text-purple-800 mb-4 flex items-center">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
              Speaker Diarization
            </h2>
            {diarization.map((segment, index) => (
              <div key={index} className="mb-4 p-3 bg-purple-50 rounded-lg">
                <p className="font-semibold text-purple-700">{`${segment.speaker} (${segment.time_range}):`}</p>
                <p className="text-gray-700">{segment.text}</p>
              </div>
            ))}
          </motion.div>
        )}

        {recordingMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100"
          >
            <span className="text-yellow-800 flex items-center">
              <MicrophoneIcon className="w-5 h-5 mr-2 text-yellow-600" />
              {recordingMessage}
            </span>
          </motion.div>
        )}

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <motion.button
            onClick={startRecording}
            className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center">
              <MicrophoneIcon className="w-5 h-5 mr-2" />
              Start Recording
            </div>
          </motion.button>
          <motion.button
            onClick={pauseRecording}
            className="px-5 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Pause Recording
          </motion.button>
          <motion.button
            onClick={resumeRecording}
            className="px-5 py-3 bg-gradient-to-r from-blue-500 to-sky-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Resume Recording
          </motion.button>
          <motion.button
            onClick={stopRecording}
            className="px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Stop Recording
          </motion.button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Transform your audio into text with our advanced transcription technology</p>
        </div>
      </motion.div>
    </div>
  )
}

export default UploadPage

