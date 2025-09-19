import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useBookingTour from '../../hooks/useBookingTour';
import { useBuses } from '../../hooks/useBuses';

const ListBus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startBookingTour } = useBookingTour();
  const { from, to, date, buses = [] } = location.state || {};

  const handleSelectBus = (bus) => {
    if (!user) {
      alert('Please login to book tickets');
      navigate('/auth');
      return;
    }

    startBookingTour();
    navigate('/selectSeat', {
      state: {
        bus,
        from,
        to,
        date
      }
    });
  };

  if (!buses || buses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h2 className="text-2xl font-semibold mb-4">No buses found</h2>
        <p className="text-gray-600 mb-4">Sorry, we couldn't find any buses for your selected route.</p>
        <button
          onClick={() => navigate('/searchBus')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Search Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-4">Available Buses</h2>
      <div className="mb-4">
        <p className="text-gray-600">
          {from} → {to} | {new Date(date).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-4">
        {buses.map((bus) => (
          <div
            key={bus.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{bus.bus_number}</h3>
              <span className="text-blue-600 font-semibold">
                ₹{bus.fare_amount}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium">{bus.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Service Type</p>
                <p className="font-medium">{bus.service_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Seats</p>
                <p className="font-medium">
                  {bus.max_capacity - bus.current_capacity}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`font-medium ${
                  bus.status === 'On Time' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {bus.status}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSelectBus(bus)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Select Seats
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListBus;
