import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useGeolocation from "../../hooks/useGeolocation";
import Map from "../Map";
import dbService from "../../services/dbService";
import routingService from "../../services/routingService";
import pb from "../../services/pocketbase";
import BottomNav from "../BottomNav";

const LivetTrack = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus: passedBus, from, to, route: passedRoute } = location.state || {};

  // Debug log to see what data is passed
  useEffect(() => {
    console.log("LivetTrack received data:", { passedBus, from, to, passedRoute });
  }, [passedBus, from, to, passedRoute]);

  const [tab, setTab] = useState("Live status");
  const { location: userLocation } = useGeolocation();
  const [allBusStops, setAllBusStops] = useState([]);
  const [nearbyRoutes, setNearbyRoutes] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentBus, setCurrentBus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [busStopsTimeline, setBusStopsTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routeData, setRouteData] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [routeBounds, setRouteBounds] = useState(null);

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
          eta: new Date(
            Date.now() + Math.random() * 20 * 60000
          ).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline, currentBus, selectedRoute]);

  // Calculate route when from/to locations are provided
  useEffect(() => {
    const calculateRoute = async () => {
      if (from && to) {
        try {
          console.log('Calculating route from', from, 'to', to);
          
          // Get coordinates for from/to locations from PocketBase
          let fromStopData = null;
          let toStopData = null;
          
          const fromCoords = await dbService.getStopCoordinates(from);
          const toCoords = await dbService.getStopCoordinates(to);
          
          if (fromCoords) {
            fromStopData = { coordinates: fromCoords };
          }
          
          if (toCoords) {
            toStopData = { coordinates: toCoords };
          }
          
          if (fromStopData?.coordinates && toStopData?.coordinates) {
            const startCoords = {
              lat: fromStopData.coordinates.lat,
              lng: fromStopData.coordinates.lng,
              name: from
            };
            const endCoords = {
              lat: toStopData.coordinates.lat,
              lng: toStopData.coordinates.lng,
              name: to
            };
            
            setStartLocation(startCoords);
            setEndLocation(endCoords);
            
            // Get route from routing service
            const route = await routingService.getRoute(startCoords, endCoords);
            setRouteData(route);
            
            // Calculate bounds for auto-zoom
            if (route && route.coordinates && route.coordinates.length > 1) {
              const bounds = calculateRouteBounds(route.coordinates);
              setRouteBounds(bounds);
            }
            
            console.log('Route calculated:', route);
          }
        } catch (error) {
          console.error('Error calculating route:', error);
        }
      }
    };
    
    calculateRoute();
  }, [from, to]);
  
  // Calculate route bounds for auto-zoom
  const calculateRouteBounds = (coordinates) => {
    if (!coordinates || coordinates.length === 0) return null;
    
    let minLat = coordinates[0][0];
    let maxLat = coordinates[0][0];
    let minLng = coordinates[0][1];
    let maxLng = coordinates[0][1];
    
    coordinates.forEach(([lat, lng]) => {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });
    
    return [[minLat, minLng], [maxLat, maxLng]];
  };

  // Load all bus stops and initialize with real bus data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Try to get bus stops from database first
        let stops = [];
        try {
          const routesResponse = await pb.collection('routes').getFullList();
          const stopSet = new Set();
          routesResponse.forEach(route => {
            if (route.start_point) stopSet.add(route.start_point);
            if (route.end_point) stopSet.add(route.end_point);
          });
          
          stops = [];
          for (const stopName of Array.from(stopSet)) {
            const coordinates = await dbService.getStopCoordinates(stopName);
            stops.push({
              name: stopName,
              coordinates,
              routes: []
            });
          }
          console.log(`Loaded ${stops.length} bus stops from database`);
        } catch (dbError) {
          console.log('Database not available, using fallback stops:', dbError.message);
          stops = [];
        }
        
        setAllBusStops(stops);

        // Use passed bus data if available, otherwise generate demo data
        if (passedBus) {
          console.log("Using passed bus data:", passedBus);

          // Find the route for this bus from database first
          let busRoute = null;
          try {
            if (passedBus.route_id) {
              const routeResponse = await pb.collection('routes').getFirstListItem(
                `name ~ "${passedBus.route_id}"`
              );
              
              let routeStops = [];
              if (typeof routeResponse.stops === 'string') {
                try {
                  routeStops = JSON.parse(routeResponse.stops);
                } catch (e) {
                  routeStops = routeResponse.stops.split(',').map(s => s.trim());
                }
              } else if (Array.isArray(routeResponse.stops)) {
                routeStops = routeResponse.stops;
              }
              
              busRoute = {
                route_id: routeResponse.name || routeResponse.id,
                color: "#3B82F6",
                stops: routeStops,
                name: routeResponse.name
              };
              console.log('Found route from database:', busRoute);
            }
          } catch (dbError) {
            console.log('Route not found in database, using fallback:', dbError.message);
          }
          
          // Fallback to local data or passed bus data
          if (!busRoute) {
            if (passedBus.stops && passedBus.stops.length > 0) {
              busRoute = {
                route_id: passedBus.route_id,
                color: passedBus.route_color || "#3B82F6",
                stops: passedBus.stops,
              };
            } else {
              busRoute = {
                route_id: passedBus.route_id,
                color: passedBus.route_color || "#3B82F6",
                stops: passedBus.stops || [from || 'Start', to || 'End'],
              };
            }
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
          await generateBusTimeline(busRoute, currentBusData.currentStopIndex);
        } else {
          // Fallback to demo data if no bus passed
          console.log("No bus data passed, using demo data");
          const demoRoute = {
            route_id: 'DEMO-01',
            color: '#3B82F6',
            stops: ['Demo Start', 'Demo Middle', 'Demo End']
          };
          setSelectedRoute(demoRoute);

          const currentBusData = {
            number: `OD-${Math.floor(Math.random() * 9000) + 1000}`,
            route: `${demoRoute.stops[0]} → ${
              demoRoute.stops[demoRoute.stops.length - 1]
            }`,
            routeId: demoRoute.route_id,
            color: demoRoute.color,

            nextStop:
              demoRoute.stops[Math.floor(demoRoute.stops.length / 3)],
            eta: new Date(
              Date.now() + Math.random() * 20 * 60000
            ).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: Math.random() > 0.7 ? "Delayed" : "On Time",
            distance: `${Math.floor(Math.random() * 8) + 2} km`,
            fare: Math.floor(Math.random() * 25) + 10,
            currentStopIndex: Math.floor(demoRoute.stops.length / 3),
          };

          setCurrentBus(currentBusData);
          await generateBusTimeline(demoRoute, currentBusData.currentStopIndex);
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
  const generateBusTimeline = async (route, currentStopIndex) => {
    const timeline = [];
    for (let index = 0; index < route.stops.length; index++) {
      const stop = route.stops[index];
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

      const stopCoords = await dbService.getStopCoordinates(stop);
      const distance = stopCoords
        ? `${(index * 1.5 + Math.random() * 2).toFixed(1)} km`
        : `${index * 2} km`;

      timeline.push({
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
      });
    }

    setBusStopsTimeline(timeline);
  };

  // Find nearby routes when user location is available
  useEffect(() => {
    if (userLocation && allBusStops.length > 0) {
      const nearby = allBusStops
        .map((stop) => ({
          ...stop,
          distance: dbService.calculateDistance(
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
        current_capacity: Math.floor(Math.random() * 30) + 20,
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
  const refreshBusData = async () => {
    if (selectedRoute && currentBus) {
      // Simulate bus movement
      const newStopIndex = Math.min(
        currentBus.currentStopIndex + 1,
        selectedRoute.stops.length - 1
      );
      const updatedBus = {
        ...currentBus,
        currentStopIndex: newStopIndex,

        eta: new Date(
          Date.now() + Math.random() * 15 * 60000
        ).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };
      setCurrentBus(updatedBus);
      await generateBusTimeline(selectedRoute, newStopIndex);
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
            {/* {isOnline ? "🟢 Live Data" : "🔴 Offline Mode"} */}
          </div>
        </div>

        {/* Map/Timeline Content */}
        {tab === "Live status" ? (
          <div className="px-4 -mt-4">
            {/* Enhanced Bus Status Card */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-1H8V7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{currentBus.number}</h3>
                    <p className="text-sm text-gray-600">{currentBus.category || "Non-AC"} • Route {currentBus.routeId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">₹{currentBus.fare}</div>
                  <div className="text-xs text-gray-500">Fare</div>
                </div>
              </div>

              {/* Route Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Route Progress</span>
                  <span className="text-xs text-gray-500">{currentBus.nextStop}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Started</span>
                  <span>Current: {currentBus.nextStop}</span>
                  <span>Destination</span>
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{currentBus.eta}</div>
                  <div className="text-xs text-gray-600">ETA</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{currentBus.distance}</div>
                  <div className="text-xs text-gray-600">Distance</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    currentBus.status === "On Time" ? "text-green-600" : "text-red-600"
                  }`}>
                    {currentBus.status === "On Time" ? "On Time" : "Delayed"}
                  </div>
                  <div className="text-xs text-gray-600">Status</div>
                </div>
              </div>

              {/* Live Updates */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-800">Live Updates</span>
                  <div className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {isOnline ? "Online" : "Offline"}
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-1">
                  📍 Currently at: <span className="font-medium">{currentBus.nextStop}</span>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  🚌 Next stop in approximately 3-5 minutes
                </div>
                <div className="text-xs text-gray-600">
                  Last updated: {new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
                </div>
              </div>
            </div>

            {/* Route Info Card (if route data available) */}
            {routeData && startLocation && endLocation && (
              <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 013.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Route Map
                  </h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    routeData.source === 'osrm' || routeData.source === 'openrouteservice'
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {routeData.source === 'osrm' ? '🛣️ OSRM' :
                     routeData.source === 'openrouteservice' ? '🌐 OpenRoute' : '📱 Offline'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {routeData.duration ? Math.round(routeData.duration / 60) : 'N/A'} min
                    </div>
                    <div className="text-sm text-gray-600">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {routeData.distance ? (routeData.distance / 1000).toFixed(1) : 'N/A'} km
                    </div>
                    <div className="text-sm text-gray-600">Distance</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estimated Fare:</span>
                  <span className="font-semibold text-green-600">
                    ₹{routeData.distance ? routingService.estimateIndianBusFare(routeData.distance) : 'N/A'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Map Section */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Live Location
              </h3>
              <div className="relative h-64 bg-gray-100 rounded-xl overflow-hidden">
                <Map
                  center={routeBounds ? null : mapCenter}
                  zoom={routeBounds ? 10 : 14}
                  height={256}
                  buses={mockBusForMap}
                  userLocation={userLocation}
                  route={routeData?.coordinates || []}
                  startLocation={startLocation}
                  endLocation={endLocation}
                  routeBounds={routeBounds}
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
            </div>
          </div>
        ) : (
          <div className="px-4 -mt-4">
            {/* Enhanced Bus Timeline */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Bus Timeline
                </h3>
                <div className="text-xs text-gray-500">
                  {busStopsTimeline.filter(s => s.status === 'completed').length} of {busStopsTimeline.length} stops
                </div>
              </div>
              
              <div className="space-y-4">
                {busStopsTimeline.map((stop, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          stop.status === "completed" ? "bg-blue-600 border-blue-600" :
                          stop.status === "current" ? "bg-blue-100 border-blue-600 animate-pulse" :
                          "bg-gray-100 border-gray-300"
                        }`}
                      >
                        {stop.status === "completed" && (
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {stop.status === "current" && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      {index < busStopsTimeline.length - 1 && (
                        <div
                          className={`w-0.5 h-12 ${
                            stop.status === "completed"
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                        ></div>
                      )}
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className={`font-medium ${
                          stop.status === "current" ? "text-blue-800" : "text-gray-800"
                        }`}>
                          {stop.name}
                          {stop.status === "current" && (
                            <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                              Current Stop
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {stop.time}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-600">
                          {stop.distance} from start
                        </div>
                        {stop.actualTime && (
                          <div className={`text-xs px-2 py-1 rounded ${
                            stop.status === "completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {stop.status === "completed" ? "Arrived" : "Delayed"}: {stop.actualTime}
                          </div>
                        )}
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
              {tabName === "Live status" ? "Live Tracking" : "Timeline"}
            </button>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="px-4 mt-6 pb-20">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Set Alarm
              </button>
              <button className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pay Fare
              </button>
            </div>
          </div>

          {/* Journey Summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Journey Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Route:</span>
                <span className="font-medium">{currentBus.route}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fare:</span>
                <span className="font-bold text-green-600">₹{currentBus.fare}</span>
              </div>
              {currentBus.duration && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{currentBus.duration}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium">{currentBus.distance}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default LivetTrack;
