import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import pb from '../../services/pocketbase';
pb.autoCancellation(false);

const ListBus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { from, to, date } = location.state || {};

  useEffect(() => {
    const fetchBuses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await pb.collection('buses').getFullList({
          expand: 'route_id'
        });

        let allBuses = response.items || [];

        if (from || to || date) {
          allBuses = allBuses.filter(bus => {
            const route = bus.expand?.route_id;
            if (!route) return false;

            const fromMatch = !from || route.from?.toLowerCase().includes(from.toLowerCase());
            const toMatch = !to || route.to?.toLowerCase().includes(to.toLowerCase());
            const dateMatch = !date || route.date === date;

            return fromMatch && toMatch && dateMatch;
          });
        }

        setBuses(response);
      } catch (err) {
        console.error('Error fetching buses:', err);
        setError('Failed to load buses. Please try again.');
        setBuses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [from, to, date]);

  const handleSelectBus = (bus) => {
    navigate('/selectSeat', { state: { bus, from, to, date } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading buses...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Available Buses</h2>
        {buses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h4 className="text-xl font-semibold text-gray-700 mb-2">No buses found</h4>
            <p className="text-gray-600 mb-4">Sorry, we couldn't find any buses for your selected route.</p>
            <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Search Again</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.map((bus) => (
              <div key={bus.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200">
                <div className="p-4">
                  {/* Header with Bus Number and Fare */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{bus.bus_number}</h4>
                      <p className="text-gray-600 text-sm">{bus.category}</p>
                    </div>
                    <span className="text-lg font-bold text-blue-600">₹{bus.fare_amount}</span>
                  </div>

                  {/* Time and Duration */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">{bus.expand?.route_id?.from || '3:20'}</div>
                      <div className="text-gray-500 text-sm">
                        {bus.departure_time || 'Jagarmara'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="mx-2 w-16 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          {bus.duration || `${Math.round(Math.random() * 60)} min`}
                        </span>
                      </div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">{bus.expand?.route_id?.to || '3:30'}</div>
                      <div className="text-gray-500 text-sm">
                        {bus.arrival_time || 'Khandgiri'}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Stats */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${Math.min(100, Math.max(0, (bus.current_capacity / bus.max_capacity) * 100))}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {Math.round((bus.current_capacity / bus.max_capacity) * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">Crowd</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-800">
                        {bus.distance ? `${bus.distance} Km` : `${Math.round(Math.random() * 10)} Km`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium ${bus.status === 'On Time' ? 'text-green-600' : 'text-red-600'}`}>
                        {bus.status === 'On Time' ? 'On Time' : `Delayed: ${bus.delay || Math.round(Math.random() * 10)} min`}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectBus(bus)}
                    className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Select Seat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListBus;