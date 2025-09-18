import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../BottomNav';

const BookingHistory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock data for bookings
  const upcomingBookings = [
    {
      id: 1,
      operator: 'KSRTC (Kerala) - 2316',
      from: 'Kochi',
      to: 'Chennai',
      departureTime: '07:30 pm',
      arrivalTime: '06:35 am',
      duration: '11h 05m',
      date: '25 Nov 2025',
      seatNo: '4C',
      status: 'confirmed'
    }
  ];

  const pastBookings = [
    {
      id: 2,
      operator: 'Kallada travels',
      from: 'Kochi',
      to: 'Chennai',
      departureTime: '08:30 pm',
      arrivalTime: '07:35 am',
      duration: '11h 05m',
      date: '15 Nov 2025',
      status: 'completed'
    },
    {
      id: 3,
      operator: 'KSRTC (Kerala) - 2318',
      from: 'Kochi',
      to: 'Bangalore',
      departureTime: '09:30 pm',
      arrivalTime: '08:35 am',
      date: '10 Nov 2025',
      status: 'cancelled',
      refundStatus: 'Refund successfully credited'
    }
  ];

  const BookingCard = ({ booking }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{booking.operator}</h3>
          <p className="text-sm text-gray-500">{booking.date}</p>
        </div>
        {booking.status === 'cancelled' && (
          <span className="text-red-500 text-sm">Ticket cancelled</span>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col">
              <span className="font-medium">{booking.departureTime}</span>
              <span className="text-sm text-gray-600">{booking.from}</span>
            </div>
            <div className="flex-1 flex items-center px-2">
              <div className="h-0.5 flex-1 bg-gray-300"></div>
              <span className="mx-2 text-xs text-gray-500">{booking.duration}</span>
              <div className="h-0.5 flex-1 bg-gray-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{booking.arrivalTime}</span>
              <span className="text-sm text-gray-600">{booking.to}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        {booking.seatNo && (
          <span className="text-sm text-gray-600">Seat: {booking.seatNo}</span>
        )}
        {booking.status === 'confirmed' && (
          <button 
            onClick={() => {/* Add view ticket functionality */}}
            className="text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            View Ticket
          </button>
        )}
        {booking.refundStatus && (
          <span className="text-green-500 text-sm">{booking.refundStatus}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
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
          <h2 className="text-lg font-semibold flex-1 text-center">Booking History</h2>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-4 rounded-full font-medium ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-full font-medium ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            History
          </button>
        </div>

        {/* Bookings List */}
        <div>
          {activeTab === 'upcoming' ? (
            upcomingBookings.length > 0 ? (
              upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No upcoming bookings
              </div>
            )
          ) : (
            pastBookings.length > 0 ? (
              pastBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No booking history found
              </div>
            )
          )}
        </div>
      </div>
      {/* Add padding at the bottom to prevent content from being hidden behind the nav */}
      <div className="pb-20"></div>
      <BottomNav />
    </div>
  );
};

export default BookingHistory;