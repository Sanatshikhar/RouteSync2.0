import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PocketBase from "pocketbase";
import BottomNav from "../BottomNav";
import { useAuth } from "../../contexts/AuthContext";

// Initialize PocketBase client
const pb = new PocketBase(process.env.REACT_APP_POCKETBASE_URL || "http://127.0.0.1:8090");

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");
  const [nearbyRoutes, setNearbyRoutes] = useState([]); // Store nearby routes
  const [loadingNearby, setLoadingNearby] = useState(true); // Loading state for nearby routes
  const [searchValue, setSearchValue] = useState(""); // For location search
  const [locationName, setLocationName] = useState('Fetching...');
  const [recentSearches, setRecentSearches] = useState([]);

  // Fetch user's current location (city name)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        // Use a free reverse geocoding API (e.g. OpenStreetMap Nominatim)
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          setLocationName(data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Unknown');
        } catch {
          setLocationName('Unknown');
        }
      }, () => setLocationName('Unknown'));
    } else {
      setLocationName('Unknown');
    }
  }, []);

  // Fetch 3 nearby routes from PocketBase on mount
  useEffect(() => {
    const fetchNearbyRoutes = async () => {
      try {
        setLoadingNearby(true);
        // Fetch 3 bus routes collection
        const records = await pb.collection("routes").getList(1, 3, {
          sort: "-created",
          expand: "stops", // Expand stops relation if needed
        });
        setNearbyRoutes(records.items);
      } catch (error) {
        console.error("Error fetching nearby routes:", error);
      } finally {
        setLoadingNearby(false);
      }
    };

    fetchNearbyRoutes();
    
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Function to handle search and redirect
  const handleSearchRedirect = () => {
    if (searchValue.trim().toLowerCase() === 'admin') {
      navigate('/admin');
      return;
    }
    if (searchValue.trim()) {
      navigate("/search-bus", {
        state: {
          destination: searchValue,
        },
      });
    } else {
      navigate("/search-bus");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // Function to format stops from JSON
  const formatStops = (stops) => {
    if (!stops) return "No stops information";

    // If stops is a JSON string, parse it
    if (typeof stops === "string") {
      try {
        const parsedStops = JSON.parse(stops);
        if (Array.isArray(parsedStops)) {
          return parsedStops.map((stop) => stop.name || stop).join(" → ");
        }
        return "Invalid stops format";
      } catch (e) {
        // If parsing fails, return as is
        return stops;
      }
    }

    // If stops is already an array
    if (Array.isArray(stops)) {
      return stops.map((stop) => stop.name || stop).join(" → ");
    }

    return "No stops information";
  };

  return (
    <div className="min-h-screen bg-blue-600 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div>
              <p className="text-sm">Good morning</p>
              <p className="font-semibold">{user?.name || "User"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a5 5 0 015 5v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v2h6V7a3 3 0 00-3-3z" />
              </svg>
              <span>{locationName}</span>
            </div>
            <span>29°C</span>
            {/* Mobile: menu button */}
            <button
              className="block md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
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
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            {/* Mobile sidebar menu overlay */}
            {menuOpen && (
              <div className="fixed inset-0 z-50 bg-opacity-40 flex justify-end md:hidden">
                <div className="bg-white w-80 max-w-xs h-full shadow-lg p-6 flex flex-col overflow-y-auto">
                  <button
                    className="self-end mb-6 text-gray-500 hover:text-blue-600"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
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
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {/* Support & engagement */}
                  <div className="mb-2">
                    <button
                      className="w-full text-left font-semibold py-2 px-3 rounded hover:bg-blue-50 flex justify-between items-center text-blue-600"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "support" ? "" : "support"
                        )
                      }
                    >
                      Support & engagement
                      <span>{openDropdown === "support" ? "▲" : "▼"}</span>
                    </button>
                    {openDropdown === "support" && (
                      <div className="pl-4">
                        <button className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 text-blue-600">
                          Help & support
                        </button>
                        <button className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 text-blue-600">
                          Refer & feedback
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Alerts & account */}
                  <div className="mb-2">
                    <button
                      className="w-full text-left font-semibold py-2 px-3 rounded hover:bg-blue-50 flex justify-between items-center text-blue-600"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "alerts" ? "" : "alerts"
                        )
                      }
                    >
                      Alerts & account
                      <span>{openDropdown === "alerts" ? "▲" : "▼"}</span>
                    </button>
                    {openDropdown === "alerts" && (
                      <div className="pl-4">
                        <button className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 text-blue-600">
                          My account
                        </button>
                        <button className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 text-blue-600">
                          Emergency SOS
                        </button>
                        <button
                          className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 text-blue-600"
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
                  <div className="mb-2">
                    <button
                      className="w-full text-left font-semibold py-2 px-3 rounded hover:bg-blue-50 flex justify-between items-center text-blue-600"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "preference" ? "" : "preference"
                        )
                      }
                    >
                      User preference
                      <span>{openDropdown === "preference" ? "▲" : "▼"}</span>
                    </button>
                    {openDropdown === "preference" && (
                      <div className="pl-4">
                        <button className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 text-blue-600">
                          Change city
                        </button>
                        <button className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 text-blue-600">
                          Settings
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Essentials */}
                  <div className="mb-2">
                    <button
                      className="w-full text-left font-semibold py-2 px-3 rounded hover:bg-blue-50 flex justify-between items-center text-blue-600"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "essentials" ? "" : "essentials"
                        )
                      }
                    >
                      Essentials
                      <span>{openDropdown === "essentials" ? "▲" : "▼"}</span>
                    </button>
                    {openDropdown === "essentials" && (
                      <div className="pl-4">
                        <button
                          className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 text-blue-600"
                          onClick={() => {
                            setMenuOpen(false);
                            navigate("/lostFound");
                          }}
                        >
                          Lost & Found
                        </button>
                        <button className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 text-blue-600">
                          Booking
                        </button>
                        <button className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 text-blue-600">
                          Cancellations
                        </button>
                        <button
                          className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 text-blue-600"
                          onClick={() => {
                            setMenuOpen(false);
                            navigate("/wallet");
                          }}
                        >
                          Wallet
                        </button>
                        <button
                          className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 text-blue-600"
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

                  <div className="mt-8">
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
            {/* Desktop: logout button */}
            <button
              className="hidden md:block bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-700 hover:text-white transition-colors"
              onClick={handleLogout}
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search Bar - Modified to handle location input */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Enter Your Destination"
            className="w-full py-2 px-4 rounded-lg text-gray-800 bg-white"
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
            className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-100 rounded-t-3xl p-4">
        {/* Quick Actions Carousel */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => navigate("/search-bus")}
              className="flex-shrink-0 bg-blue-600 text-white p-4 rounded-xl min-w-[120px] text-center hover:bg-blue-700 transition-colors"
            >
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm font-medium">Search Bus</span>
            </button>
            <button
              onClick={() => navigate("/route-planner")}
              className="flex-shrink-0 bg-green-600 text-white p-4 rounded-xl min-w-[120px] text-center hover:bg-green-700 transition-colors"
            >
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 013.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="text-sm font-medium">All Routes</span>
            </button>
            <button
              onClick={() => navigate("/wallet")}
              className="flex-shrink-0 bg-orange-600 text-white p-4 rounded-xl min-w-[120px] text-center hover:bg-orange-700 transition-colors"
            >
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium">Wallet</span>
            </button>
          </div>
        </div>

        {/* Recent Searches Carousel */}
        {recentSearches.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Recent Searches</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
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

        {/* Nearby Stops Carousel */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Nearby Stops</h2>
          {loadingNearby ? (
            <div className="text-center py-4 text-gray-500">
              Loading nearby routes...
            </div>
          ) : nearbyRoutes.length === 0 ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {['Baramunda ISBT', 'Master Canteen', 'Nandankanan'].map((stop, index) => (
                <button
                  key={index}
                  onClick={() => navigate('/search-bus', { state: { from: stop } })}
                  className="flex-shrink-0 bg-white rounded-xl p-4 shadow-sm border min-w-[140px] hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-xs text-green-600">Near</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{stop}</p>
                  <p className="text-xs text-gray-500 mt-1">{Math.floor(Math.random() * 800) + 200}m away</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {nearbyRoutes.slice(0, 5).map((route) => (
                <button
                  key={route.id}
                  onClick={() => navigate('/search-bus', { state: { from: route.start_point } })}
                  className="flex-shrink-0 bg-white rounded-xl p-4 shadow-sm border min-w-[160px] hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-xs text-green-600">Nearby</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{route.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{route.start_point}</p>
                  <p className="text-xs text-gray-500">Next bus: 5 mins</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Offers and Coupons */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Offers and Coupons</h2>
          <div className="bg-green-50 rounded-xl p-4 mb-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Save upto Rs 200 on bus tickets</h3>
                <p className="text-sm text-gray-500">Valid till 30 Dec</p>
                <button
                  onClick={() => navigate("/list-bus")}
                  className="mt-2 bg-blue-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Book now
                </button>
              </div>
              <div className="w-24 h-16 bg-white rounded-lg shadow flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default HomePage;