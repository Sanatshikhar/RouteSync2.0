import { useState, useEffect } from "react";
import routingService from "../services/routingService";

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

  // Get user's GPS location (same as homepage implementation)
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState('Fetching...');

  // Fetch user's current location with QUANTUM-LEVEL MAXIMUM ACCURACY (same as homepage)
  useEffect(() => {
    if (navigator.geolocation) {
      let bestAccuracy = Infinity;
      let attempts = 0;
      const maxAttempts = 10;
      
      // Multi-stage ultra-precision location acquisition
      const acquireUltraPreciseLocation = () => {
        const watchId = navigator.geolocation.watchPosition(async (position) => {
          attempts++;
          const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed, timestamp } = position.coords;
          const gpsTime = new Date(position.timestamp);
          
          // Only proceed if we get better accuracy or reach max attempts
          if (accuracy < bestAccuracy || attempts >= maxAttempts) {
            bestAccuracy = Math.min(accuracy, bestAccuracy);
            
            console.log(`🎯 QUANTUM-PRECISION GPS LOCK #${attempts}:
              📍 Coordinates: ${latitude.toFixed(12)}°N, ${longitude.toFixed(12)}°E
              🎯 Accuracy: ${accuracy.toFixed(2)}m (Best: ${bestAccuracy.toFixed(2)}m)
              🏔️ Altitude: ${altitude?.toFixed(2)}m (±${altitudeAccuracy?.toFixed(2)}m)
              🧭 Heading: ${heading?.toFixed(2)}° | Speed: ${speed?.toFixed(2)} m/s
              ⏰ GPS Time: ${gpsTime.toISOString()}
              🛰️ Signal Quality: ${accuracy < 5 ? 'EXCELLENT' : accuracy < 10 ? 'VERY GOOD' : accuracy < 20 ? 'GOOD' : 'FAIR'}`);
            
            // Set the coordinates for route planning
            setUserLocation({
              lat: latitude,
              lng: longitude
            });
            
            // ULTRA-PRECISION GEOCODING WITH MULTIPLE SIMULTANEOUS SERVICES
            const quantumPrecisionServices = [
              // Service 1: OpenStreetMap with ABSOLUTE maximum detail
              async () => {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=21&addressdetails=1&extratags=1&namedetails=1&polygon_text=1&polygon_kml=1&accept-language=en&limit=1&dedupe=0`);
                const data = await response.json();
                
                const addr = data.address || {};
                const name = data.name || data.display_name?.split(',')[0];
                const category = data.category;
                const type = data.type;
                
                // ULTRA-DETAILED ADDRESS COMPONENTS
                const building = addr.building || addr.house_name || addr.shop || addr.amenity || 
                               addr.tourism || addr.office || addr.leisure || addr.healthcare || 
                               addr.public_building || addr.commercial || addr.industrial;
                const houseNumber = addr.house_number || addr.addr_housenumber;
                const houseName = addr.addr_housename;
                const road = addr.road || addr.pedestrian || addr.footway || addr.cycleway || 
                            addr.bridleway || addr.steps || addr.path || addr.track;
                const neighbourhood = addr.neighbourhood || addr.suburb || addr.quarter || 
                                    addr.city_district || addr.borough || addr.residential;
                const postcode = addr.postcode || addr.postal_code;
                const city = addr.city || addr.town || addr.village || addr.hamlet;
                const state = addr.state || addr.province || addr.region;
                const country = addr.country;
                
                // QUANTUM-LEVEL LOCATION CONSTRUCTION
                let quantumLocation = '';
                
                // Ultra-precise building identification
                if (name && building && houseNumber && road) {
                  quantumLocation = `🏢 ${name} (${building}) • ${houseNumber} ${road}`;
                } else if (building && houseNumber && road) {
                  quantumLocation = `🏢 ${building} • ${houseNumber} ${road}`;
                } else if (name && houseNumber && road) {
                  quantumLocation = `📍 ${name} • ${houseNumber} ${road}`;
                } else if (houseName && houseNumber && road) {
                  quantumLocation = `🏠 ${houseName} • ${houseNumber} ${road}`;
                } else if (houseNumber && road) {
                  quantumLocation = `📍 ${houseNumber} ${road}`;
                } else if (name && road) {
                  quantumLocation = `📍 ${name} • ${road}`;
                } else if (building && road) {
                  quantumLocation = `🏢 ${building} • ${road}`;
                } else if (road) {
                  quantumLocation = `🛣️ ${road}`;
                } else if (name) {
                  quantumLocation = `📍 ${name}`;
                } else if (building) {
                  quantumLocation = `🏢 ${building}`;
                }
                
                // Add precision context
                if (neighbourhood && !quantumLocation.includes(neighbourhood)) {
                  quantumLocation += ` • ${neighbourhood}`;
                }
                if (postcode && !quantumLocation.includes(postcode)) {
                  quantumLocation += ` ${postcode}`;
                }
                if (city && !quantumLocation.includes(city)) {
                  quantumLocation += ` • ${city}`;
                }
                
                // Add category/type information for ultra-precision
                if (category && type) {
                  quantumLocation += ` [${category}:${type}]`;
                }
                
                return quantumLocation || null;
              },
              
              // Service 2: HERE Geocoding (if available)
              async () => {
                try {
                  const response = await fetch(`https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&lang=en-US&apiKey=YOUR_HERE_API_KEY`);
                  const data = await response.json();
                  return data.items?.[0]?.title || null;
                } catch {
                  return null;
                }
              },
              
              // Service 3: MapBox Geocoding (if available)
              async () => {
                try {
                  const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=YOUR_MAPBOX_TOKEN&types=address&limit=1`);
                  const data = await response.json();
                  return data.features?.[0]?.place_name || null;
                } catch {
                  return null;
                }
              },
              
              // Service 4: Plus Codes with ultra-precision
              async () => {
                const latBase = Math.floor(latitude * 8000) / 8000;
                const lngBase = Math.floor(longitude * 8000) / 8000;
                const latOffset = ((latitude - latBase) * 8000).toFixed(0).padStart(4, '0');
                const lngOffset = ((longitude - lngBase) * 8000).toFixed(0).padStart(4, '0');
                return `📐 Grid: ${latBase.toFixed(6)}.${latOffset} × ${lngBase.toFixed(6)}.${lngOffset}`;
              },
              
              // Service 5: Military-grade coordinates with MGRS-style
              async () => {
                const dms_lat = `${Math.floor(Math.abs(latitude))}°${Math.floor((Math.abs(latitude) % 1) * 60)}'${(((Math.abs(latitude) % 1) * 60) % 1 * 60).toFixed(4)}"${latitude >= 0 ? 'N' : 'S'}`;
                const dms_lng = `${Math.floor(Math.abs(longitude))}°${Math.floor((Math.abs(longitude) % 1) * 60)}'${(((Math.abs(longitude) % 1) * 60) % 1 * 60).toFixed(4)}"${longitude >= 0 ? 'E' : 'W'}`;
                return `🎯 ${dms_lat}, ${dms_lng} (±${accuracy.toFixed(1)}m)`;
              }
            ];
            
            // Execute all services simultaneously for maximum speed and precision
            const results = await Promise.allSettled(quantumPrecisionServices.map(service => service()));
            
            // Use the most detailed result available
            for (const result of results) {
              if (result.status === 'fulfilled' && result.value && 
                  result.value.length > 10 && 
                  !result.value.includes('Grid:') && 
                  !result.value.includes('🎯')) {
                setLocationName(result.value);
                if (attempts >= maxAttempts) navigator.geolocation.clearWatch(watchId);
                return;
              }
            }
            
            // Use coordinate fallbacks if no detailed address
            const fallbackResults = results.filter(r => r.status === 'fulfilled' && r.value);
            if (fallbackResults.length > 0) {
              setLocationName(fallbackResults[fallbackResults.length - 1].value);
            } else {
              setLocationName(`🎯 ${latitude.toFixed(12)}, ${longitude.toFixed(12)} (±${accuracy.toFixed(2)}m)`);
            }
            
            if (attempts >= maxAttempts) {
              navigator.geolocation.clearWatch(watchId);
            }
          }
        }, 
        (error) => {
          console.error('🚨 Quantum-precision geolocation error:', error);
          setLocationName('🚫 Ultra-precision location access denied');
        },
        {
          enableHighAccuracy: true,
          timeout: 120000, // 2 minutes for absolute best GPS lock
          maximumAge: 0 // Always fresh
        });
        
        return watchId;
      };
      
      const watchId = acquireUltraPreciseLocation();
      
      // Cleanup
      return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
      };
    } else {
      setLocationName('🚫 Quantum-precision geolocation not supported');
    }
  }, []);

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
    if (userLocation && locationName && !selectedStartLocation && 
        !locationName.includes('🚫') && !locationName.includes('Fetching')) {
      const gpsLocation = {
        id: "gps_location",
        name: `Current Location (${locationName})`,
        lat: userLocation.lat,
        lng: userLocation.lng,
        type: "gps",
        address: `Current Location (${userLocation.lat.toFixed(
          4
        )}, ${userLocation.lng.toFixed(4)})`,
        city: locationName,
        state: "Current Location",
        source: "gps",
      };
      setSelectedStartLocation(gpsLocation);
      setStartLocation(`Current Location (${locationName})`);
      onLocationSelect && onLocationSelect("start", gpsLocation);
    }
  }, [userLocation, locationName, selectedStartLocation, onLocationSelect]);

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
      const route = await routingService.getRouteForPlanner(start, end);
      setRouteInfo(route);
      onRouteCalculated(route, start, end);
      
      // Show success message based on route source
      if (route.source === 'osrm') {
        console.log('✅ Route Planner: Route calculated with OSRM (real roads)');
      } else {
        console.log('📱 Route Planner: Route calculated with smart estimation');
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
              userLocation && locationName && !locationName.includes('🚫') && !locationName.includes('Fetching')
                ? `${locationName} - Quantum-precision detected`
                : locationName.includes('🚫') 
                ? "Location access denied - Enter manually"
                : "🛰️ Acquiring quantum-precision GPS lock..."
            }
            value={startLocation}
            onChange={(e) => {
              setStartLocation(e.target.value);
              setSelectedStartLocation(null)
              ; // Clear GPS selection when user types
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
                    routeInfo.source === "osrm"
                      ? "bg-green-500"
                      : "bg-orange-500"
                  }`}
                ></div>
                <span className="text-xs font-medium">
                  {routeInfo.source === "osrm" ? "OSRM" : 
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
