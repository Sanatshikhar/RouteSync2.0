import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentSystem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingDetails = location.state || {};

  const handlePayment = (paymentMethod) => {
    // Here you would handle the actual payment processing
    // For now, we'll simulate a successful payment
    navigate('/ticket', {
      state: {
        ...bookingDetails,
        paymentMethod,
        paymentStatus: 'success',
        transactionId: 'TXN' + Date.now()
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-md mx-auto flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold flex-1 text-center">Payment Method</h2>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-lg mb-2">Booking Summary</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Bus Number: {bookingDetails.selectedBus?.number}</p>
            <p>From: {bookingDetails.from}</p>
            <p>To: {bookingDetails.to}</p>
            <p>Date: {new Date(bookingDetails.date).toLocaleDateString()}</p>
            <p>Fare: ₹{bookingDetails.selectedBus?.fare}</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handlePayment('upi')}
            className="w-full bg-white p-4 rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600">₹</span>
              </div>
              <div>
                <h3 className="font-medium">UPI Payment</h3>
                <p className="text-sm text-gray-500">Pay using any UPI app</p>
              </div>
            </div>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => handlePayment('card')}
            className="w-full bg-white p-4 rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Credit/Debit Card</h3>
                <p className="text-sm text-gray-500">Pay using card</p>
              </div>
            </div>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => handlePayment('netbanking')}
            className="w-full bg-white p-4 rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Net Banking</h3>
                <p className="text-sm text-gray-500">Pay using net banking</p>
              </div>
            </div>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSystem;
