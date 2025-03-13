import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase-config'; // Import your Firebase config
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faFacebookF, faTwitter, faGoogle, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'; 

const AuthForm = ({ isLogin, toggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Add user name if needed (optional)
      }
      // Redirect to /templates after successful authentication
      navigate('/templates'); 
    } catch (error) {
      console.error('Error:', error.message);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <div className="p-8 w-full">
      <div className="title text-2xl font-medium text-gray-800 mb-6 relative">
        {isLogin ? 'Login' : 'Signup'}
        <span className="absolute left-0 bottom-0 h-1 w-6 bg-purple-400"></span>
      </div>
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
            <a href="#" className="text-purple-600 hover:underline">Forgot password?</a>
          </div>
        )}
        <div className="button input-box">
          <input
            type="submit"
            value={isLogin ? 'Login' : 'Signup'}
            className="w-full h-12 bg-purple-600 text-white rounded-md cursor-pointer hover:bg-purple-700 transition duration-300"
          />
        </div>
        <div className="text sign-up-text text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="text-purple-600 cursor-pointer hover:underline"
            onClick={toggleForm}
          >
            {isLogin ? 'Signup now' : 'Login now'}
          </button>
        </div>
      </form>
      <div className="social-icons flex justify-center mt-6 space-x-4">
        <a href="#" className="w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded-full hover:bg-purple-700 transition duration-300">
          <FontAwesomeIcon icon={faFacebookF} />
        </a>
        <a href="#" className="w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded-full hover:bg-purple-700 transition duration-300">
          <FontAwesomeIcon icon={faTwitter} />
        </a>
        <a href="#" className="w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded-full hover:bg-purple-700 transition duration-300">
          <FontAwesomeIcon icon={faGoogle} />
        </a>
        <a href="#" className="w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded-full hover:bg-purple-700 transition duration-300">
          <FontAwesomeIcon icon={faLinkedinIn} />
        </a>
      </div>
    </div>
  );
};

export default AuthForm;
