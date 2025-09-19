import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PocketBase from "pocketbase";
import BottomNav from "../BottomNav";
import { useAuth } from "../../contexts/AuthContext";

// Initialize PocketBase client
const pb = new PocketBase("http://127.0.0.1:8090"); // Replace with your PocketBase URL

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");
  const [nearbyRoutes, setNearbyRoutes] = useState([]); // Store nearby routes
  const [loadingNearby, setLoadingNearby] = useState(true); // Loading state for nearby routes
  const [searchValue, setSearchValue] = useState(""); // For location search
  const [locationName, setLocationName] = useState('Fetching...');

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
    <div className="min-h-screen bg-blue-600">
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
            {/* Removed sidebar menu with only logout button as requested */}
          </div>
        </div>

        {/* Search Bar - Modified to handle location input */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search your bus routes"
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
        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="text-center">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-2 hover:shadow-md transition-shadow">
              <button
                onClick={() => navigate("/bus-status")}
                aria-label="Bus Status"
                className="w-full"
              >
                <svg
                  className="w-6 h-6 mx-auto text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
              </button>
            </div>
            <span className="text-xs font-medium">Bus Status</span>
          </div>
          <div className="text-center">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-2 hover:shadow-md transition-shadow">
              <button
                onClick={() => navigate("/route-planner")}
                aria-label="Route Planner"
                className="w-full"
              >
                <svg
                  className="w-6 h-6 mx-auto text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 013.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </button>
            </div>
            <span className="text-xs font-medium">Route Plan</span>
          </div>
          <div className="text-center">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-2 hover:shadow-md transition-shadow">
              <button
                onClick={() => navigate("/search-bus")}
                aria-label="Search Buses"
                className="w-full"
              >
                <svg
                  className="w-6 h-6 mx-auto text-purple-600"
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
            <span className="text-xs font-medium">Search Bus</span>
          </div>
          <div className="text-center">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-2 hover:shadow-md transition-shadow">
              <button 
                onClick={() => navigate("/wallet")} 
                aria-label="Wallet"
                className="w-full"
              >
                <svg
                  className="w-6 h-6 mx-auto text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </button>
            </div>
            <span className="text-xs font-medium">Wallet</span>
          </div>
        </div>

        {/* Feature Showcase - Route Planner */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-4 mb-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Smart Route Planner</h3>
              <p className="text-sm opacity-90 mb-3">
                Plan your journey with real-time routing and accurate ETAs
              </p>
              <button
                onClick={() => navigate("/route-planner")}
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors"
              >
                Plan Route
              </button>
            </div>
            <div className="ml-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 013.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Showcase - Live Bus Tracking */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Live Bus Tracking</h3>
              <p className="text-sm opacity-90 mb-3">
                Track your bus in real-time with our mobile interface
              </p>
              <button
                onClick={() => navigate("/bus-status")}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
              >
                Track Now
              </button>
            </div>
            <div className="ml-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Stops - Now fetching from PocketBase */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Nearby Stops</h2>
          {loadingNearby ? (
            <div className="text-center py-4 text-gray-500">
              Loading nearby routes...
            </div>
          ) : nearbyRoutes.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No nearby routes available.
            </div>
          ) : (
            nearbyRoutes.map((route) => (
              <div key={route.id} className="bg-white rounded-xl p-4 mb-3">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-medium">{route.name}</h3>
                    <p className="text-sm text-gray-500">
                      {route.start_point} → {route.end_point}
                    </p>
                    {/* Display stops in text form */}
                    <p className="text-sm text-gray-600 mt-1">
                      Stops: {formatStops(route.stops)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Next bus in 5 mins • 500 mtrs
                    </p>
                  </div>
                  {/* Book Bus Icon */}
                  <button
                    onClick={() => navigate(`/route/${route.id}`)}
                    className="ml-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="Book Bus"
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
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
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

        {/* Free space for bottom maps and easy scroll */}
        <div className="h-24 md:h-32 lg:h-40"></div>
        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default HomePage;
