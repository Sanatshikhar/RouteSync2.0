import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useGeolocation from "../../hooks/useGeolocation";
import Map from "../Map";
import moBusService from "../../services/moBusService";

const LivetTrack = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus: passedBus, from, to } = location.state || {};

  // Debug log to see what data is passed
  useEffect(() => {
    console.log("LivetTrack received data:", { passedBus, from, to });
  }, [passedBus, from, to]);

  const [tab, setTab] = useState("Live status");
  const { location: userLocation } = useGeolocation();
  const [allBusStops, setAllBusStops] = useState([]);
  const [nearbyRoutes, setNearbyRoutes] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentBus, setCurrentBus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [busStopsTimeline, setBusStopsTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-refresh bus data every 30 seconds when online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      if (currentBus && selectedRoute) {
        // Small random updates to make it feel live
        setCurrentBus((prev) => ({
          ...prev,
          crowdStatus: Math.max(
            20,
            Math.min(100, prev.crowdStatus + (Math.random() * 10 - 5))
          ),
          eta: new Date(
            Date.now() + Math.random() * 20 * 60000
          ).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline, currentBus, selectedRoute]);

  // Load all bus stops and initialize with real bus data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const stops = moBusService.getAllStops();
        setAllBusStops(stops);

        // Use passed bus data if available, otherwise generate demo data
        if (passedBus) {
          console.log("Using passed bus data:", passedBus);

          // Find the route for this bus
          let busRoute = null;
          if (passedBus.stops && passedBus.stops.length > 0) {
            // Use the stops from the passed bus
            busRoute = {
              route_id: passedBus.route_id,
              color: passedBus.route_color || "#3B82F6",
              stops: passedBus.stops,
            };
          } else {
            // Try to find route from moBusService
            const routes = moBusService.getAllRoutes();
            busRoute =
              routes.find((r) => r.route_id === passedBus.route_id) ||
              routes[0];
          }

          setSelectedRoute(busRoute);

          // Create bus data from passed information
          const currentBusData = {
            number: passedBus.bus_number || passedBus.id,
            route: `${from || passedBus.from_stop || busRoute.stops[0]} → ${
              to ||
              passedBus.to_stop ||
              busRoute.stops[busRoute.stops.length - 1]
            }`,
            routeId: passedBus.route_id,
            color: passedBus.route_color || busRoute.color,
            crowdStatus:
              passedBus.current_capacity || Math.floor(Math.random() * 80) + 20,
            nextStop: busRoute.stops[Math.floor(busRoute.stops.length / 3)],
            eta:
              passedBus.arrival_time ||
              new Date(
                Date.now() + Math.random() * 20 * 60000
              ).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            status:
              passedBus.status || (Math.random() > 0.7 ? "Delayed" : "On Time"),
            distance:
              passedBus.distance || `${Math.floor(Math.random() * 8) + 2} km`,
            fare: passedBus.fare_amount || Math.floor(Math.random() * 25) + 10,
            currentStopIndex: Math.floor(busRoute.stops.length / 3),
            category: passedBus.category || "Non-AC",
            departure_time: passedBus.departure_time,
            duration: passedBus.duration,
          };

          setCurrentBus(currentBusData);

          // Generate realistic timeline based on actual route
          generateBusTimeline(busRoute, currentBusData.currentStopIndex);
        } else {
          // Fallback to demo data if no bus passed
          console.log("No bus data passed, using demo data");
          const routes = moBusService.getAllRoutes();
          const randomRoute = routes[Math.floor(Math.random() * routes.length)];
          setSelectedRoute(randomRoute);

          const currentBusData = {
            number: `OD-${Math.floor(Math.random() * 9000) + 1000}`,
            route: `${randomRoute.stops[0]} → ${
              randomRoute.stops[randomRoute.stops.length - 1]
            }`,
            routeId: randomRoute.route_id,
            color: randomRoute.color,
            crowdStatus: Math.floor(Math.random() * 80) + 20,
            nextStop:
              randomRoute.stops[Math.floor(randomRoute.stops.length / 3)],
            eta: new Date(
              Date.now() + Math.random() * 20 * 60000
            ).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: Math.random() > 0.7 ? "Delayed" : "On Time",
            distance: `${Math.floor(Math.random() * 8) + 2} km`,
            fare: Math.floor(Math.random() * 25) + 10,
            currentStopIndex: Math.floor(randomRoute.stops.length / 3),
          };

          setCurrentBus(currentBusData);
          generateBusTimeline(randomRoute, currentBusData.currentStopIndex);
        }
      } catch (error) {
        console.error("Error initializing bus data:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [passedBus, from, to]);

  // Generate realistic bus timeline with real stops
  const generateBusTimeline = (route, currentStopIndex) => {
    const timeline = route.stops.map((stop, index) => {
      const baseTime = new Date();
      baseTime.setMinutes(baseTime.getMinutes() + index * 3); // 3 minutes per stop

      let status = "upcoming";
      let actualTime = null;

      if (index < currentStopIndex) {
        status = "completed";
        actualTime = new Date(
          baseTime.getTime() + (Math.random() * 4 - 2) * 60000
        ); // ±2 minutes variation
      } else if (index === currentStopIndex) {
        status = "current";
      }

      const stopCoords = moBusService.getStopDetails(stop).coordinates;
      const distance = stopCoords
        ? `${(index * 1.5 + Math.random() * 2).toFixed(1)} km`
        : `${index * 2} km`;

      return {
        name: stop,
        time: baseTime.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        actualTime: actualTime
          ? actualTime.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
        distance: distance,
        status: status,
        coordinates: stopCoords,
      };
    });

    setBusStopsTimeline(timeline);
  };

  // Find nearby routes when user location is available
  useEffect(() => {
    if (userLocation && allBusStops.length > 0) {
      const nearby = allBusStops
        .map((stop) => ({
          ...stop,
          distance: moBusService.calculateDistance(
            userLocation.lat,
            userLocation.lng,
            stop.coordinates.lat,
            stop.coordinates.lng
          ),
        }))
        .filter((stop) => stop.distance <= 2) // Within 2km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);

      setNearbyRoutes(nearby);
    }
  }, [userLocation, allBusStops]);

  // Calculate map center based on current bus route or user location
  const mapCenter = useMemo(() => {
    if (currentBus && busStopsTimeline.length > 0) {
      const currentStop = busStopsTimeline.find(
        (stop) => stop.status === "current"
      );
      if (currentStop && currentStop.coordinates) {
        return [currentStop.coordinates.lat, currentStop.coordinates.lng];
      }
    }
    if (userLocation) {
      return [userLocation.lat, userLocation.lng];
    }
    return [20.295, 85.826]; // Default center (Bhubaneswar)
  }, [currentBus, busStopsTimeline, userLocation]);

  // Create mock bus data for map display
  const mockBusForMap = useMemo(() => {
    if (!currentBus || !busStopsTimeline.length) return [];

    const currentStop = busStopsTimeline.find(
      (stop) => stop.status === "current"
    );
    if (!currentStop || !currentStop.coordinates) return [];

    return [
      {
        id: currentBus.number,
        bus_number: currentBus.number,
        route_from: selectedRoute?.stops[0] || "Unknown",
        route_to:
          selectedRoute?.stops[selectedRoute.stops.length - 1] || "Unknown",
        last_known_lat: currentStop.coordinates.lat,
        last_known_lng: currentStop.coordinates.lng,
        status: currentBus.status,
        current_capacity: Math.floor((currentBus.crowdStatus / 100) * 50),
        max_capacity: 50,
        last_location_update: new Date().toISOString(),
      },
    ];
  }, [currentBus, busStopsTimeline, selectedRoute]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-blue-500";
      case "current":
        return "bg-blue-600";
      case "upcoming":
        return "bg-gray-300";
      default:
        return "bg-gray-300";
    }
  };

  // Refresh bus data
  const refreshBusData = () => {
    if (selectedRoute && currentBus) {
      // Simulate bus movement
      const newStopIndex = Math.min(
        currentBus.currentStopIndex + 1,
        selectedRoute.stops.length - 1
      );
      const updatedBus = {
        ...currentBus,
        currentStopIndex: newStopIndex,
        crowdStatus: Math.max(
          20,
          currentBus.crowdStatus + (Math.random() * 20 - 10)
        ), // Fluctuate crowd
        eta: new Date(
          Date.now() + Math.random() * 15 * 60000
        ).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };
      setCurrentBus(updatedBus);
      generateBusTimeline(selectedRoute, newStopIndex);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bus information...</p>
        </div>
      </div>
    );
  }

  if (!currentBus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Bus Data Available
          </h3>
          <p className="text-gray-600 mb-4">
            Please select a bus from the bus list to track.
          </p>
          <button
            onClick={() => navigate("/search-bus")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search Buses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Responsive Design */}
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-4 rounded-b-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="text-white hover:bg-blue-700 p-1 rounded"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold">Bus Status</h1>
                <p className="text-sm opacity-90">{currentBus.route}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Online/Offline Indicator */}
              <div
                className={`w-3 h-3 rounded-full ${
                  isOnline ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              <button
                onClick={refreshBusData}
                className="text-white hover:bg-blue-700 p-1 rounded"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Connection Status */}
          <div className="text-xs opacity-75">
            {isOnline ? "🟢 Live Data" : "🔴 Offline Mode"}
          </div>
        </div>

        {/* Map/Timeline Content */}
        {tab === "Live status" ? (
          <div className="px-4 -mt-4">
            {/* Map Section */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <div className="relative h-48 bg-gray-100 rounded-xl overflow-hidden mb-4">
                <Map
                  center={mapCenter}
                  zoom={14}
                  height={192}
                  buses={mockBusForMap}
                  userLocation={userLocation}
                  busStops={allBusStops.map((stop) => ({
                    id: stop.name,
                    name: stop.name,
                    lat: stop.coordinates.lat,
                    lng: stop.coordinates.lng,
                    type: stop.coordinates.type,
                    routes: stop.routes,
                  }))}
                  className="w-full rounded-xl"
                />
              </div>

              {/* Bus Info Card */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-gray-800">
                      {currentBus.number}
                    </span>
                    {currentBus.departure_time && (
                      <div className="text-xs text-gray-500">
                        Departed: {currentBus.departure_time}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                        />
                      </svg>
                    </button>
                    <button className="text-red-400">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="text-sm text-gray-600">
                    {currentBus.category || "Ordinary"}
                  </div>
                  {currentBus.routeId && (
                    <>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: currentBus.color || "#3B82F6",
                          }}
                        ></div>
                        <span className="text-sm text-gray-600">
                          Route {currentBus.routeId}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Crowd Status */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold text-green-600">
                      {currentBus.crowdStatus}%
                    </span>
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
                    <div
                      className={`font-semibold ${
                        currentBus.status === "On Time"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {currentBus.status}
                    </div>
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
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(
                          stop.status
                        )} ${stop.status === "current" ? "animate-pulse" : ""}`}
                      ></div>
                      {index < busStopsTimeline.length - 1 && (
                        <div
                          className={`w-0.5 h-8 ${
                            stop.status === "completed"
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">
                            {stop.time}
                          </div>
                          {stop.actualTime && (
                            <div className="text-xs text-red-500">
                              {stop.actualTime}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 ml-4">
                          <div
                            className={`font-medium ${
                              stop.status === "current"
                                ? "text-blue-800"
                                : "text-gray-800"
                            }`}
                          >
                            {stop.name}
                            {stop.status === "current" && (
                              <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stop.distance}
                          </div>
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
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">{currentBus.route}</div>
              <div className="text-2xl font-bold text-gray-800">
                ₹ {currentBus.fare}
              </div>
            </div>
            {currentBus.duration && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Journey Duration: {currentBus.duration}</span>
                <span>Distance: {currentBus.distance}</span>
              </div>
            )}
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
