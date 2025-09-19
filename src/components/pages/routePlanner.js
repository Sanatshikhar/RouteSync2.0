import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoutePlanner from '../RoutePlanner';
import Map from '../Map';
import useGeolocation from '../../hooks/useGeolocation';

const RoutePlannerPage = () => {
  const navigate = useNavigate();
  const { location: userLocation } = useGeolocation();
  const [routeData, setRouteData] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.2961, 85.8245]); // Default to Bhubaneswar

  // Handle route calculation
  const handleRouteCalculated = (route, start, end) => {
    console.log('Route calculated:', route);
    setRouteData(route);
    setStartLocation(start);
    setEndLocation(end);
    
    // Update map center to show the route
    if (start && start.lat && start.lng) {
      setMapCenter([start.lat, start.lng]);
    }
  };

  // Handle location selection
  const handleLocationSelect = (type, location) => {
    console.log(`${type} location selected:`, location);
    if (type === 'start') {
      setStartLocation(location);
      if (location.lat && location.lng) {
        setMapCenter([location.lat, location.lng]);
      }
    } else if (type === 'end') {
      setEndLocation(location);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold flex-1 text-center">Route Planner</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Route Planner Component */}
          <div className="order-2 xl:order-1">
            <div className="sticky top-24">
              <RoutePlanner
                onRouteCalculated={handleRouteCalculated}
                onLocationSelect={handleLocationSelect}
              />
            </div>
            
            {/* Route Actions */}
            {routeData && (
              <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Next Steps
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/search-bus', {
                      state: {
                        from: startLocation?.name,
                        to: endLocation?.name,
                        routeData: routeData
                      }
                    })}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10z"/>
                    </svg>
                    Find Buses for This Route
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/listBus', {
                        state: {
                          from: startLocation?.name,
                          to: endLocation?.name,
                          routeData: routeData
                        }
                      })}
                      className="bg-green-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Buses
                    </button>
                    
                    <button
                      onClick={() => {
                        // Share route functionality
                        if (navigator.share) {
                          navigator.share({
                            title: 'My Route Plan',
                            text: `Route from ${startLocation?.name} to ${endLocation?.name}`,
                            url: window.location.href
                          });
                        } else {
                          // Fallback: copy to clipboard
                          navigator.clipboard.writeText(
                            `Route from ${startLocation?.name} to ${endLocation?.name} - ${window.location.href}`
                          );
                          alert('Route link copied to clipboard!');
                        }
                      }}
                      className="bg-gray-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map Component */}
          <div className="order-1 xl:order-2">
            <div className="bg-white rounded-lg shadow-lg p-4 sticky top-24">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 013.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Route Map
              </h3>
              
              <div className="relative">
                <Map
                  center={mapCenter}
                  zoom={13}
                  height={window.innerWidth < 1280 ? 300 : 450}
                  userLocation={userLocation}
                  route={routeData?.coordinates || []}
                  startLocation={startLocation}
                  endLocation={endLocation}
                  className="w-full rounded-lg border"
                />
                
                {/* Map Controls */}
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 space-y-2">
                  <button
                    onClick={() => {
                      if (userLocation) {
                        setMapCenter([userLocation.lat, userLocation.lng]);
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Center on my location"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  
                  {routeData && (
                    <button
                      onClick={() => {
                        // Fit map to show entire route
                        if (startLocation && endLocation) {
                          const centerLat = (startLocation.lat + endLocation.lat) / 2;
                          const centerLng = (startLocation.lng + endLocation.lng) / 2;
                          setMapCenter([centerLat, centerLng]);
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Fit route to view"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Route Summary */}
              {routeData && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="font-semibold text-blue-800">
                          {routeData.duration ? Math.round(routeData.duration / 60) : 'N/A'} min
                        </div>
                        <div className="text-blue-600">Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-800">
                          {routeData.distance ? (routeData.distance / 1000).toFixed(1) : 'N/A'} km
                        </div>
                        <div className="text-blue-600">Distance</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      routeData.source === 'openrouteservice' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {routeData.source === 'openrouteservice' ? '🌐 Live' : '📱 Offline'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlannerPage;