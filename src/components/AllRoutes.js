import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pb from "../services/pocketbase";

const AllRoutes = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch routes and buses from database
        const [routesResponse, busesResponse] = await Promise.all([
          pb.collection('routes').getFullList(),
          pb.collection('buses').getFullList()
        ]);

        setRoutes(routesResponse);
        setBuses(busesResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBusClick = (bus, route) => {
    navigate("/bus-status", {
      state: {
        bus: bus,
        from: route.start_point,
        to: route.end_point,
        route: route
      }
    });
  };

  // Filter routes based on search and filter
  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.start_point.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.end_point.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "active") {
      const routeBuses = buses.filter(bus => bus.route_id === route.id);
      return matchesSearch && routeBuses.length > 0;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 m-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading routes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 m-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Available Routes
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600">Live</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedFilter("active")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFilter === "active"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Active
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredRoutes.map((route) => {
          const routeBuses = buses.filter(bus => bus.route_id === route.id);
          
          return (
            <div key={route.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{route.name}</h4>
                  <p className="text-sm text-gray-600">
                    {route.start_point} → {route.end_point}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {routeBuses.length} bus{routeBuses.length !== 1 ? 'es' : ''}
                  </div>
                </div>
              </div>

              {routeBuses.length > 0 ? (
                <div className="space-y-2">
                  {routeBuses.slice(0, 2).map((bus) => (
                    <button
                      key={bus.id}
                      onClick={() => handleBusClick(bus, route)}
                      className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">
                            {bus.bus_number}
                          </div>
                          <div className="text-sm text-gray-600">
                            {bus.category || 'Non-AC'} • ₹{bus.fare_amount || '25'}
                          </div>
                        </div>
                        <div className="text-blue-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                  {routeBuses.length > 2 && (
                    <div className="text-sm text-gray-500 text-center">
                      +{routeBuses.length - 2} more buses
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-1H8V7z" />
                  </svg>
                  <p className="text-sm">No buses available</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredRoutes.length === 0 && routes.length > 0 && (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-3">No routes match your search</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedFilter("all");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Clear Filters
          </button>
        </div>
      )}

      {routes.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 013.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">No Routes Found</h4>
          <p className="text-gray-600">No bus routes are currently available.</p>
        </div>
      )}
    </div>
  );
};

export default AllRoutes;