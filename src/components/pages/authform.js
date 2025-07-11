"use client";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../../firebase-config";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

const AuthForm = ({ isLogin, toggleForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(""); // ✅ error state added
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // clear previous error
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/templates");
    } catch (error) {
      console.error("Auth Error:", error.message);
      setError(error.message); // ✅ show error on screen
    }
  };
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent.");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setError(""); // clear previous error
    try {
      await signInWithPopup(auth, provider);
      navigate("/templates");
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
      setError(error.message); // ✅ show error on screen
    }
  };

  return (
    <div className="p-8 w-full">
      <div className="title text-2xl font-medium text-gray-800 mb-6 relative">
        {isLogin ? "Login" : "Signup"}
        <span className="absolute left-0 bottom-0 h-1 w-6 bg-purple-400"></span>
      </div>

      {/* ✅ Show error if exists */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-4 border border-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="input-box relative">
            <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600"></i>
            <input
              type="text"
              placeholder="Enter your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 pl-10 border-b-2 border-gray-300 focus:border-purple-600 outline-none text-base font-medium"
            />
          </div>
        )}
        <div className="input-box relative">
          <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600"></i>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 pl-10 border-b-2 border-gray-300 focus:border-purple-600 outline-none text-base font-medium"
          />
        </div>
        <div className="input-box relative">
          <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600"></i>
          <input
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 pl-10 border-b-2 border-gray-300 focus:border-purple-600 outline-none text-base font-medium"
          />
        </div>
        {isLogin && (
          <div className="text text-sm text-gray-600">
            <button
              onClick={handleForgotPassword} // replace with your function
              className="text-purple-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}
        <div className="button input-box">
          <input
            type="submit"
            value={isLogin ? "Login" : "Signup"}
            className="w-full h-12 bg-purple-600 text-white rounded-md cursor-pointer hover:bg-purple-700 transition duration-300"
          />
        </div>

        <div className="mt-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute border-t border-gray-300 w-full"></div>
            <div className="relative bg-white px-4 text-sm text-gray-500">
              or continue with
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="mt-4 w-full h-12 flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition duration-300 shadow-sm"
          >
            <FontAwesomeIcon icon={faGoogle} className="text-red-500 text-lg" />
            <span className="text-gray-700 font-medium">
              Sign up with Google
            </span>
          </button>
        </div>

        <div className="text sign-up-text text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="text-purple-600 cursor-pointer hover:underline"
            onClick={toggleForm}
          >
            {isLogin ? "Signup now" : "Login now"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
