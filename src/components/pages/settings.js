import React from 'react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const userName = 'Jayadovan';
  const userEmail = 'jayadovan@usermail.com';

  const handleSignOut = () => {
    // Add your sign out logic here
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-blue-400 text-white px-4 py-4 flex items-center justify-between">
        <button className="text-white text-2xl font-bold" onClick={() => navigate(-1)}>&#8592;</button>
        <div className="font-semibold text-lg">Settings</div>
        <button className="text-white text-xl">&#8942;</button>
      </div>

      {/* User Info */}
      <div className="w-full max-w-md flex flex-col items-center bg-white rounded-2xl shadow p-6 mt-8 mb-4">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-3">
          <span className="text-4xl text-blue-600 font-bold">{userName[0]}</span>
        </div>
        <div className="font-semibold text-lg mb-1">{userName}</div>
        <div className="text-gray-500 text-sm mb-2">{userEmail}</div>
        <button
          className="mt-2 px-6 py-2 rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition-colors"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>

      {/* Settings Options */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 flex flex-col gap-3">
        <button className="flex items-center justify-between py-2 border-b">
          <span className="flex items-center gap-2 text-gray-700">
            <span className="text-xl">&#9881;</span> Account Settings
          </span>
          <span className="text-gray-400">&gt;</span>
        </button>
        <button className="flex items-center justify-between py-2 border-b">
          <span className="flex items-center gap-2 text-gray-700">
            <span className="text-xl">&#128274;</span> Privacy
          </span>
          <span className="text-gray-400">&gt;</span>
        </button>
        <button className="flex items-center justify-between py-2 border-b">
          <span className="flex items-center gap-2 text-gray-700">
            <span className="text-xl">&#128276;</span> Notifications
          </span>
          <span className="text-gray-400">&gt;</span>
        </button>
        <button className="flex items-center justify-between py-2">
          <span className="flex items-center gap-2 text-gray-700">
            <span className="text-xl">&#128172;</span> Help & Support
          </span>
          <span className="text-gray-400">&gt;</span>
        </button>
      </div>
    </div>
  );
  ;
};

export default Settings;