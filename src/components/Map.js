import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="32" height="32">
      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// User location icon
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" width="24" height="24">
      <circle cx="12" cy="12" r="10" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Start location icon (green)
const startIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// End location icon (red)
const endIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Animated bus icon for route
const animatedBusIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="28" height="28">
      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
      <circle cx="12" cy="12" r="12" fill="none" stroke="#2563eb" stroke-width="1" opacity="0.3"/>
    </svg>
  `),
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

// Bus stop icon
const busStopIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6b7280" width="20" height="20">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Component to update map view when coordinates change
function MapUpdater({ center, zoom, bounds }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      // Fit map to route bounds
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, bounds, map]);
  
  return null;
}

// Animated bus marker component
function AnimatedBusMarker({ route, isAnimating }) {
  const map = useMap();
  const [currentPosition, setCurrentPosition] = useState(0);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!isAnimating || !route || route.length === 0) return;

    const animateMarker = () => {
      const totalPoints = route.length;
      const duration = 10000; // 10 seconds for full route
      const interval = duration / totalPoints;

      let currentIndex = 0;
      const timer = setInterval(() => {
        if (currentIndex >= totalPoints - 1) {
          clearInterval(timer);
          return;
        }

        const position = route[currentIndex];
        setCurrentPosition(currentIndex);
        
        if (markerRef.current) {
          markerRef.current.setLatLng(position);
        }

        currentIndex++;
      }, interval);

      return () => clearInterval(timer);
    };

    const cleanup = animateMarker();
    return cleanup;
  }, [route, isAnimating]);

  if (!route || route.length === 0) return null;

  return (
    <Marker
      position={route[currentPosition] || route[0]}
      icon={animatedBusIcon}
      ref={markerRef}
    >
      <Popup>
        <div className="text-sm">
          <div className="font-semibold">Bus Route</div>
          <div className="text-gray-600">Following planned route</div>
        </div>
      </Popup>
    </Marker>
  );
}

const Map = ({ 
  center = [20.2961, 85.8245], // Bhubaneswar, Odisha
  zoom = 12, // Zoom level suitable for city view
  height = 220,
  buses = [],
  route = [],
  userLocation = null,
  className = "",
  startLocation = null,
  endLocation = null,
  routeBounds = null,
  busStops = [],
  showAnimatedBus = false
}) => {
  const mapRef = useRef();

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapUpdater center={center} zoom={zoom} bounds={routeBounds} />
        
        {/* Route polyline - Google Maps style blue line */}
        {route && route.length > 1 && (
          <>
            {/* White outline for better visibility */}
            <Polyline
              positions={route}
              color="#ffffff"
              weight={8}
              opacity={0.8}
            />
            {/* Blue route line */}
            <Polyline
              positions={route}
              color="#4285f4"
              weight={6}
              opacity={0.9}
            />
          </>
        )}
        
        {/* Start location marker */}
        {startLocation && (
          <Marker
            position={[startLocation.lat, startLocation.lng]}
            icon={startIcon}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-green-600">Start</div>
                <div className="text-gray-600">{startLocation.name}</div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* End location marker */}
        {endLocation && (
          <Marker
            position={[endLocation.lat, endLocation.lng]}
            icon={endIcon}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-red-600">Destination</div>
                <div className="text-gray-600">{endLocation.name}</div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Bus stops along route */}
        {busStops.map((stop, index) => (
          <Marker
            key={`bus-stop-${index}`}
            position={[stop.lat, stop.lng]}
            icon={busStopIcon}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{stop.name}</div>
                <div className="text-gray-600">Bus Stop</div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Animated bus marker */}
        {showAnimatedBus && route && route.length > 1 && (
          <AnimatedBusMarker route={route} isAnimating={showAnimatedBus} />
        )}
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">Your Location</div>
                <div className="text-xs text-gray-600">
                  Accuracy: ±{Math.round(userLocation.accuracy)}m
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {buses.map((bus, index) => {
          if (bus.last_known_lat && bus.last_known_lng) {
            return (
              <Marker
                key={bus.id || index}
                position={[bus.last_known_lat, bus.last_known_lng]}
                icon={busIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{bus.bus_number}</div>
                    <div className="text-gray-600">{bus.Category}</div>
                    <div className="text-xs mt-1">
                      Status: <span className="font-medium">{bus.status}</span>
                    </div>
                    <div className="text-xs">
                      Capacity: {bus.current_capacity}/{bus.max_capacity}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};

export default Map;