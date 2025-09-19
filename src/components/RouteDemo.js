import { useState } from 'react';
import Map from './Map';
import routingService from '../services/routingService';

const RouteDemo = () => {
  const [route, setRoute] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  // Demo route from Bhubaneswar Railway Station to Jagannath Temple, Puri
  const demoRoute = async () => {
    setIsLoading(true);
    try {
      const start = { lat: 20.2961, lng: 85.8245 }; // Bhubaneswar Railway Station
      const end = { lat: 19.8135, lng: 85.8312 };   // Jagannath Temple, Puri
      
      const routeData = await routingService.getRoute(start, end);
      setRoute(routeData.coordinates);
      setRouteInfo(routeData);
    } catch (error) {
      console.error('Error calculating demo route:', error);
      alert('Could not calculate demo route');
    } finally {
      setIsLoading(false);
    }
  };

  const clearRoute = () => {
    setRoute([]);
    setRouteInfo(null);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Odisha Route Demo</h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            <span className={`text-sm font-medium ${navigator.onLine ? 'text-green-600' : 'text-orange-600'}`}>
              {navigator.onLine ? 'Online Mode' : 'Offline Mode'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={demoRoute}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Calculating...' : 'Bhubaneswar → Puri Route'}
          </button>
          <button
            onClick={clearRoute}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Route
          </button>
        </div>
        
        {routeInfo && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <div className="text-sm space-y-1">
              <div><strong>Distance:</strong> {routingService.formatDistance(routeInfo.distance)}</div>
              <div><strong>Duration:</strong> {routingService.formatDuration(routeInfo.duration)}</div>
              <div><strong>Estimated Fare:</strong> <span className="text-green-600">₹{routingService.estimateIndianBusFare(routeInfo.distance)}</span></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Map
          center={[20.0500, 85.8300]} // Odisha center
          zoom={10}
          height={400}
          route={route}
          routeBounds={routeInfo?.bounds}
          startLocation={route.length > 0 ? { lat: 20.2961, lng: 85.8245, name: 'Bhubaneswar Railway Station' } : null}
          endLocation={route.length > 0 ? { lat: 19.8135, lng: 85.8312, name: 'Jagannath Temple, Puri' } : null}
          showAnimatedBus={route.length > 0}
        />
      </div>
    </div>
  );
};

export default RouteDemo;