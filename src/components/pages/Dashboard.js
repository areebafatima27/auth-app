import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-purple-700 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition duration-200 ease-in-out`}
      >
        <nav>
          <a
            href="#"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-600 hover:text-white"
          >
            Home
          </a>
          <a
            href="#"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-600 hover:text-white"
          >
            Profile
          </a>
          <a
            href="#"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-600 hover:text-white"
          >
            Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-white shadow-md">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 focus:outline-none focus:text-gray-700 md:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-700 ml-2">Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
          >
            Logout
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Welcome to Your Dashboard
            </h2>
            <div className="bg-white shadow-md rounded-lg p-6">
              <p className="text-gray-600">
                This is your personal dashboard. Here you can view your account information,
                manage your settings, and access various features of our application.
              </p>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Quick Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-100 p-4 rounded-lg">
                    <p className="text-purple-800 font-semibold">Total Logins</p>
                    <p className="text-2xl font-bold text-purple-600">24</p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <p className="text-blue-800 font-semibold">Active Sessions</p>
                    <p className="text-2xl font-bold text-blue-600">3</p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-lg">
                    <p className="text-green-800 font-semibold">Days Active</p>
                    <p className="text-2xl font-bold text-green-600">15</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;