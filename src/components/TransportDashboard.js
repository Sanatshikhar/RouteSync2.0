import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import pb from '../services/pocketbase';

// pb is imported from pocketbase.js

const TransportDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If not authenticated as transporter, redirect to TransportAuthPage
    if (!pb.authStore.isValid || pb.authStore.model?.collectionName !== 'transporter') {
      navigate('/transport-auth', { state: { from: location } });
    }
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-green-700">Transport Authority Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2">Monitor Bus Operations</h2>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => navigate('/transport/buses')}
            >
              View Buses
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2">Live Status</h2>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => navigate('/live-tracking')}
            >
              Live Tracking
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2">Compliance & Reports</h2>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => navigate('/transport/reports')}
            >
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportDashboard;
