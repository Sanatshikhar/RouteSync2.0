import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Ticket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketDetails = location.state || {};
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleDownloadTicket = () => {
    setIsDownloaded(true);
    // Here you would implement actual ticket download functionality
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-md mx-auto flex items-center">
          <button 
            onClick={() => navigate('/homepage')}
            className="p-2 -ml-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold flex-1 text-center">Ticket Details</h2>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Success Message */}
          <div className="bg-green-50 p-4 flex items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-green-800">Payment Successful!</h3>
              <p className="text-sm text-green-600">Transaction ID: {ticketDetails.transactionId}</p>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Bus Details</h3>
                <p className="mt-1">{ticketDetails.selectedBus?.number} ({ticketDetails.selectedBus?.type})</p>
              </div>

              <div className="flex justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">From</h3>
                  <p className="mt-1">{ticketDetails.from}</p>
                  <p className="text-sm text-gray-500">{ticketDetails.boardingPoint?.time}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">To</h3>
                  <p className="mt-1">{ticketDetails.to}</p>
                  <p className="text-sm text-gray-500">{ticketDetails.droppingPoint?.time}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Date of Journey</h3>
                <p className="mt-1">{new Date(ticketDetails.date).toLocaleDateString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Fare Details</h3>
                <p className="mt-1">₹{ticketDetails.selectedBus?.fare}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                <p className="mt-1 capitalize">{ticketDetails.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t">
            <button
              onClick={handleDownloadTicket}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {isDownloaded ? 'Downloaded' : 'Download Ticket'}
            </button>
            
            <button
              onClick={() => navigate('/homepage')}
              className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
