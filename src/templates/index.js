import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CloudArrowUpIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

function UploadPage() {
  const [audioFile, setAudioFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [recordingMessage, setRecordingMessage] = useState('');
  const [transcription, setTranscription] = useState('');
  const [diarization, setDiarization] = useState([]); // Diarization as an array of objects
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
    setErrorMessage('');
  };

  const handleUpload = async () => {
    if (!audioFile) {
      setErrorMessage('No file selected');
      return;
    }

    setIsUploading(true);
    setTranscription('Transcribing the audio, please wait...');
    setRecordingMessage('');

    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.transcription) {
        setTranscription(result.transcription);
      } else {
        setTranscription('Transcription failed. Please try again.');
      }

      if (result.diarization && Array.isArray(result.diarization)) {
        setDiarization(result.diarization);
      } else {
        setDiarization([]);
      }

      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Error uploading audio');
      setTranscription('');
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
      const audioFile = new File([audioBlob], 'recordedAudio.wav', { type: 'audio/wav' });
      setAudioFile(audioFile);
      audioChunks.current = [];
    };
    mediaRecorderRef.current.start();
    setRecordingMessage('Recording started...');
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingMessage('Recording paused.');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingMessage('Recording resumed.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecordingMessage('Recording stopped.');
      setTimeout(() => {
        setRecordingMessage('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full"
      >
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-800">Audio Transcription Magic</h1>

        <div className="flex flex-col items-center mb-6">
          <label
            htmlFor="audio-file"
            className="w-64 flex flex-col items-center px-4 py-6 bg-indigo-600 text-white rounded-lg shadow-lg tracking-wide uppercase border border-indigo-700 cursor-pointer hover:bg-indigo-700 transition-colors duration-300"
          >
            <CloudArrowUpIcon className="w-8 h-8" />
            <span className="mt-2 text-base leading-normal">Select audio file</span>
            <input type="file" id="audio-file" accept="audio/*" onChange={handleFileChange} className="hidden" />
          </label>
          {audioFile && <p className="mt-2 text-sm text-gray-600">Selected file: {audioFile.name}</p>}
        </div>

        <motion.button
          className={`w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleUpload}
          disabled={isUploading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isUploading ? 'Uploading...' : 'Transcribe Audio'}
        </motion.button>

        {isUploading && (
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                <motion.div
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                />
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center mt-4 p-4 bg-red-100 rounded-md">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{errorMessage}</span>
          </motion.div>
        )}

        {transcription && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
            <h2 className="text-2xl font-semibold text-indigo-800 mb-4 flex items-center">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
              Transcription Result
            </h2>
            <textarea
              value={transcription}
              readOnly
              rows="6"
              className="w-full p-4 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            ></textarea>
          </motion.div>
        )}

        {diarization.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
            <h2 className="text-2xl font-semibold text-indigo-800 mb-4 flex items-center">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
              Speaker Diarization
            </h2>
            {diarization.map((segment, index) => (
              <div key={index} className="mb-4">
                <p className="font-semibold">{`${segment.speaker} (${segment.time_range}):`}</p>
                <p>{segment.text}</p>
              </div>
            ))}
          </motion.div>
        )}

        {recordingMessage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-yellow-100 rounded-md">
            <span className="text-yellow-800">{recordingMessage}</span>
          </motion.div>
        )}

        <div className="flex justify-center space-x-4 mt-6">
          <motion.button
            onClick={startRecording}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Recording
          </motion.button>
          <motion.button
            onClick={pauseRecording}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Pause Recording
          </motion.button>
          <motion.button
            onClick={resumeRecording}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Resume Recording
          </motion.button>
          <motion.button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Stop Recording
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default UploadPage;
