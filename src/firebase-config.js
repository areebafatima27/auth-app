// src/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyChpdJnGrFruZm85eZ8frqgiID3u-vul8Y",
  authDomain: "meeting-minutes-4b355.firebaseapp.com",
  projectId: "meeting-minutes-4b355",
  storageBucket: "meeting-minutes-4b355.firebaseapp.com",
  messagingSenderId: "721806925986",
  appId: "1:721806925986:web:d5a19566ee6d7c74def7fb",
  measurementId: "G-7JLX0TZYLD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get authentication object
const auth = getAuth(app);

// Export the auth and app objects
export { auth };
export default app;
