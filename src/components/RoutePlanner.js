import { useState, useEffect } from "react";
import routingService from "../services/routingService";
import useGeolocation from "../hooks/useGeolocation";

const RoutePlanner = ({ onRouteCalculated, onLocationSelect }) => {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedStartLocation, setSelectedStartLocation] = useState(null);
  const [selectedEndLocation, setSelectedEndLocation] = useState(null);
  const [routingStatus, setRoutingStatus] = useState({
    isOnline: navigator.onLine,
    statusText: "Online",
    statusColor: "green",
  });

  // Get user's GPS location
  const { location: userLocation } = useGeolocation();

  // Update routing status periodically
  useEffect(() => {
    const updateStatus = () => {
      const status = routingService.getRoutingStatus();
      setRoutingStatus(status);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-set start location when GPS is available
  useEffect(() => {
    if (userLocation && !selectedStartLocation) {
      const gpsLocation = {
        id: "gps_location",
        name: "Current Location (GPS)",
        lat: userLocation.lat,
        lng: userLocation.lng,
        type: "gps",
        address: `Current Location (${userLocation.lat.toFixed(
          4
        )}, ${userLocation.lng.toFixed(4)})`,
        city: "Current",
        state: "Odisha",
        source: "gps",
      };
      setSelectedStartLocation(gpsLocation);
      setStartLocation("Current Location (GPS)");
      onLocationSelect("start", gpsLocation);
    }
  }, [userLocation, selectedStartLocation, onLocationSelect]);

  // Search for start location
  const searchStartLocation = async (query) => {
    if (query.length < 3) {
      setStartSuggestions([]);
      return;
    }

    try {
      const suggestions = await routingService.searchPlaces(query);
      setStartSuggestions(suggestions.slice(0, 5));
    } catch (error) {
      console.error("Error searching start location:", error);
      setStartSuggestions([]);
    }
  };

  // Search for end location
  const searchEndLocation = async (query) => {
    if (query.length < 3) {
      setEndSuggestions([]);
      return;
    }

    try {
      const suggestions = await routingService.searchPlaces(query);
      setEndSuggestions(suggestions.slice(0, 5));
    } catch (error) {
      console.error("Error searching end location:", error);
      setEndSuggestions([]);
    }
  };

  // Calculate route
  const calculateRoute = async (start, end) => {
    if (!start || !end) return;

    setIsCalculating(true);
    try {
      const route = await routingService.getRoute(start, end);
      setRouteInfo(route);
      onRouteCalculated(route, start, end);
      
      // Show success message based on route source
      if (route.source === 'osrm') {
        console.log('✅ Route calculated with OSRM (real roads)');
      } else if (route.source === 'openrouteservice') {
        console.log('✅ Route calculated with OpenRouteService');
      } else {
        console.log('📱 Route calculated with smart estimation');
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      
      // Show user-friendly error message
      const errorMessage = error.message.includes('temporarily unavailable') 
        ? "Routing service is temporarily unavailable. The app is working in offline mode with estimated routes."
        : "Could not calculate route. Please check your locations and try again.";
        
      alert(errorMessage);
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle start location selection
  const selectStartLocation = (location) => {
    setStartLocation(location.name);
    setStartSuggestions([]);
    setSelectedStartLocation(location);
    onLocationSelect("start", location);
  };

  // Handle end location selection
  const selectEndLocation = (location) => {
    setEndLocation(location.name);
    setEndSuggestions([]);
    setSelectedEndLocation(location);
    onLocationSelect("end", location);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 m-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Plan Your Route
      </h3>

      {/* Start Location Input */}
      <div className="relative mb-4">
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-3 ${
              userLocation ? "bg-green-500" : "bg-gray-400"
            }`}
          ></div>
          <input
            type="text"
            placeholder={
              userLocation
                ? "Current Location (GPS) - Auto-detected"
                : "Detecting GPS location..."
            }
            value={startLocation}
            onChange={(e) => {
              setStartLocation(e.target.value);
              setSelectedStartLocation(null); // Clear GPS selection when user types
              searchStartLocation(e.target.value);
            }}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={userLocation && selectedStartLocation?.type === "gps"}
          />
          {userLocation && selectedStartLocation?.type === "gps" && (
            <button
              onClick={() => {
                setSelectedStartLocation(null);
                setStartLocation("");
              }}
              className="ml-2 px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Manual
            </button>
          )}
        </div>

        {/* Start Location Suggestions */}
        {startSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
            {startSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => selectStartLocation(suggestion)}
                className="w-full text-left p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-800">
                  {suggestion.name}
                </div>
                <div className="text-sm text-gray-500">
                  {suggestion.city && suggestion.state
                    ? `${suggestion.city}, ${suggestion.state}`
                    : suggestion.address}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* End Location Input */}
      <div className="relative mb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
          <input
            type="text"
            placeholder="Enter destination (e.g., Jagannath Temple, Puri)"
            value={endLocation}
            onChange={(e) => {
              setEndLocation(e.target.value);
              searchEndLocation(e.target.value);
            }}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End Location Suggestions */}
        {endSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
            {endSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => selectEndLocation(suggestion)}
                className="w-full text-left p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-800">
                  {suggestion.name}
                </div>
                <div className="text-sm text-gray-500">
                  {suggestion.city && suggestion.state
                    ? `${suggestion.city}, ${suggestion.state}`
                    : suggestion.address}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Route Info Panel */}
      {routeInfo && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-lg font-semibold text-blue-800">
                {routingService.formatDuration(routeInfo.duration)}
              </div>
              <div className="text-sm text-blue-600">
                {routingService.formatDistance(routeInfo.distance)}
              </div>
            </div>
            <div className="text-blue-600">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="border-t border-blue-200 pt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-600">Estimated Bus Fare:</span>
              <span className="font-semibold text-green-600">
                ₹{routingService.estimateIndianBusFare(routeInfo.distance)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-600">Route Source:</span>
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    routeInfo.source === "osrm" || routeInfo.source === "openrouteservice"
                      ? "bg-green-500"
                      : "bg-orange-500"
                  }`}
                ></div>
                <span className="text-xs font-medium">
                  {routeInfo.source === "osrm" ? "OSRM" : 
                   routeInfo.source === "openrouteservice" ? "OpenRoute" :
                   routeInfo.source === "smart_fallback" ? "Smart Route" : "Estimated"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculate Route Button */}
      <button
        onClick={() => {
          const start =
            selectedStartLocation ||
            startSuggestions.find((s) => s.name === startLocation) ||
            (startLocation && {
              lat: 20.295,
              lng: 85.826,
              name: startLocation,
            });
          const end =
            selectedEndLocation ||
            endSuggestions.find((s) => s.name === endLocation) ||
            (endLocation && { lat: 20.305, lng: 85.836, name: endLocation });
          calculateRoute(start, end);
        }}
        disabled={!startLocation || !endLocation || isCalculating}
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
          !startLocation || !endLocation || isCalculating
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isCalculating ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Calculating Route...
          </div>
        ) : (
          "Get Directions"
        )}
      </button>
    </div>
  );
};

export default RoutePlanner;
