import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useBuses } from '../../hooks/useBuses';
import useGeolocation from '../../hooks/useGeolocation';
import moBusService from '../../services/moBusService';
import pb from '../../services/pocketbase';

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

  // Detect GPS location and get location name via reverse geocoding
  useEffect(() => {
    if (userLocation) {
      setIsLoadingLocation(false);
      console.log('GPS location detected:', userLocation);
      
      // Get location name from coordinates using reverse geocoding
      getLocationName(userLocation.lat, userLocation.lng);
    } else {
      // If location permission denied or not available, show manual option after timeout
      setTimeout(() => {
        setIsLoadingLocation(false);
      }, 5000);
    }
  }, [userLocation]);

  // Get location name from GPS coordinates
  const getLocationName = async (lat, lng) => {
    try {
      console.log('Getting location name for:', lat, lng);
      
      // Use Nominatim (OpenStreetMap) reverse geocoding API with more details
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en&zoom=18`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('Reverse geocoding result:', data);
        
        // Extract location name from the response
        const address = data.address || {};
        let locationName = '';
        
        // Priority order for location name extraction (most specific to least specific)
        // 1. Educational institutions, hospitals, landmarks
        if (address.university || address.college || address.school) {
          locationName = address.university || address.college || address.school;
        }
        // 2. Amenities (hospitals, malls, etc.)
        else if (address.amenity) {
          locationName = address.amenity;
        }
        // 3. Building or house name
        else if (address.building || address.house_name) {
          locationName = address.building || address.house_name;
        }
        // 4. Road name (if it's a well-known road)
        else if (address.road && !address.road.includes('Ward') && !address.road.includes('Block')) {
          locationName = address.road;
        }
        // 5. Commercial or residential area
        else if (address.commercial || address.residential) {
          locationName = address.commercial || address.residential;
        }
        // 6. Suburb or neighbourhood (avoid "Ward" names)
        else if (address.suburb && !address.suburb.includes('Ward')) {
          locationName = address.suburb;
        }
        else if (address.neighbourhood && !address.neighbourhood.includes('Ward')) {
          locationName = address.neighbourhood;
        }
        // 7. Village or hamlet
        else if (address.village || address.hamlet) {
          locationName = address.village || address.hamlet;
        }
        // 8. City or town
        else if (address.city || address.town) {
          locationName = address.city || address.town;
        }
        // 9. State district
        else if (address.state_district) {
          locationName = address.state_district;
        }
        // 10. Fallback to first part of display name (cleaned up)
        else {
          const displayParts = data.display_name?.split(',') || [];
          locationName = displayParts[0]?.trim() || 'Current Location';
          
          // If it's still a ward or block, try the second part
          if (locationName.includes('Ward') || locationName.includes('Block')) {
            locationName = displayParts[1]?.trim() || displayParts[0]?.trim() || 'Current Location';
          }
        }
        
        // Clean up the location name
        locationName = locationName.replace(/Ward \d+/gi, '').trim();
        locationName = locationName.replace(/Block \d+/gi, '').trim();
        
        // If location name is empty after cleanup, use fallback
        if (!locationName || locationName.length < 2) {
          locationName = address.city || address.town || 'Current Location';
        }
        
        console.log('Extracted location name:', locationName);
        
        // Auto-fill "From" field with location name if not already filled
        if (locationName && !from) {
          setFrom(locationName);
          console.log('Auto-filled "From" field with location name:', locationName);
        }
      } else {
        console.log('Reverse geocoding failed, using fallback');
        // Fallback to "Current Location" if API fails
        if (!from) {
          setFrom('Current Location');
        }
      }
    } catch (error) {
      console.error('Error getting location name:', error);
      // Fallback to "Current Location" if there's an error
      if (!from) {
        setFrom('Current Location');
      }
    }
  };



  const handleSearch = async () => {
    if (!from || !to) {
      alert('Please select both source and destination');
      return;
    }

    saveSearch();
    
    // Find routes between the selected stops from database
    let routes = [];
    try {
      const response = await pb.collection('routes').getFullList({
        filter: `start_point ~ "${from}" || end_point ~ "${from}" || start_point ~ "${to}" || end_point ~ "${to}"`,
        expand: 'stops'
      });
      
      routes = response.map(route => ({
        route_id: route.route_number || route.id,
        name: route.name,
        stops: Array.isArray(route.stops) ? route.stops : 
               typeof route.stops === 'string' ? JSON.parse(route.stops) : [],
        color: route.color || '#3B82F6',
        fare: route.fare || 25,
        distance: route.distance || 10,
        estimatedTime: route.estimated_time || 30
      }));
    } catch (dbError) {
      console.log('Database not available, using local routes:', dbError.message);
      routes = moBusService.findRoutesBetweenStops(from, to);
    }
    
    navigate('/listBus', { 
      state: { 
        from, 
        to, 
        date, 
        foundRoutes: routes,
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
      // First try to get routes from PocketBase database
      let routes = [];
      try {
        const response = await pb.collection('routes').getFullList({
          filter: `start_point ~ "${fromLocation}" || end_point ~ "${fromLocation}" || start_point ~ "${toLocation}" || end_point ~ "${toLocation}"`,
          expand: 'stops'
        });
        
        // Convert PocketBase routes to expected format
        routes = response.map(route => ({
          route_id: route.route_number || route.id,
          name: route.name,
          stops: Array.isArray(route.stops) ? route.stops : 
                 typeof route.stops === 'string' ? JSON.parse(route.stops) : [],
          color: route.color || '#3B82F6',
          fare: route.fare || 25,
          distance: route.distance || 10,
          estimatedTime: route.estimated_time || 30
        }));
        
        console.log(`Found ${routes.length} routes from database`);
      } catch (dbError) {
        console.log('Database not available, using local routes:', dbError.message);
        // Fallback to local data
        routes = moBusService.findRoutesBetweenStops(fromLocation, toLocation);
      }
      
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
            <div className="flex items-center gap-3 mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
              <span className="font-semibold text-orange-800">Getting your location...</span>
            </div>
            <div className="text-sm text-orange-700">
              Please allow location access or enter your location manually
            </div>
          </div>
        ) : userLocation ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-semibold text-green-800">Current Location Detected</span>
            </div>
            <div className="text-sm text-green-700">
              📍 Your GPS location: ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
              {from ? (
                <div className="mt-1 text-blue-600">
                  📍 Auto-filled current location: <strong>{from}</strong>
                </div>
              ) : (
                <div className="mt-1 text-orange-600">
                  🔄 Getting location name...
                </div>
              )}
            </div>
          </div>

        ) : !userLocation ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-semibold text-gray-800">Location Access Denied</span>
            </div>
            <div className="text-sm text-gray-600">
              Please allow location access or enter your source and destination manually
            </div>
          </div>
        ) : null}



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
                    
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => navigate('/bus-status', { 
                          state: { 
                            route: route,
                            from: from,
                            to: to
                          }
                        })}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Track Bus
                      </button>
                      <button 
                        onClick={() => navigate('/live-tracking', { 
                          state: { 
                            from: from,
                            to: to,
                            route: route
                          }
                        })}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        View Route
                      </button>
                    </div>
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