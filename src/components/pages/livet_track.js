import React, { useState, useMemo } from 'react';
import useLiveBuses from '../../hooks/useLiveBuses';
import useGeolocation from '../../hooks/useGeolocation';
import Map from '../Map';

const LivetTrack = () => {
  const [tab, setTab] = useState('Live status');
  const { buses, loading, error } = useLiveBuses();
  const { location: userLocation } = useGeolocation();

  // For demo, show first bus details
  const bus = buses[0];

  // Calculate map center based on bus location, user location, or default
  const mapCenter = useMemo(() => {
    if (bus?.last_known_lat && bus?.last_known_lng) {
      return [bus.last_known_lat, bus.last_known_lng];
    }
    if (userLocation) {
      return [userLocation.lat, userLocation.lng];
    }
    return [20.295, 85.826]; // Default center (Bhubaneswar)
  }, [bus, userLocation]);

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="text-white text-2xl font-bold">&#8592;</button>
          <div>
            <div className="font-semibold text-lg">Bus Status</div>
            <div className="text-xs opacity-80">{bus?.route_id || 'Route info'}</div>
          </div>
        </div>
        <button className="text-white text-xl">&#8942;</button>
      </div>

      {/* Map Section */}
      {tab === 'Live status' && (
        <div className="bg-white flex flex-col items-center justify-center" style={{ height: 220, position: 'relative' }}>
          {/* OpenStreetMap with bus markers */}
          <Map 
            center={mapCenter}
            zoom={14}
            height={220}
            buses={buses}
            userLocation={userLocation}
            className="w-full rounded-b-2xl overflow-hidden"
          />
          {/* Bus Card Overlay */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-[90%] bg-white rounded-xl shadow-lg p-4">
            {loading && <div>Loading bus info...</div>}
            {error && <div className="text-red-500">Error loading bus info</div>}
            {bus && (
              <>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-semibold text-base">{bus.bus_number}</div>
                  <button className="text-gray-400 text-xl">&#9825;</button>
                </div>
                <div className="text-xs text-gray-500 mb-1">{bus.Category}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600 font-bold text-lg">{bus.current_capacity}</span>
                  <span className="text-xs text-gray-400">Crowd status</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded mx-2">
                    <div className="h-2 bg-green-500 rounded" style={{ width: `${(bus.current_capacity / bus.max_capacity) * 100}%` }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-gray-500">Arrives at</div>
                    <div className="font-semibold">{bus.last_location_update ? new Date(bus.last_location_update).toLocaleTimeString() : '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Status</div>
                    <div className="font-semibold text-red-500">{bus.status}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Capacity</div>
                    <div className="font-semibold">{bus.current_capacity}/{bus.max_capacity}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white border-b">
        {['Live status', 'Bus details'].map((t) => (
          <button
            key={t}
            className={`flex-1 py-2 text-center font-semibold ${tab === t ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500'}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {tab === 'Live status' ? (
          <div className="p-4">
            {/* Next Stop - Placeholder */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-blue-600 text-lg font-bold">08:15 am</span>
              </div>
              <div>
                <div className="font-semibold">Next Stop</div>
                <div className="text-xs text-gray-400">1 Km</div>
              </div>
              <div className="ml-auto text-xs text-red-500">08:25 am</div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {/* Timeline - Placeholder */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200" style={{ zIndex: 0 }}></div>
              <div className="flex items-start mb-4 relative" style={{ zIndex: 1 }}>
                <div className="flex flex-col items-center mr-4" style={{ width: 32 }}>
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-blue-600">&#128652;</span>
                  </div>
                </div>
                <div>
                  <div className="flex gap-2 items-baseline">
                    <span className="text-xs text-gray-400">08:50 am</span>
                    <span className="font-semibold text-sm ml-2">Stop Name</span>
                  </div>
                  <div className="text-xs text-gray-400 ml-2">Distance</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t">
        <div className="text-xs text-gray-500">Route info</div>
        <div className="font-bold text-lg">₹ {bus?.fare_amount || '-'}</div>
      </div>
      <div className="bg-white px-4 py-2 flex gap-3 border-t">
        <button className="flex-1 py-2 rounded-lg border border-blue-600 text-blue-600 font-semibold">Alarm</button>
        <button className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold">Pay the fare</button>
      </div>
    </div>
  );
};

export default LivetTrack;
