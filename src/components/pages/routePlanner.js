import React from 'react';
import { useNavigate } from 'react-router-dom';
import AllRoutes from '../AllRoutes';
import BottomNav from '../BottomNav';

const RoutePlannerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold flex-1 text-center">All Routes</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto pb-20">
        <AllRoutes />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default RoutePlannerPage;