import React, { useState } from "react";
import AuthForm from "./authform";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 via-indigo-50 to-white">
      <div className="container relative max-w-[850px] w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex">
          <div className="w-1/2">
            <AuthForm isLogin={isLogin} toggleForm={toggleForm} />
          </div>
          <div className="w-1/2 relative overflow-hidden">
            {/* Adding perspective to the container */}
            <div
              className="cover w-full h-full transition-transform duration-1000"
              style={{
                perspective: "1000px", // Perspective gives the 3D effect
              }}
            >
              {/* Flip container with transition for rotation */}
              <div
                className={`flip-container w-full h-full ${
                  isLogin ? "" : "rotate-y-180"
                }`}
                style={{
                  transformStyle: "preserve-3d", // Ensure children maintain 3D positions
                  transform: isLogin ? "rotateY(0deg)" : "rotateY(180deg)", // Rotate depending on state
                  transition: "transform 1s", // Smooth transition for the flip
                }}
              >
                {/* Front side of the card */}
                <div
                  className="front w-full h-full absolute top-0 left-0 bg-cover bg-center"
                  style={{
                    backfaceVisibility: "hidden", // Hide the back side when rotating
                  }}
                >
                  <img
                    src="/images/frontImg.jpg"
                    alt="Front"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                  <div className="text absolute inset-0 flex flex-col items-center justify-center text-white text-center bg-purple-600 bg-opacity-50">
                    <span className="text-1 text-2xl font-semibold">
                      Every new friend is a<br />
                      new adventure
                    </span>
                    <span className="text-2 text-sm mt-2">
                      Let's get connected
                    </span>
                  </div>
                </div>

                {/* Back side of the card */}
                <div
                  className="back w-full h-full absolute top-0 left-0 bg-cover bg-center"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)", // Rotate the back side by 180deg
                  }}
                >
                  <img
                    src="/images/backImg.jpg"
                    alt="Back"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                  <div className="text absolute inset-0 flex flex-col items-center justify-center text-white text-center bg-purple-600 bg-opacity-50">
                    <span className="text-1 text-2xl font-semibold">
                      Complete miles of journey
                      <br />
                      with one step
                    </span>
                    <span className="text-2 text-sm mt-2">
                      Let's get started
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
