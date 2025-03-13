import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthPage from "./components/pages/authpage";
import HomePage from "./components/HomePage";  // Create a HomePage component that includes Header, About, Services, etc.
import Loader from "./components/Loader/loader"; // Adjust the import path for your loader
import UploadPage from './templates/index'; 

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate an app loading process
    const timer = setTimeout(() => {
      setIsLoading(false); // Stop showing the loader after 3 seconds
    }, 3000);

    // Clear timeout if component unmounts
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />; // Show loader while the app is loading
  }

  return (
    <Router>
      <Routes>
        {/* Main app page with all components */}
        <Route path="/" element={<HomePage />} />
        {/* Route for the authentication page */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/templates" element={<UploadPage />} />
      </Routes>
    </Router>
  );
}

export default App;
