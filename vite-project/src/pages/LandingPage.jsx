import React from "react";

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <h1 className="text-5xl font-bold mb-4">Welcome to Gamete</h1>
      <p className="text-lg mb-6">
        This is a clean landing page built with React and Tailwind CSS.
      </p>
      <a
        href="#get-started"
        className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300"
      >
        Get Started
      </a>
    </div>
  );
};

export default LandingPage;
