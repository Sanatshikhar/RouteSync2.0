import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import pb from "../../services/pocketbase";
import moBusService from "../../services/moBusService";
pb.autoCancellation(false);

const ListBus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { from, to, date, foundRoutes } = location.state || {};

  // Generate realistic bus schedules based on routes
  const generateBusSchedules = (routes) => {
    const schedules = [];
    const currentTime = new Date();

    routes.forEach((route, routeIndex) => {
      // Generate 3-5 buses per route with different timings
      const busCount = Math.floor(Math.random() * 3) + 3;

      for (let i = 0; i < busCount; i++) {
        const departureTime = new Date(currentTime);
        departureTime.setMinutes(
          currentTime.getMinutes() + i * 30 + Math.floor(Math.random() * 15)
        );

        const arrivalTime = new Date(departureTime);
        arrivalTime.setMinutes(
          departureTime.getMinutes() + route.estimatedTime
        );

        const busNumber = `OD-${String(routeIndex + 1).padStart(
          2,
          "0"
        )}-${String(1000 + i).slice(-3)}`;
        const crowdPercentage = Math.floor(Math.random() * 80) + 20; // 20-100%
        const isDelayed = Math.random() > 0.7; // 30% chance of delay
        const delayMinutes = isDelayed ? Math.floor(Math.random() * 15) + 5 : 0;

        schedules.push({
          id: `${route.route_id}-${i}`,
          bus_number: busNumber,
          route_id: route.route_id,
          route_color: route.color,
          category: Math.random() > 0.5 ? "AC" : "Non-AC",
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
          duration: `${route.estimatedTime} min`,
          distance: `${route.distance * 5} km`, // Approximate distance
          current_capacity: crowdPercentage,
          max_capacity: 100,
          status: isDelayed ? "Delayed" : "On Time",
          delay: delayMinutes,
          stops: route.stops,
          from_stop: from,
          to_stop: to,
          eta: isDelayed
            ? `${route.estimatedTime + delayMinutes} min`
            : `${route.estimatedTime} min`,
        });
      }
    });

    return schedules.sort((a, b) => {
      // Sort by departure time
      const timeA = new Date(`1970/01/01 ${a.departure_time}`);
      const timeB = new Date(`1970/01/01 ${b.departure_time}`);
      return timeA - timeB;
    });
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

        // Generate realistic bus schedules based on the routes
        if (routesToShow.length > 0) {
          const generatedBuses = generateBusSchedules(routesToShow);
          setBuses(generatedBuses);
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
                      <div className="text-xs text-gray-500">Crowd</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-800">
                        {bus.distance}
                      </div>
                      <div className="text-xs text-gray-500">Distance</div>
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
