import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../BottomNav';

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-blue-400 text-white px-4 py-4 flex items-center justify-between">
        <button className="text-white text-2xl font-bold" onClick={() => navigate(-1)}>&#8592;</button>
        <div className="font-semibold text-lg">Profile</div>
        <div className="flex gap-3">
          <button className="text-white text-xl">&#128276;</button>
          <button className="text-white text-xl">&#9825;</button>
        </div>
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col items-center mt-8 mb-4">
        <div className="w-24 h-24 rounded-full bg-yellow-200 flex items-center justify-center overflow-hidden relative">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Profile"
            className="w-full h-full object-cover"
            style={{ filter: 'blur(0.5px) grayscale(0.2)' }}
          />
          <button className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11.293-11.293a1 1 0 0 0 0-1.414l-3.586-3.586a1 1 0 0 0-1.414 0L3 15v6z"/></svg>
          </button>
        </div>
      </div>

      {/* Profile Details */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 mb-6">
        <div className="font-semibold text-gray-700 mb-4">Profile details</div>
        <div className="flex flex-col gap-3">
          <button className="flex items-center justify-between py-2 border-b">
            <span className="flex items-center gap-2 text-gray-700">
              <span className="text-xl">&#128100;</span> Edit Profile
            </span>
            <span className="text-gray-400">&gt;</span>
          </button>
          <button className="flex items-center justify-between py-2 border-b">
            <span className="flex items-center gap-2 text-gray-700">
              <span className="text-xl">&#128205;</span> Saved locations
            </span>
            <span className="text-gray-400">&gt;</span>
          </button>
          <button className="flex items-center justify-between py-2 border-b">
            <span className="flex items-center gap-2 text-gray-700">
              <span className="text-xl">&#128179;</span> Bookings
            </span>
            <span className="text-gray-400">&gt;</span>
          </button>
          <button className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-gray-700">
              <span className="text-xl">&#9881;</span> More
            </span>
            <span className="text-gray-400">&gt;</span>
          </button>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Profile;