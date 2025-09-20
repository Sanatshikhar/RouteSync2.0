import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import pb from '../../services/pocketbase';
import BottomNav from "../BottomNav";
import { useAuth } from "../../contexts/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");
  const [nearbyRoutes, setNearbyRoutes] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [locationName, setLocationName] = useState('Fetching...');
  const [recentSearches, setRecentSearches] = useState([]);

  // Simplified location fetching for better performance
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            
            const addr = data.address || {};
            let locationName = '';
            
            if (data.name && data.name.length < 20) {
              locationName = data.name;
            } else if (addr.road && addr.road.length < 20) {
              locationName = addr.road;
            } else if (addr.neighbourhood && addr.neighbourhood.length < 20) {
              locationName = addr.neighbourhood;
            } else if (addr.city) {
              locationName = addr.city;
            } else {
              locationName = data.display_name?.split(',')[0] || 'Current Location';
            }
            
            locationName = locationName.replace(/Ward \d+/gi, '').trim();
            if (locationName.length > 15) {
              locationName = locationName.substring(0, 12) + '...';
            }
            
            setLocationName(locationName || 'Current Location');
          } catch (error) {
            console.error('Geocoding error:', error);
            setLocationName('Current Location');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationName('Location unavailable');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setLocationName('Geolocation not supported');
    }
  }, []);

  // Fetch nearby routes
  useEffect(() => {
    const fetchNearbyRoutes = async () => {
      try {
        setLoadingNearby(true);
        const records = await pb.collection("routes").getList(1, 3, {
          sort: "-created",
          expand: "stops",
        });
        setNearbyRoutes(records.items);
      } catch (error) {
        console.error("Error fetching nearby routes:", error);
      } finally {
        setLoadingNearby(false);
      }
    };

    fetchNearbyRoutes();
    
    // Load recent searches
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearchRedirect = () => {
    if (searchValue.trim().toLowerCase() === 'admin') {
      navigate('/admin');
      return;
    }
    if (searchValue.trim()) {
      navigate("/search-bus", {
        state: { destination: searchValue },
      });
    } else {
      navigate("/search-bus");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const formatStops = (stops) => {
    if (!stops) return "No stops information";

    if (typeof stops === "string") {
      try {
        const parsedStops = JSON.parse(stops);
        if (Array.isArray(parsedStops)) {
          return parsedStops.map((stop) => stop.name || stop).join(" → ");
        }
        return "Invalid stops format";
      } catch (e) {
        return stops;
      }
    }

    if (Array.isArray(stops)) {
      return stops.map((stop) => stop.name || stop).join(" → ");
    }

    return "No stops information";
  };

  return (
    <div className="min-h-screen bg-blue-600 overflow-y-auto">
      {/* Header */}
      <div className="bg-blue-600 text-white px-3 py-4 sm:px-4 lg:px-6">
        <div className="flex justify-between items-start mb-4">
          {/* Left side - Greeting */}
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-blue-100 mb-1">Good morning</p>
            <p className="font-semibold text-sm sm:text-base lg:text-lg truncate">
              {user?.name || "User"}
            </p>
          </div>

          {/* Right side - Location, Weather, Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Location - Hidden on very small screens */}
            <div className="hidden xs:flex items-center bg-white bg-opacity-20 rounded-lg px-2 py-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs max-w-16 sm:max-w-20 lg:max-w-32 truncate">
                {locationName}
              </span>
            </div>

            {/* Weather - Hidden on mobile */}
            <div className="hidden sm:flex items-center bg-white bg-opacity-20 rounded-lg px-2 py-1">
              <span className="text-xs lg:text-sm">29°C</span>
            </div>

            {/* Menu button */}
            <button
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop logout button */}
            <button
              className="hidden md:block bg-white text-blue-600 px-3 py-2 lg:px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm lg:text-base"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Enter Your Destination"
            className="w-full py-3 px-4 pr-12 rounded-xl text-gray-800 bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearchRedirect();
              }
            }}
          />
          <button
            onClick={handleSearchRedirect}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end md:hidden">
          <div className="bg-white w-full max-w-xs h-full shadow-xl p-4 flex flex-col overflow-y-auto">
            <button
              className="self-end mb-4 text-gray-500 hover:text-blue-600 p-2"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Menu Items */}
            <div className="space-y-2 flex-1">
              {/* Support & engagement */}
              <div>
                <button
                  className="w-full text-left font-semibold py-3 px-3 rounded-lg hover:bg-blue-50 flex justify-between items-center text-blue-600"
                  onClick={() => setOpenDropdown(openDropdown === "support" ? "" : "support")}
                >
                  Support & engagement
                  <span className="text-sm">{openDropdown === "support" ? "▲" : "▼"}</span>
                </button>
                {openDropdown === "support" && (
                  <div className="pl-4 space-y-1">
                    <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-600 text-sm">
                      Help & support
                    </button>
                    <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-600 text-sm">
                      Refer & feedback
                    </button>
                  </div>
                )}
              </div>

              {/* Alerts & account */}
              <div>
                <button
                  className="w-full text-left font-semibold py-3 px-3 rounded-lg hover:bg-blue-50 flex justify-between items-center text-blue-600"
                  onClick={() => setOpenDropdown(openDropdown === "alerts" ? "" : "alerts")}
                >
                  Alerts & account
                  <span className="text-sm">{openDropdown === "alerts" ? "▲" : "▼"}</span>
                </button>
                {openDropdown === "alerts" && (
                  <div className="pl-4 space-y-1">
                    <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-600 text-sm">
                      My account
                    </button>
                    <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-600 text-sm">
                      Emergency SOS
                    </button>
                    <button
                      className="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-600 text-sm"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/notifications");
                      }}
                    >
                      Notifications
                    </button>
                  </div>
                )}
              </div>

              {/* User preference */}
              <div>
                <button
                  className="w-full text-left font-semibold py-3 px-3 rounded-lg hover:bg-blue-50 flex justify-between items-center text-blue-600"
                  onClick={() => setOpenDropdown(openDropdown === "preference" ? "" : "preference")}
                >
                  User preference
                  <span className="text-sm">{openDropdown === "preference" ? "▲" : "▼"}</span>
                </button>
                {openDropdown === "preference" && (
                  <div className="pl-4 space-y-1">
                    <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-600 text-sm">
                      Change city
                    </button>
                    <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-600 text-sm">
                      Settings
                    </button>
                  </div>
                )}
              </div>

              {/* Essentials */}
              <div>
                <button
                  className="w-full text-left font-semibold py-3 px-3 rounded-lg hover:bg-blue-50 flex justify-between items-center text-blue-600"
                  onClick={() => setOpenDropdown(openDropdown === "essentials" ? "" : "essentials")}
                >
                  Essentials
                  <span className="text-sm">{openDropdown === "essentials" ? "▲" : "▼"}</span>
                </button>
                {openDropdown === "essentials" && (
                  <div className="pl-4 space-y-1">
                    <button
                      className="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-600 text-sm"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/lostFound");
                      }}
                    >
                      Lost & Found
                    </button>
                    <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-600 text-sm">
                      Booking
                    </button>
                    <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-600 text-sm">
                      Cancellations
                    </button>
                    <button
                      className="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-600 text-sm"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/wallet");
                      }}
                    >
                      Wallet
                    </button>
                    <button
                      className="w-full text-left py-2 px-3 rounded-lg hover:bg-blue-50 text-blue-600 text-sm"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/wishlist");
                      }}
                    >
                      Wishlist
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Logout button */}
            <div className="pt-4 border-t">
              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-gray-50 rounded-t-3xl px-3 py-4 sm:px-4 lg:px-6 min-h-screen">
        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <button
              onClick={() => navigate("/search-bus")}
              className="bg-blue-600 text-white p-4 rounded-xl text-center hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm font-medium">Search Bus</span>
            </button>
            <button
              onClick={() => navigate("/route-planner")}
              className="bg-green-600 text-white p-4 rounded-xl text-center hover:bg-green-700 transition-colors shadow-sm"
            >
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 013.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="text-sm font-medium">All Routes</span>
            </button>
            <button
              onClick={() => navigate("/wallet")}
              className="bg-orange-600 text-white p-4 rounded-xl text-center hover:bg-orange-700 transition-colors shadow-sm"
            >
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium">Wallet</span>
            </button>
            <button
              onClick={() => navigate("/live-track")}
              className="bg-purple-600 text-white p-4 rounded-xl text-center hover:bg-purple-700 transition-colors shadow-sm"
            >
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Live Track</span>
            </button>
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Recent Searches</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentSearches.slice(0, 5).map((search) => (
                <button
                  key={search.id}
                  onClick={() => {
                    const [from, to] = search.route.split(' → ');
                    navigate('/search-bus', { state: { from, to } });
                  }}
                  className="flex-shrink-0 bg-white rounded-xl p-3 shadow-sm border min-w-[160px] hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10z"/>
                    </svg>
                    <span className="text-xs text-gray-500">Recent</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 text-left">{search.route}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(search.date).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Stops */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Nearby Stops</h2>
          {loadingNearby ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Loading nearby routes...
            </div>
          ) : nearbyRoutes.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {['Baramunda ISBT', 'Master Canteen', 'Nandankanan'].map((stop, index) => (
                <button
                  key={index}
                  onClick={() => navigate('/search-bus', { state: { from: stop } })}
                  className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-xs text-green-600">Near</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 text-left">{stop}</p>
                  <p className="text-xs text-gray-500 mt-1">{Math.floor(Math.random() * 800) + 200}m away</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {nearbyRoutes.slice(0, 6).map((route) => (
                <button
                  key={route.id}
                  onClick={() => navigate('/search-bus', { state: { from: route.start_point } })}
                  className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-xs text-green-600">Nearby</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 text-left truncate">{route.name}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{route.start_point}</p>
                  <p className="text-xs text-gray-500">Next: 5 mins</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Offers and Coupons */}
        <div className="mb-20">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Offers & Coupons</h2>
          <div 
            onClick={() => navigate("/coupons")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 sm:p-6 text-white cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <div className="flex justify-between  items-center">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold mr-2">5 OFFERS</span>
                  <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">NEW</span>
                </div>
                <h3 className="font-bold text-xl sm:text-2xl mb-1">Up to ₹300 OFF</h3>
                <p className="text-sm font-medium opacity-90 mb-2">Exclusive Offers Available</p>
                <div className="flex items-center text-xs opacity-80">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Valid till Sept 30, 2025
                </div>
              </div>
              <div className="flex-shrink-0 ml-4 ">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
<div className="mb-[20%]"></div>
        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default HomePage;