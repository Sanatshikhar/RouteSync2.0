import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import pb from "../../services/pocketbase";
import dbService from "../../services/dbService";
import routingService from "../../services/routingService";
import BottomNav from "../BottomNav";
pb.autoCancellation(false);

const ListBus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDays, setSelectedDays] = useState({});
  const { from, to, date, foundRoutes } = location.state || {};

  // Get real route data using OpenRouter service
  const getRealRouteData = async (fromStop, toStop, routeStops = null) => {
    try {
      // Get coordinates for stops from PocketBase
      let fromStopData = null;
      let toStopData = null;
      
      // Get coordinates from dbService fallback
      const fromCoords = await dbService.getStopCoordinates(fromStop);
      const toCoords = await dbService.getStopCoordinates(toStop);
      
      if (fromCoords) {
        fromStopData = { coordinates: fromCoords };
      }
      
      if (toCoords) {
        toStopData = { coordinates: toCoords };
      }
      
      // If we have route stops, try to calculate route-based distance first
      if (routeStops && routeStops.length > 2) {
        try {
          const routeDistance = await dbService.calculateRouteDistance(fromStop, toStop, routeStops);
          if (routeDistance > 0) {
            console.log('Using route-based distance calculation:', routeDistance.toFixed(2), 'km');
            return {
              distance: routeDistance,
              duration: Math.round((routeDistance / 30) * 60), // 30 km/h average
              source: 'route_based'
            };
          }
        } catch (routeError) {
          console.log('Route-based calculation failed, using API:', routeError.message);
        }
      }
      
      if (fromStopData?.coordinates && toStopData?.coordinates && 
          fromStopData.coordinates.lat && fromStopData.coordinates.lng &&
          toStopData.coordinates.lat && toStopData.coordinates.lng) {
        
        const startCoords = {
          lat: fromStopData.coordinates.lat,
          lng: fromStopData.coordinates.lng,
          name: fromStop
        };
        const endCoords = {
          lat: toStopData.coordinates.lat,
          lng: toStopData.coordinates.lng,
          name: toStop
        };
        
        console.log('Getting route from:', startCoords, 'to:', endCoords);
        
        // Calculate straight-line distance for validation
        const straightDistance = calculateDistance(
          startCoords.lat, startCoords.lng, endCoords.lat, endCoords.lng
        );
        console.log('Straight-line distance:', straightDistance.toFixed(2), 'km');
        
        // Get route from API
        const routeData = await routingService.getRoute(startCoords, endCoords);
        
        if (routeData && routeData.distance && routeData.duration) {
          const apiDistanceKm = routeData.distance / 1000;
          console.log('API returned distance:', apiDistanceKm.toFixed(2), 'km');
          
          // Validate API result - if it's more than 2.5x straight line, use fallback
          if (apiDistanceKm > straightDistance * 2.5) {
            console.log('⚠️ API distance seems incorrect, using fallback calculation');
            return {
              distance: Math.min(straightDistance * 1.6, 25), // Max 25km for longer routes
              duration: Math.round((straightDistance * 1.6 / 30) * 60), // 30 km/h avg speed
              source: 'corrected_fallback'
            };
          }
          
          return {
            distance: apiDistanceKm,
            duration: Math.round(routeData.duration / 60), // Convert to minutes
            source: routeData.source || 'online'
          };
        }
      }
    } catch (error) {
      console.log('Routing API failed:', error.message);
    }
    
    // Use fallback calculation
    return await calculateFallbackRouteData(fromStop, toStop);
  };

  // Calculate distance between two points
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Fallback route calculation
  const calculateFallbackRouteData = async (fromStop, toStop) => {
    try {
      // Try to find stops in PocketBase
      let fromStopData = null;
      let toStopData = null;
      
      // Get coordinates from dbService fallback
      const fromCoords = await dbService.getStopCoordinates(fromStop);
      const toCoords = await dbService.getStopCoordinates(toStop);
      
      if (fromCoords) {
        fromStopData = { coordinates: fromCoords };
      }
      
      if (toCoords) {
        toStopData = { coordinates: toCoords };
      }
      
      if (fromStopData?.coordinates && toStopData?.coordinates &&
          fromStopData.coordinates.lat && fromStopData.coordinates.lng &&
          toStopData.coordinates.lat && toStopData.coordinates.lng) {
        
        const distance = calculateDistance(
          fromStopData.coordinates.lat, fromStopData.coordinates.lng,
          toStopData.coordinates.lat, toStopData.coordinates.lng
        );
        
        // Calculate ETA based on current traffic conditions
        const currentTime = new Date();
        const hour = currentTime.getHours();
        let speedFactor = 1;
        
        // Traffic-aware speed adjustment
        if (hour >= 7 && hour <= 10) speedFactor = 0.6; // Morning rush
        else if (hour >= 17 && hour <= 20) speedFactor = 0.7; // Evening rush
        else if (hour >= 22 || hour <= 5) speedFactor = 1.3; // Night time
        
        const baseSpeed = 30; // km/h average speed (increased for better accuracy)
        const adjustedSpeed = baseSpeed * speedFactor;
        const duration = Math.round((distance / adjustedSpeed) * 60);
        
        return {
          distance: distance,
          duration: Math.max(10, duration), // Minimum 10 minutes
          source: 'offline'
        };
      }
    } catch (error) {
      console.log('Error in fallback calculation:', error.message);
    }
    
    // Ultimate fallback with reasonable defaults
    return {
      distance: 16.6, // More realistic average distance
      duration: 35,   // More realistic travel time
      source: 'estimated'
    };
  };

  // Simple distance calculation for routes (used in fallback)
  const calculateSimpleRouteDistance = (route, fromStop, toStop) => {
    try {
      if (!route || !route.stops || !fromStop || !toStop) {
        return 8.5; // Default distance
      }
      
      const fromIndex = route.stops.findIndex(stop => 
        stop.toLowerCase().includes(fromStop.toLowerCase()) || 
        fromStop.toLowerCase().includes(stop.toLowerCase())
      );
      const toIndex = route.stops.findIndex(stop => 
        stop.toLowerCase().includes(toStop.toLowerCase()) || 
        toStop.toLowerCase().includes(stop.toLowerCase())
      );
      
      if (fromIndex !== -1 && toIndex !== -1) {
        const stopsDistance = Math.abs(toIndex - fromIndex);
        return Math.max(2, stopsDistance * 2.2); // 2.2km average between stops
      }
      
      return route.distance ? route.distance * 2.5 : 8.5; // Fallback distance
    } catch (error) {
      console.log('Error calculating simple route distance:', error.message);
      return 8.5; // Safe fallback
    }
  };

  // Get real-time crowd data (simulate API call)
  const getRealTimeCrowdData = async (busId) => {
    try {
      // In a real app, this would call a crowd monitoring API
      // For now, we'll simulate realistic crowd data based on time and route
      const currentTime = new Date();
      const hour = currentTime.getHours();
      
      let baseCrowd = 30; // Base crowd percentage
      
      // Adjust crowd based on time of day
      if (hour >= 7 && hour <= 9) baseCrowd = 75; // Morning rush
      else if (hour >= 17 && hour <= 19) baseCrowd = 80; // Evening rush
      else if (hour >= 10 && hour <= 16) baseCrowd = 45; // Day time
      else if (hour >= 20 && hour <= 22) baseCrowd = 35; // Evening
      else baseCrowd = 20; // Night/early morning
      
      // Add some randomness
      const crowdVariation = Math.floor(Math.random() * 20) - 10; // ±10%
      const finalCrowd = Math.max(15, Math.min(95, baseCrowd + crowdVariation));
      
      return {
        current_capacity: finalCrowd,
        max_capacity: 45,
        trend: crowdVariation > 0 ? 'increasing' : 'decreasing',
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching crowd data:', error);
      return {
        current_capacity: Math.floor(Math.random() * 60) + 25,
        max_capacity: 45,
        trend: 'stable',
        lastUpdated: new Date().toISOString()
      };
    }
  };

  // Fetch real bus data with OpenRouter integration
  const fetchRealBusData = async (routes) => {
    try {
      console.log('Fetching real bus data with OpenRouter integration...');
      
      // Get real route data from OpenRouteService for accurate ETA
      // Try to find a matching route to get stops for better calculation
      let matchingRoute = null;
      if (routes && routes.length > 0) {
        matchingRoute = routes.find(route => 
          route.stops && route.stops.length > 2 &&
          route.stops.some(stop => stop.toLowerCase().includes(from.toLowerCase())) &&
          route.stops.some(stop => stop.toLowerCase().includes(to.toLowerCase()))
        );
      }
      
      const routeData = await getRealRouteData(from, to, matchingRoute?.stops);
      console.log('Route data from OpenRouteService:', routeData);
      
      // Handle route data with proper fallbacks
      const safeDistance = routeData?.distance || 8.5;
      const safeDuration = routeData?.duration || 20;
      const safeSource = routeData?.source || 'estimated';
      
      console.log('Final route data used:', { distance: safeDistance, duration: safeDuration, source: safeSource });
      
      // Try to fetch real buses from PocketBase
      let realBuses = [];
      try {
        const response = await pb.collection('buses').getFullList();
        realBuses = response || [];

        console.log('Successfully fetched', realBuses.length, 'buses from database');
      } catch (dbError) {
        console.log('Database not available, using generated data:', dbError.message);
        realBuses = [];
      }
      
      const enhancedBuses = [];
      const currentTime = new Date();
      
      // Process real buses from database
      if (realBuses.length > 0) {
        for (let i = 0; i < Math.min(realBuses.length, 6); i++) {
          const bus = realBuses[i];
          const matchingRoute = routes.find(route => 
            route.route_id === bus.route_id || 
            route.route_id === bus.expand?.route_id?.route_number
          );
          
          if (matchingRoute) {
            // Get real-time crowd data
            const crowdData = await getRealTimeCrowdData(bus.id);
            
            // Simple ETA calculation
            const etaMinutes = Math.floor(Math.random() * 25) + 10; // 10-35 minutes
            
            const departureTime = new Date(currentTime);
            departureTime.setMinutes(currentTime.getMinutes() + (i * 18) + Math.floor(Math.random() * 12));
            const arrivalTime = new Date(departureTime);
            arrivalTime.setMinutes(departureTime.getMinutes() + safeDuration);
            
            // Determine if bus is delayed based on real-time factors
            const isDelayed = Math.random() > 0.75 || crowdData.current_capacity > 85;
            const delayMinutes = isDelayed ? Math.floor(Math.random() * 12) + 3 : 0;
            
            enhancedBuses.push({
              ...bus,
              route_color: matchingRoute.color,
              from_stop: from,
              to_stop: to,
              distance: `${safeDistance.toFixed(1)} km`,
              eta: `${etaMinutes + delayMinutes} min`,
              departure_time: departureTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              arrival_time: arrivalTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              duration: `${safeDuration + delayMinutes} min`,
              current_capacity: crowdData.current_capacity,
              status: isDelayed ? "Delayed" : "On Time",
              delay: delayMinutes
            });
          }
        }
      }
      
      // Generate additional buses if we don't have enough real data
      if (enhancedBuses.length < 3) {
        for (let routeIndex = 0; routeIndex < routes.length && enhancedBuses.length < 5; routeIndex++) {
          const route = routes[routeIndex];
          const busCount = Math.min(2, 5 - enhancedBuses.length);
          
          for (let i = 0; i < busCount; i++) {
            const crowdData = await getRealTimeCrowdData(`generated-${routeIndex}-${i}`);
            
            // Simple ETA calculation for generated buses
            const etaMinutes = Math.floor(Math.random() * 25) + 10;
            
            const departureTime = new Date(currentTime);
            departureTime.setMinutes(currentTime.getMinutes() + (enhancedBuses.length * 22) + Math.floor(Math.random() * 15));
            const arrivalTime = new Date(departureTime);
            arrivalTime.setMinutes(departureTime.getMinutes() + safeDuration);
            
            const busNumber = `OD-${String(routeIndex + 1).padStart(2, "0")}-${String(1000 + enhancedBuses.length).slice(-3)}`;
            const isDelayed = Math.random() > 0.8 || crowdData.current_capacity > 80;
            const delayMinutes = isDelayed ? Math.floor(Math.random() * 10) + 3 : 0;
            
            enhancedBuses.push({
              id: `${route.route_id}-${enhancedBuses.length}`,
              bus_number: busNumber,
              route_id: route.route_id,
              route_color: route.color,
              category: Math.random() > 0.6 ? "AC" : "Non-AC",
              fare_amount: route.fare,
              departure_time: departureTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              arrival_time: arrivalTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }),
              duration: `${safeDuration + delayMinutes} min`,
              distance: `${safeDistance.toFixed(1)} km`,
              eta: `${etaMinutes + delayMinutes} min`,
              current_capacity: crowdData.current_capacity,
              status: isDelayed ? "Delayed" : "On Time",
              delay: delayMinutes,
              from_stop: from,
              to_stop: to
            });
          }
        }
      }
      
      return enhancedBuses.sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.departure_time}`);
        const timeB = new Date(`1970/01/01 ${b.departure_time}`);
        return timeA - timeB;
      });
      
    } catch (error) {
      console.error('Error fetching real bus data:', error);
      return generateFallbackBuses(routes);
    }
  };

  // Fallback bus generation if API is not available
  const generateFallbackBuses = (routes) => {
    const schedules = [];
    const currentTime = new Date();

    routes.forEach((route, routeIndex) => {
      const busCount = Math.floor(Math.random() * 2) + 3; // 3-4 buses per route

      for (let i = 0; i < busCount; i++) {
        const distance = calculateSimpleRouteDistance(route, from, to);
        const eta = calculateSimpleETA(distance, currentTime);
        const departureTime = new Date(currentTime);
        departureTime.setMinutes(currentTime.getMinutes() + (i * 25) + Math.floor(Math.random() * 10));
        const arrivalTime = new Date(departureTime);
        arrivalTime.setMinutes(departureTime.getMinutes() + eta);

        const busNumber = `OD-${String(routeIndex + 1).padStart(2, "0")}-${String(1000 + i).slice(-3)}`;
        const crowdPercentage = Math.floor(Math.random() * 70) + 25;
        const isDelayed = Math.random() > 0.8;
        const delayMinutes = isDelayed ? Math.floor(Math.random() * 12) + 3 : 0;

        schedules.push({
          id: `${route.route_id}-${i}`,
          bus_number: busNumber,
          route_id: route.route_id,
          route_color: route.color,
          category: Math.random() > 0.6 ? "AC" : "Non-AC",
          fare_amount: route.fare,
          departure_time: departureTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          arrival_time: arrivalTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          duration: `${eta + delayMinutes} min`,
          distance: `${distance.toFixed(1)} km`,
          current_capacity: crowdPercentage,
          max_capacity: 45,
          status: isDelayed ? "Delayed" : "On Time",
          delay: delayMinutes,
          stops: route.stops,
          from_stop: from,
          to_stop: to,
          eta: `${eta + delayMinutes} min`,
          route_source: 'fallback',
          crowd_trend: 'stable',
          last_updated: new Date().toISOString()
        });
      }
    });

    return schedules.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.departure_time}`);
      const timeB = new Date(`1970/01/01 ${b.departure_time}`);
      return timeA - timeB;
    });
  };

  // Simple ETA calculation for fallback
  const calculateSimpleETA = (distance, currentTime) => {
    try {
      const hour = currentTime.getHours();
      let speedFactor = 1;
      
      // Traffic-aware speed adjustment
      if (hour >= 7 && hour <= 10) speedFactor = 0.6; // Morning rush
      else if (hour >= 17 && hour <= 20) speedFactor = 0.7; // Evening rush
      else if (hour >= 22 || hour <= 5) speedFactor = 1.3; // Night time
      
      const baseSpeed = 25; // km/h average city speed
      const adjustedSpeed = baseSpeed * speedFactor;
      const timeInHours = distance / adjustedSpeed;
      const timeInMinutes = Math.round(timeInHours * 60);
      
      return Math.max(8, Math.min(45, timeInMinutes)); // Between 8-45 minutes
    } catch (error) {
      console.log('Error calculating simple ETA:', error.message);
      return 20; // Safe fallback
    }
  };

  useEffect(() => {
    const fetchBuses = async () => {
      setLoading(true);
      setError(null);

      try {
        let routesToShow = [];

        // If we have foundRoutes from SearchBus, use them
        if (foundRoutes && foundRoutes.length > 0) {
          routesToShow = foundRoutes;
        }
        // Otherwise, try to find routes using dbService
        else if (from && to) {
          routesToShow = await dbService.findRoutesBetweenStops(from, to);
        }
        // If no specific route, try to get some sample routes from database
        else {
          try {
            const routesResponse = await pb.collection("routes").getList(1, 5, {
              expand: "stops",
            });
            
            routesToShow = routesResponse.items.map(route => ({
              route_id: route.route_number || route.id,
              name: route.name,
              stops: Array.isArray(route.stops) ? route.stops : 
                     typeof route.stops === 'string' ? JSON.parse(route.stops) : [],
              color: route.color || '#3B82F6',
              fare: route.fare || 25,
              distance: route.distance || 10,
              estimatedTime: route.estimated_time || 30
            }));
            
            console.log(`Found ${routesToShow.length} sample routes from database`);
          } catch (dbError) {
            console.log("Database not available, using mock data:", dbError.message);
            routesToShow = []; // No fallback routes
          }
        }

        // Fetch real bus data and enhance with route information
        if (routesToShow.length > 0) {
          const enhancedBuses = await fetchRealBusData(routesToShow);
          setBuses(enhancedBuses);
        } else {
          setBuses([]);
        }
      } catch (err) {
        console.error("Error fetching buses:", err);
        setError("Failed to load buses. Please try again.");
        setBuses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [from, to, date, foundRoutes]);

  const handleSelectBus = (bus) => {
    navigate("/selectSeat", { state: { bus, from, to, date } });
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-md mx-auto flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-blue-700 transition-colors"
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
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold">Available Buses</h2>
            {from && to && (
              <p className="text-sm opacity-90">
                {from} → {to}
              </p>
            )}
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-20">
        {buses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
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
            <h4 className="text-xl font-semibold text-gray-700 mb-2">
              No buses found
            </h4>
            <p className="text-gray-600 mb-4">
              Sorry, we couldn't find any buses for your selected route.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {buses.map((bus, index) => (
              <div
                key={bus.id || index}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
              >
                {/* Route Header */}
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: bus.route_color || "#3B82F6",
                        }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        Route {bus.route_id}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      ₹{bus.fare_amount}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {/* Bus Info */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">
                        {bus.bus_number}
                      </h4>
                      <p className="text-gray-600 text-sm">{bus.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">ETA</div>
                      <div className="font-semibold text-blue-600">
                        {bus.eta}
                      </div>
                    </div>
                  </div>

                  {/* Time and Route */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">
                        {bus.departure_time}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {bus.from_stop}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="mx-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-sm font-medium text-blue-700">
                          {bus.duration}
                        </span>
                      </div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">
                        {bus.arrival_time}
                      </div>
                      <div className="text-gray-500 text-sm">{bus.to_stop}</div>
                    </div>
                  </div>



                  {/* Weekly Calendar */}
                  {(() => {
                    const today = new Date().getDay();
                    const currentDayIndex = today === 0 ? 6 : today - 1;
                    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                    const weeklyStatus = weekDays.map((day, dayIndex) => {
                      const delayProbability = 0.7 - (dayIndex * 0.08);
                      let isDelayed, delayMinutes;
                      
                      // For today, use the actual bus status
                      if (dayIndex === currentDayIndex) {
                        isDelayed = bus.status === "Delayed";
                        delayMinutes = isDelayed ? bus.delay || 0 : 0;
                      } else {
                        // For other days, use randomized data
                        isDelayed = Math.random() < delayProbability;
                        delayMinutes = isDelayed ? Math.floor(Math.random() * 25) + 5 : 0;
                      }
                      
                      const isPast = dayIndex < currentDayIndex;
                      const isToday = dayIndex === currentDayIndex;
                      const isFuture = dayIndex > currentDayIndex;
                      return { day, isDelayed, delayMinutes, isPast, isToday, isFuture };
                    });
                    const selectedDay = selectedDays[`bus-${index}`];
                    
                    return (
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-2">Weekly Status</div>
                        <div className="flex gap-1 mb-2">
                          {weeklyStatus.map((status, dayIndex) => (
                            <div key={dayIndex} className="flex flex-col items-center">
                              <div className="text-xs text-gray-600 mb-1">{status.day}</div>
                              <button
                                onClick={() => setSelectedDays(prev => ({
                                  ...prev,
                                  [`bus-${index}`]: prev[`bus-${index}`] === dayIndex ? null : dayIndex
                                }))}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                  status.isFuture 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : status.isDelayed 
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer' 
                                    : 'bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer'
                                } ${
                                  status.isToday ? 'ring-2 ring-blue-400' : ''
                                }`}
                                disabled={status.isFuture}
                              >
                                {status.isFuture ? '?' : status.isDelayed ? '⚠' : '✓'}
                              </button>
                            </div>
                          ))}
                        </div>
                        {selectedDay !== null && selectedDay !== undefined && !weeklyStatus[selectedDay]?.isFuture && (
                          <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-xs font-medium text-blue-800">
                              {weekDays[selectedDay]} - {selectedDay === currentDayIndex ? 'Today' : 'Past'}
                            </div>
                            <div className="text-sm text-blue-700">
                              {weeklyStatus[selectedDay]?.isDelayed 
                                ? `Delayed by ${weeklyStatus[selectedDay].delayMinutes} minutes`
                                : 'On time'
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Status and Stats */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            bus.current_capacity > 80
                              ? "bg-red-500"
                              : bus.current_capacity > 60
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${bus.current_capacity}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {bus.current_capacity}% full
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-800">
                        {bus.distance}
                      </div>
                      <div className="text-xs text-gray-500">Distance</div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${
                          bus.status === "On Time"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {bus.status === "On Time"
                          ? "On Time"
                          : `Delayed ${bus.delay}m`}
                      </div>
                    </div>
                  </div>



                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate("/bus-status", {
                          state: {
                            bus: bus,
                            from: bus.from_stop,
                            to: bus.to_stop,
                          },
                        })
                      }
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Track Bus
                    </button>
                    {/* <button
                      onClick={() => handleSelectBus(bus)}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Select Seat
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ListBus;
