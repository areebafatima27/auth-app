"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  KeyIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

function UploadPage() {
  const [audioFile, setAudioFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [recordingMessage, setRecordingMessage] = useState("");
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState(""); // State for summary
  const [diarization, setDiarization] = useState([]); // Diarization as an array of objects
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // State for upload progress
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showSummary, setShowSummary] = useState(false); // State to control summary visibility
  const [keyPoints, setKeyPoints] = useState([]); // State for key points
  const [isExtractingKeyPoints, setIsExtractingKeyPoints] = useState(false); // Loading state for key points
  const [activeTab, setActiveTab] = useState("transcription"); // State for active tab
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const downloadText = (content, filename) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    // Add a temporary success message
    const successMessage = document.createElement("div");
    successMessage.className =
      "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50";
    successMessage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg><span>${filename} downloaded successfully!</span>`;
    document.body.appendChild(successMessage);

    // Remove the message after 3 seconds
    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 3000);
  };

  // Function to download transcription
  const downloadTranscription = () => {
    if (!transcription) return;
    downloadText(transcription, "transcription.txt");
  };

  // Function to download summary
  const downloadSummary = () => {
    if (!summary) return;
    downloadText(summary, "summary.txt");
  };

  // Function to download key points
  const downloadKeyPoints = () => {
    if (keyPoints.length === 0) return;
    const formattedKeyPoints = keyPoints
      .map((point, index) => `${index + 1}. ${point}`)
      .join("\n");
    downloadText(formattedKeyPoints, "key-points.txt");
  };

  // Function to download diarization
  const downloadDiarization = () => {
    if (diarization.length === 0) return;
    const formattedDiarization = diarization
      .map(
        (segment) =>
          `${segment.speaker} (${segment.time_range}):\n${segment.text}\n`
      )
      .join("\n");
    downloadText(formattedDiarization, "speaker-diarization.txt");
  };

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
    setErrorMessage("");
    setDownloadUrl(null);
  };

  const handleUpload = async () => {
    if (!audioFile) {
      setErrorMessage("No file selected");
      return;
    }

    setIsUploading(true);
    setIsTranscribing(true);
    setTranscription("Transcribing the audio, please wait...");
    setSummary(""); // Reset summary
    setShowSummary(false); // Hide summary when uploading new file
    setRecordingMessage("");
    setKeyPoints([]); // Reset key points when uploading new file
    setUploadProgress(0);
    setActiveTab("transcription"); // Reset to transcription tab

    const formData = new FormData();
    formData.append("audio", audioFile);

    try {
      // Using XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Track progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);

          if (result.transcription) {
            setTranscription(result.transcription);
          } else {
            setTranscription("Transcription failed. Please try again.");
          }

          // Handle summary
          if (result.summary) {
            setSummary(result.summary);
            setShowSummary(true);
          } else {
            setSummary("");
          }

          if (result.diarization && Array.isArray(result.diarization)) {
            setDiarization(result.diarization);
          } else {
            setDiarization([]);
          }

          if (result.keypoints && Array.isArray(result.keypoints)) {
            setKeyPoints(result.keypoints);
          }

          setErrorMessage("");
        } else {
          setErrorMessage("Error uploading audio");
          setTranscription("");
          setSummary("");
        }

        setIsUploading(false);
        setIsTranscribing(false);
      };

      xhr.onerror = () => {
        setErrorMessage("Error uploading audio");
        setIsUploading(false);
        setIsTranscribing(false);
        setTranscription("");
        setSummary("");
      };

      xhr.open("POST", "http://127.0.0.1:5000/upload");
      xhr.send(formData);
    } catch (error) {
      setErrorMessage("Error uploading audio");
      setIsUploading(false);
      setIsTranscribing(false);
      setTranscription("");
      setSummary("");
    }
  };

  const handleKeyPoints = async () => {
    if (!transcription) {
      setErrorMessage("No transcription available");
      return;
    }

    setIsExtractingKeyPoints(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/extract-keypoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription }),
      });

      if (!response.ok) throw new Error("Error extracting key points");

      const result = await response.json();
      setKeyPoints(result.keypoints || []); // Change to lowercase 'keypoints'
      setErrorMessage("");
      setActiveTab("keypoints"); // Switch to keypoints tab after extraction
    } catch (error) {
      console.error("Error extracting key points:", error);
      setErrorMessage("Error extracting key points");
    } finally {
      setIsExtractingKeyPoints(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const audioFile = new File([audioBlob], "recordedAudio.wav", {
          type: "audio/wav",
        });
        setAudioFile(audioFile);

        // Create download URL for the recorded audio
        const url = URL.createObjectURL(audioBlob);
        setDownloadUrl(url);

        setRecordingMessage(
          "Recording stopped. You can now save or upload the audio."
        );
      };

      mediaRecorderRef.current.start();
      setRecordingMessage("Recording started...");
    } catch (error) {
      setErrorMessage(
        "Error accessing microphone. Please ensure you have granted permission."
      );
      console.error("Error starting recording:", error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingMessage("Recording paused.");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingMessage("Recording resumed.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const generateSummary = () => {
    if (transcription) {
      setShowSummary(true);
      if (!summary) {
        setSummary("Generating summary...");
        // In a real app, you would call your API here
        setTimeout(() => {
          setSummary(
            "This is a generated summary of your transcription. In a production environment, this would be generated by an AI model based on the transcription content."
          );
          setActiveTab("summary"); // Switch to summary tab after generation
        }, 1500);
      } else {
        setActiveTab("summary"); // Switch to summary tab if already generated
      }
    }
  };

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
    );
  };

  // Tab component
  const Tab = ({ id, label, icon, isActive, onClick }) => {
    return (
      <button
        onClick={() => onClick(id)}
        className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${
          isActive
            ? "bg-white text-purple-700 border-t-2 border-l border-r border-purple-300 border-b-0 font-medium"
            : "bg-purple-50 text-gray-600 hover:bg-purple-100 border border-transparent"
        }`}
      >
        {icon}
        <span>{label}</span>
        {isActive && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600"></div>
        )}
      </button>
    );
  };

  // Check if we have results to show
  const hasResults =
    transcription || summary || keyPoints.length > 0 || diarization.length > 0;

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
            <span className="mt-2 text-base leading-normal">
              Select audio file
            </span>
            <input
              type="file"
              id="audio-file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
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

        {/* Save Audio */}
        {downloadUrl && (
          <motion.a
            href={downloadUrl}
            download="recordedAudio.wav"
            className="block text-center mb-6 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-center">
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Save Recorded Audio
            </div>
          </motion.a>
        )}

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
                <span className="text-purple-600 text-sm font-medium">
                  Processing
                </span>
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
            <p className="mt-4 text-purple-800 font-medium">
              Transcribing your audio...
            </p>
            <p className="text-gray-500 text-sm mt-2">
              This may take a moment depending on the file size
            </p>

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

        {/* Tabbed Results Section */}
        {hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white rounded-xl border border-purple-100 shadow-md overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex flex-wrap border-b border-purple-100 relative">
              <Tab
                id="transcription"
                label="Transcription"
                icon={<DocumentTextIcon className="w-5 h-5" />}
                isActive={activeTab === "transcription"}
                onClick={setActiveTab}
              />
              {showSummary && summary && (
                <Tab
                  id="summary"
                  label="Summary"
                  icon={<DocumentDuplicateIcon className="w-5 h-5" />}
                  isActive={activeTab === "summary"}
                  onClick={setActiveTab}
                />
              )}
              {keyPoints.length > 0 && (
                <Tab
                  id="keypoints"
                  label="Key Points"
                  icon={<KeyIcon className="w-5 h-5" />}
                  isActive={activeTab === "keypoints"}
                  onClick={setActiveTab}
                />
              )}
              {diarization.length > 0 && (
                <Tab
                  id="diarization"
                  label="Speakers"
                  icon={<UsersIcon className="w-5 h-5" />}
                  isActive={activeTab === "diarization"}
                  onClick={setActiveTab}
                />
              )}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "transcription" && transcription && (
                  <motion.div
                    key="transcription"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold text-purple-800 flex items-center">
                        <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                        Transcription Result
                      </h2>
                      {!isTranscribing &&
                        transcription &&
                        transcription !==
                          "Transcribing the audio, please wait..." && (
                          <motion.button
                            onClick={downloadTranscription}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span>Download</span>
                          </motion.button>
                        )}
                    </div>
                    <textarea
                      value={transcription}
                      readOnly
                      rows="6"
                      className="w-full p-4 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow bg-purple-50"
                    ></textarea>

                    <div className="flex gap-4 mt-4">
                      {/* "Generate Summary" Button */}

                      {!isTranscribing &&
                        !showSummary &&
                        transcription &&
                        transcription !==
                          "Transcribing the audio, please wait..." && (
                          <motion.button
                            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                            onClick={generateSummary}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Generate Summary
                          </motion.button>
                        )}

                      {/* "Extract Key Points" Button */}
                      {!isTranscribing &&
                        keyPoints.length === 0 &&
                        transcription &&
                        transcription !==
                          "Transcribing the audio, please wait..." && (
                          <motion.button
                            onClick={handleKeyPoints}
                            disabled={isExtractingKeyPoints}
                            className={`px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center ${
                              isExtractingKeyPoints
                                ? "opacity-70 cursor-not-allowed"
                                : ""
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            {isExtractingKeyPoints
                              ? "Extracting..."
                              : "Extract Key Points"}
                          </motion.button>
                        )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "summary" && summary && (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold text-purple-800 flex items-center">
                        <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                        Summary
                      </h2>
                      <motion.button
                        onClick={downloadSummary}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span>Download</span>
                      </motion.button>
                    </div>
                    <div className="w-full p-4 border border-purple-200 rounded-xl bg-purple-50 prose prose-purple max-w-none">
                      {summary}
                    </div>
                  </motion.div>
                )}

                {activeTab === "keypoints" && keyPoints.length > 0 && (
                  <motion.div
                    key="keypoints"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold text-purple-800 flex items-center">
                        <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                        Key Points
                      </h2>
                      <motion.button
                        onClick={downloadKeyPoints}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span>Download</span>
                      </motion.button>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl space-y-3 border-l-4 border-green-500">
                      {keyPoints.map((point, index) => (
                        <div
                          key={index}
                          className="flex items-start text-gray-700 text-lg font-medium"
                        >
                          <span className="text-green-600 mr-2 flex-shrink-0">
                            ✓
                          </span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "diarization" && diarization.length > 0 && (
                  <motion.div
                    key="diarization"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold text-purple-800 flex items-center">
                        <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                        Speaker Diarization
                      </h2>
                      <motion.button
                        onClick={downloadDiarization}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span>Download</span>
                      </motion.button>
                    </div>
                    {diarization.map((segment, index) => (
                      <div
                        key={index}
                        className="mb-4 p-3 bg-purple-50 rounded-lg"
                      >
                        <p className="font-semibold text-purple-700">{`${segment.speaker} (${segment.time_range}):`}</p>
                        <p className="text-gray-700">{segment.text}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
          <p>
            Transform your audio into text with our advanced transcription
            technology
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default UploadPage;
