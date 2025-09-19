import { useState, useMemo, useEffect } from 'react';
import useLiveBuses from '../../hooks/useLiveBuses';
import useGeolocation from '../../hooks/useGeolocation';
import Map from '../Map';
import moBusService from '../../services/moBusService';

const LivetTrack = () => {
  const [tab, setTab] = useState('Live status');
  const { buses, loading, error } = useLiveBuses();
  const { location: userLocation } = useGeolocation();
  const [allBusStops, setAllBusStops] = useState([]);
  const [nearbyRoutes, setNearbyRoutes] = useState([]);
  const [currentBus, setCurrentBus] = useState({
    number: "KL-58-B-0271",
    route: "Pipeline Jn → Kaloor",
    crowdStatus: 25,
    nextStop: "Lakkipady",
    eta: "09:18 am",
    delay: "Delayed",
    distance: "4 km",
    fare: 15,
  });

  // For demo, show first bus details
  const bus = buses[0];

  // Load all bus stops
  useEffect(() => {
    const stops = moBusService.getAllStops();
    setAllBusStops(stops);
  }, []);

  // Use real bus data if available
  useEffect(() => {
    if (buses && buses.length > 0) {
      const bus = buses[0];
      setCurrentBus({
        number: bus.bus_number || "KL-58-B-0271",
        route: `${bus.route_from || "Pipeline Jn"} → ${bus.route_to || "Kaloor"}`,
        crowdStatus: Math.round((bus.current_capacity / bus.max_capacity) * 100) || 25,
        nextStop: "Lakkipady",
        eta: bus.last_location_update ? new Date(bus.last_location_update).toLocaleTimeString() : "09:18 am",
        delay: bus.status || "Delayed",
        distance: "4 km",
        fare: bus.fare_amount || 15,
      });
    }
  }, [buses]);

  // Find nearby routes when user location is available
  useEffect(() => {
    if (userLocation && allBusStops.length > 0) {
      const nearby = allBusStops
        .map(stop => ({
          ...stop,
          distance: moBusService.calculateDistance(
            userLocation.lat, userLocation.lng,
            stop.coordinates.lat, stop.coordinates.lng
          )
        }))
        .filter(stop => stop.distance <= 2) // Within 2km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);
      
      setNearbyRoutes(nearby);
    }
  }, [userLocation, allBusStops]);

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

  // Generate sample bus stops timeline
  const busStopsTimeline = [
    { name: "Company Pady", time: "08:50", actualTime: "08:55", distance: "8 Km", status: "completed" },
    { name: "Kakkanad Stand", time: "09:10", actualTime: "09:14", distance: "12 Km", status: "completed" },
    { name: "Padamugal", time: "09:30", actualTime: "09:35", distance: "13.6 Km", status: "completed" },
    { name: "Colony Jn", time: "09:56", actualTime: "10:00", distance: "14.5 Km", status: "current" },
    { name: "Vazhakkala Bus stop", time: "10:00", actualTime: null, distance: "15.6 Km", status: "upcoming" },
    { name: "Chembumukku", time: "10:06", actualTime: null, distance: "17 Km", status: "upcoming" },
    { name: "Pipeline Jn", time: "10:10", actualTime: null, distance: "18 Km", status: "upcoming" },
    { name: "Palarivattom Jn", time: "10:16", actualTime: null, distance: "19 Km", status: "upcoming" },
    { name: "Janatha Junction", time: "10:20", actualTime: null, distance: "20 Km", status: "upcoming" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-blue-500";
      case "current": return "bg-blue-600";
      case "upcoming": return "bg-gray-300";
      default: return "bg-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Responsive Design */}
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-4 rounded-b-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button className="text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold">Bus Status</h1>
                <p className="text-sm opacity-90">{currentBus.route}</p>
              </div>
            </div>
            <button className="text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Map/Timeline Content */}
        {tab === 'Live status' ? (
          <div className="px-4 -mt-4">
            {/* Map Section */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <div className="relative h-48 bg-gray-100 rounded-xl overflow-hidden mb-4">
                <Map 
                  center={mapCenter}
                  zoom={14}
                  height={192}
                  buses={buses}
                  userLocation={userLocation}
                  busStops={allBusStops.map(stop => ({
                    id: stop.name,
                    name: stop.name,
                    lat: stop.coordinates.lat,
                    lng: stop.coordinates.lng,
                    type: stop.coordinates.type,
                    routes: stop.routes
                  }))}
                  className="w-full rounded-xl"
                />
              </div>

              {/* Bus Info Card */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">{currentBus.number}</span>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                    <button className="text-red-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">Ordinary</div>

                {/* Crowd Status */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold text-green-600">{currentBus.crowdStatus}%</span>
                    <span className="text-sm text-gray-500">Crowd status</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentBus.crowdStatus}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="text-center">
                    <div className="text-gray-500">Arrives at</div>
                    <div className="font-semibold">{currentBus.eta}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Status</div>
                    <div className="font-semibold text-red-500">{currentBus.delay}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Next distance</div>
                    <div className="font-semibold">{currentBus.distance}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 -mt-4">
            {/* Bus Timeline */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="space-y-4">
                {busStopsTimeline.map((stop, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(stop.status)} ${stop.status === 'current' ? 'animate-pulse' : ''}`}></div>
                      {index < busStopsTimeline.length - 1 && (
                        <div className={`w-0.5 h-8 ${stop.status === 'completed' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">{stop.time}</div>
                          {stop.actualTime && (
                            <div className="text-xs text-red-500">{stop.actualTime}</div>
                          )}
                        </div>
                        <div className="flex-1 ml-4">
                          <div className={`font-medium ${stop.status === 'current' ? 'text-blue-800' : 'text-gray-800'}`}>
                            {stop.name}
                            {stop.status === 'current' && (
                              <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{stop.distance}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white mx-4 rounded-xl mt-4 p-1 shadow-sm">
          {["Live status", "Bus details"].map((tabName) => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                tab === tabName
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tabName}
            </button>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="px-4 mt-6 pb-6">
          {/* Route and Fare */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-gray-600">{currentBus.route}</div>
              <div className="text-2xl font-bold text-gray-800">₹ {currentBus.fare}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-2xl hover:bg-blue-50 transition-colors">
              Alarm
            </button>
            <button className="flex-1 py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors">
              Pay the fare
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivetTrack;
