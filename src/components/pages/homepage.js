import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-600">Welcome to RouteSync</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-600">
            Logged in as: {localStorage.getItem('userEmail')}
          </p>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Your Dashboard</h2>
            <p className="text-gray-600">
              This is a sample homepage. You can start adding your content here.
            </p>
            <button
              onClick={() => navigate('/livet_track')}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
            >
              Show Bus Status Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
