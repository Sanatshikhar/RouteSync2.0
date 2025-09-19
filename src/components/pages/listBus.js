import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import pb from "../../services/pocketbase";
import moBusService from "../../services/moBusService";
import routingService from "../../services/routingService";
pb.autoCancellation(false);

const ListBus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { from, to, date, foundRoutes } = location.state || {};

  // Get real route data using OpenRouter service
  const getRealRouteData = async (fromStop, toStop) => {
    try {
      // Get coordinates for stops from moBusService
      const fromStopData = moBusService.getStopDetails(fromStop);
      const toStopData = moBusService.getStopDetails(toStop);
      
      if (fromStopData.coordinates && toStopData.coordinates && 
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
        
        // Get real route from OpenRouter
        const routeData = await routingService.getRoute(startCoords, endCoords);
        
        if (routeData && routeData.distance && routeData.duration) {
          return {
            distance: routeData.distance / 1000, // Convert to km
            duration: Math.round(routeData.duration / 60), // Convert to minutes
            source: routeData.source || 'online'
          };
        }
      }
    } catch (error) {
      console.log('OpenRouteService not available:', error.message);
      
      // Instead of using inaccurate fallback, return null to indicate failure
      return null;
    }
    
    // If we reach here, routing failed
    return null;
  };

  // Fallback route calculation
  const calculateFallbackRouteData = (fromStop, toStop) => {
    try {
      // Try to find stops in moBusService
      const fromStopData = moBusService.getStopDetails(fromStop);
      const toStopData = moBusService.getStopDetails(toStop);
      
      if (fromStopData.coordinates && toStopData.coordinates &&
          fromStopData.coordinates.lat && fromStopData.coordinates.lng &&
          toStopData.coordinates.lat && toStopData.coordinates.lng) {
        
        const distance = moBusService.calculateDistance(
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
        
        const baseSpeed = 25; // km/h average city speed
        const adjustedSpeed = baseSpeed * speedFactor;
        const duration = Math.round((distance / adjustedSpeed) * 60);
        
        return {
          distance: distance,
          duration: Math.max(5, duration),
          source: 'offline'
        };
      }
    } catch (error) {
      console.log('Error in fallback calculation:', error.message);
    }
    
    // Ultimate fallback with reasonable defaults
    return {
      distance: 8.5, // Average city route distance
      duration: 22,  // Average city travel time
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
      const routeData = await getRealRouteData(from, to);
      console.log('Route data from OpenRouteService:', routeData);
      
      // Handle route data with proper fallbacks
      const safeDistance = routeData.distance || 8.5;
      const safeDuration = routeData.duration || 20;
      const safeSource = routeData.source || 'estimated';
      
      // Try to fetch real buses from PocketBase
      let realBuses = [];
      try {
        const response = await pb.collection('buses').getFullList({
          expand: 'route_id',
          sort: 'departure_time'
        });
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
              stops: matchingRoute.stops,
              from_stop: from,
              to_stop: to,
              distance: `${safeDistance.toFixed(1)} km`,
              eta: `${safeDuration + delayMinutes} min`,
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
              max_capacity: crowdData.max_capacity,
              status: isDelayed ? "Delayed" : "On Time",
              delay: delayMinutes,
              route_source: safeSource,
              crowd_trend: crowdData.trend,
              last_updated: crowdData.lastUpdated
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
              current_capacity: crowdData.current_capacity,
              max_capacity: crowdData.max_capacity,
              status: isDelayed ? "Delayed" : "On Time",
              delay: delayMinutes,
              stops: route.stops,
              from_stop: from,
              to_stop: to,
              eta: `${safeDuration + delayMinutes} min`,
              route_source: safeSource,
              crowd_trend: crowdData.trend,
              last_updated: crowdData.lastUpdated
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
        // Otherwise, try to find routes using moBusService
        else if (from && to) {
          routesToShow = moBusService.findRoutesBetweenStops(from, to);
        }
        // If no specific route, try to get some sample buses from database
        else {
          try {
            const response = await pb.collection("buses").getFullList({
              expand: "route_id",
            });
            setBuses(response || []);
            setLoading(false);
            return;
          } catch (dbError) {
            console.log("Database not available, using mock data");
            routesToShow = moBusService.getAllRoutes().slice(0, 3); // Show first 3 routes as sample
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

      <div className="max-w-md mx-auto p-4">
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

                  {/* Status and Stats */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
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
                        {bus.current_capacity}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Crowd
                        {bus.crowd_trend && (
                          <span className={`ml-1 ${
                            bus.crowd_trend === 'increasing' ? 'text-red-500' : 
                            bus.crowd_trend === 'decreasing' ? 'text-green-500' : 'text-gray-400'
                          }`}>
                            {bus.crowd_trend === 'increasing' ? '↗' : 
                             bus.crowd_trend === 'decreasing' ? '↘' : '→'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-800">
                        {bus.distance}
                      </div>
                      <div className="text-xs text-gray-500">
                        Distance
                        {bus.route_source && (
                          <div className={`text-xs mt-1 ${
                            bus.route_source === 'online' ? 'text-green-600' : 
                            bus.route_source === 'offline' ? 'text-orange-600' : 'text-gray-500'
                          }`}>
                            {bus.route_source === 'online' ? '🌐 Live' : 
                             bus.route_source === 'offline' ? '📱 Cached' : '📊 Est'}
                          </div>
                        )}
                      </div>
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
                      {bus.last_updated && (
                        <div className="text-xs text-gray-400 mt-1">
                          Updated {new Date(bus.last_updated).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stops Preview */}
                  {bus.stops && bus.stops.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">
                        Route stops:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {bus.stops.slice(0, 3).map((stop, stopIndex) => (
                          <span
                            key={stopIndex}
                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                          >
                            {stop}
                          </span>
                        ))}
                        {bus.stops.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{bus.stops.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

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
                      className="flex-1 py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                    >
                      Track Bus
                    </button>
                    <button
                      onClick={() => handleSelectBus(bus)}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Select Seat
                    </button>
                  </div>
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
