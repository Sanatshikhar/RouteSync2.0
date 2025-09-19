import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useBuses } from '../../hooks/useBuses';
import useGeolocation from '../../hooks/useGeolocation';
import moBusService from '../../services/moBusService';

const SearchBus = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Add this to access passed state
  const { buses, searchBuses } = useBuses();
  const { location: userLocation } = useGeolocation();
  const [tripType, setTripType] = useState("oneway");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date());
  const [recentSearches, setRecentSearches] = useState([]);
  const [foundRoutes, setFoundRoutes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [nearbyBuses, setNearbyBuses] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    // Handle location passed from HomePage
    const locationState = location.state;
    if (locationState && locationState.destination) {
      setTo(locationState.destination);
    }

    // Load recent searches from local storage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, [location.state]);

  // Auto-fetch user location and nearby buses
  useEffect(() => {
    if (userLocation) {
      setIsLoadingLocation(false);
      // Find nearest bus stop to user's location
      const allStops = moBusService.getAllStops();
      const nearestStop = allStops
        .map(stop => ({
          ...stop,
          distance: moBusService.calculateDistance(
            userLocation.lat, userLocation.lng,
            stop.coordinates.lat, stop.coordinates.lng
          )
        }))
        .sort((a, b) => a.distance - b.distance)[0];

      if (nearestStop) {
        setFrom(nearestStop.name);
        // Auto-fetch buses in this zone
        fetchBusesInZone(nearestStop);
      }
    }
  }, [userLocation]);

  // Fetch buses in the user's zone
  const fetchBusesInZone = (nearestStop) => {
    try {
      // Get all routes that pass through the nearest stop
      const routesInZone = moBusService.getRoutesByStop(nearestStop.name);
      
      // Get nearby stops within 5km radius
      const allStops = moBusService.getAllStops();
      const nearbyStops = allStops
        .map(stop => ({
          ...stop,
          distance: moBusService.calculateDistance(
            nearestStop.coordinates.lat, nearestStop.coordinates.lng,
            stop.coordinates.lat, stop.coordinates.lng
          )
        }))
        .filter(stop => stop.distance <= 5) // Within 5km
        .sort((a, b) => a.distance - b.distance);

      // Create a comprehensive list of available routes in the zone
      const zoneBuses = [];
      nearbyStops.forEach(stop => {
        const stopRoutes = moBusService.getRoutesByStop(stop.name);
        stopRoutes.forEach(route => {
          if (!zoneBuses.find(bus => bus.route_id === route.route_id)) {
            zoneBuses.push({
              ...route,
              nearestStop: stop.name,
              distanceFromUser: stop.distance,
              estimatedTime: Math.round(stop.distance * 3), // 3 minutes per km
              fare: Math.max(5, Math.round(stop.distance * 2)) // ₹2 per km, minimum ₹5
            });
          }
        });
      });

      setNearbyBuses(zoneBuses.slice(0, 10)); // Show top 10 routes
    } catch (error) {
      console.error('Error fetching buses in zone:', error);
    }
  };

  const handleSearch = async () => {
    if (!from || !to) {
      alert('Please select source');
      return;
    }

    saveSearch();
    await searchBuses(from, to);
    navigate('/listBus', { 
      state: { 
        from, 
        to, 
        date, 
        buses,
        tripType 
      } 
    });
  };

  const saveSearch = () => {
    const newSearch = {
      id: Date.now(),
      route: `${from} → ${to}`,
      date: date.toISOString()
    };
    const updatedSearches = [newSearch, ...recentSearches].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const deleteSearch = (id) => {
    const updatedSearches = recentSearches.filter((item) => item.id !== id);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const setToday = () => {
    setDate(new Date());
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow);
  };

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  const handleFromChange = (e) => {
    const value = e.target.value;
    setFrom(value);
    if (value.length > 0) {
      const matches = moBusService.searchStops(value);
      setFromSuggestions(matches.map(stop => stop.name));
    } else {
      setFromSuggestions([]);
    }
    
    // Auto-fetch routes if both from and to are selected
    if (value && to) {
      autoFetchRoutes(value, to);
    }
  };

  const handleToChange = (e) => {
    const value = e.target.value;
    setTo(value);
    if (value.length > 0) {
      const matches = moBusService.searchStops(value);
      setToSuggestions(matches.map(stop => stop.name));
    } else {
      setToSuggestions([]);
    }
    
    // Auto-fetch routes if both from and to are selected
    if (from && value) {
      autoFetchRoutes(from, value);
    }
  };

  // Auto-fetch routes when both locations are entered
  const autoFetchRoutes = async (fromLocation, toLocation) => {
    setIsSearching(true);
    try {
      const routes = moBusService.findRoutesBetweenStops(fromLocation, toLocation);
      setFoundRoutes(routes);
      
      if (routes.length > 0) {
        console.log(`Found ${routes.length} routes from ${fromLocation} to ${toLocation}`);
      }
    } catch (error) {
      console.error('Error auto-fetching routes:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-md mx-auto flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold flex-1 text-center">Select Bus Route</h2>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Trip Type */}
        <div className="bg-blue-100 rounded-lg p-1 flex shadow-sm mb-4">
          <button
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              tripType === "oneway"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setTripType("oneway")}
          >
            One way
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              tripType === "round"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setTripType("round")}
          >
            Round trip
          </button>
        </div>

        {/* From - To */}
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-4 mb-4">
          <div className="relative">
            <label className="text-gray-500 text-sm font-medium mb-1 block">From</label>
            <input
              type="text"
              value={from}
              onChange={handleFromChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter source city"
            />
            {fromSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                {fromSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFrom(suggestion);
                      setFromSuggestions([]);
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative">
            <label className="text-gray-500 text-sm font-medium mb-1 block">To</label>
            <input
              type="text"
              value={to}
              onChange={handleToChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter destination city"
            />
            {toSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                {toSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setTo(suggestion);
                      setToSuggestions([]);
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <label className="text-gray-500 text-sm font-medium mb-2 block">Select date</label>
          <div className="flex items-center space-x-2">
            <button
              className="flex-1 p-2 border border-gray-300 rounded-md text-left text-gray-700"
              onClick={() => document.getElementById('datePicker').showPicker()}
            >
              {formatDate(date)}
            </button>
            <input
              type="date"
              id="datePicker"
              className="hidden"
              value={date.toISOString().split('T')[0]}
              onChange={(e) => setDate(new Date(e.target.value))}
            />
            <button
              onClick={setToday}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Today
            </button>
            <button
              onClick={setTomorrow}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-6"
        >
          Search Buses
        </button>

        {/* Location Status */}
        {isLoadingLocation ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
              <span className="font-semibold text-orange-800">Getting your location...</span>
            </div>
            <div className="text-sm text-orange-700 mt-1">
              Please allow location access to see nearby buses
            </div>
          </div>
        ) : userLocation ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-green-800">Location Found!</span>
            </div>
            <div className="text-sm text-green-700">
              Showing buses near your location
            </div>
          </div>
        ) : null}

        {/* Nearby Buses in Your Zone */}
        {nearbyBuses.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Buses in Your Zone
              </h3>
              <p className="text-sm text-gray-500 mt-1">Routes available near your location</p>
            </div>
            
            <div className="divide-y">
              {nearbyBuses.map((bus, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: bus.color }}
                      ></div>
                      <span className="font-semibold text-gray-800">Route {bus.route_id}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">₹{bus.fare}</div>
                      <div className="text-xs text-gray-500">{bus.estimatedTime} mins</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    Nearest stop: {bus.nearestStop} • {bus.distanceFromUser.toFixed(1)} km away
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {bus.stops.slice(0, 3).map((stop, stopIndex) => (
                      <span key={stopIndex} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {stop}
                      </span>
                    ))}
                    {bus.stops.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{bus.stops.length - 3} more stops
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => navigate('/bus-status', { 
                      state: { 
                        route: bus,
                        from: bus.nearestStop,
                        to: "Select destination"
                      }
                    })}
                    className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Track This Bus
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auto-fetched Routes */}
        {(isSearching || foundRoutes.length > 0) && (
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10z"/>
                </svg>
                Available Routes
                {isSearching && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                )}
              </h3>
            </div>
            
            {foundRoutes.length > 0 ? (
              <div className="divide-y">
                {foundRoutes.map((route, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: route.color }}
                        ></div>
                        <span className="font-semibold text-gray-800">Route {route.route_id}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">₹{route.fare}</div>
                        <div className="text-xs text-gray-500">{route.estimatedTime} mins</div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {route.stops.length} stops • {route.distance} stops apart
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {route.stops.slice(0, 3).map((stop, stopIndex) => (
                        <span key={stopIndex} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {stop}
                        </span>
                      ))}
                      {route.stops.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{route.stops.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => navigate('/bus-status', { 
                        state: { 
                          route: route,
                          from: from,
                          to: to
                        }
                      })}
                      className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Track This Route
                    </button>
                  </div>
                ))}
              </div>
            ) : !isSearching && from && to && (
              <div className="p-4 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No direct routes found between these stops</p>
                <p className="text-xs mt-1">Try nearby stops or different locations</p>
              </div>
            )}
          </div>
        )}

        {/* Recent Search / Upcoming */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b">
            <button className="flex-1 py-3 text-blue-600 border-b-2 border-blue-600 font-medium">
              Recent Search
            </button>
            <button className="flex-1 py-3 text-gray-500 hover:bg-gray-50 transition-colors">
              Upcoming trips
            </button>
          </div>

          {/* Recent Items */}
          <div className="divide-y">
            {recentSearches.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🚍</span>
                  <span className="text-gray-700">{item.route}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => deleteSearch(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchBus;