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
    <div className="min-h-screen bg-blue-600">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <img 
              src={localStorage.getItem('userEmail') === 'test@test.com' ? 'https://ui-avatars.com/api/?name=Test+User' : ''}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm">Good morning</p>
              <p className="font-semibold">Jayadevan</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a5 5 0 015 5v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v2h6V7a3 3 0 00-3-3z" />
              </svg>
              <span>Kochi</span>
            </div>
            <span>29°C</span>
            <button onClick={handleLogout}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search your bus routes"
            className="w-full py-2 px-4 rounded-lg text-gray-800 bg-white"
          />
          <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Transport Options */}
        <div className="flex space-x-4 mb-4">
          <button 
            onClick={() => navigate('/list-bus')}
            className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Bus
          </button>
          <button className="text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
            Railway station
          </button>
          <button className="text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
            Metro station
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-100 rounded-t-3xl p-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-2">
              <svg className="w-6 h-6 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm">Live</span>
          </div>
          <div className="text-center">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-2">
              <svg className="w-6 h-6 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm">tracking</span>
          </div>
          <div className="text-center">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-2">
              <svg className="w-6 h-6 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <span className="text-sm">tour</span>
          </div>
        </div>

        {/* Nearby Stops */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Nearby Stops</h2>
          <div className="bg-white rounded-xl p-4 mb-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Vazhakala bus stop</h3>
                <p className="text-sm text-gray-500">Next bus in 5 mins</p>
                <p className="text-sm text-gray-500">500 mtrs</p>
              </div>
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Offers and Coupons */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Offers and Coupons</h2>
          <div className="bg-green-50 rounded-xl p-4 mb-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Save upto Rs 200 on bus tickets</h3>
                <p className="text-sm text-gray-500">Valid till 30 Dec</p>
                <button 
                  onClick={() => navigate('/list-bus')}
                  className="mt-2 bg-blue-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Book now
                </button>
              </div>
              <div className="w-24 h-16 bg-white rounded-lg shadow flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="flex justify-around">
            <button className="flex flex-col items-center text-blue-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </button>
            <button className="flex flex-col items-center text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs mt-1">Booking</span>
            </button>
            <button className="flex flex-col items-center text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs mt-1">Tickets</span>
            </button>
            <button className="flex flex-col items-center text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
