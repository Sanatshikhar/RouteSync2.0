// Mo Bus Network Service for Bhubaneswar, Cuttack, Puri
class MoBusService {
  constructor() {
    this.networkData = {
      "network": "Mo Bus Network",
      "operator": "Capital Region Urban Transport (CRUT)",
      "coverage": ["Bhubaneswar", "Cuttack", "Puri"],
      "routes": [
        {
          "route_id": "10",
          "color": "#00CED1",
          "stops": ["RBI AT/ANW PARK", "STATE BANK SQUARE", "JAYDEV VIHAR SQUARE", "SUM HOSPITAL", "INFOSYS SQUARE", "KIIT SQUARE", "NANDAN VIHAR", "PATIA SQUARE", "CHANDRASEKHAR PUR", "DAMANA SQUARE", "NALCO NAGAR", "RASULGARH", "VANIVIHAR", "ACHARYA VIHAR", "MASTER CANTEEN"]
        },
        {
          "route_id": "11",
          "color": "#FF9999",
          "stops": ["LINGARAJ TEMPLE", "LINGIPUR", "SAMANTARAPUR", "NAGESWAR TANGI", "RAVI TALKIES", "BAPUJI NAGAR", "RAILWAY STATION", "CANTONMENT ROAD", "KHANNAGAR", "BADAMBADI", "LINK ROAD", "CUTTACK COLLECTORATE"]
        },
        {
          "route_id": "12",
          "color": "#800080",
          "stops": ["KHANDAGIRI", "KALINGA NAGAR", "KALINGA HOSPITAL", "ACHARYA VIHAR", "VANI VIHAR", "MASTER CANTEEN", "RAILWAY STATION", "NANDANKANAN ZOO"]
        },
        {
          "route_id": "20",
          "color": "#FF69B4",
          "stops": ["LINGARAJ TEMPLE", "AIRPORT", "BAPUJI NAGAR", "MASTER CANTEEN", "VANI VIHAR", "RASULGARH", "BALIA", "PHULNAKHARA", "JATNI", "KHURDA ROAD"]
        },
        {
          "route_id": "21",
          "color": "#FF0000",
          "stops": ["LINGIPUR", "SAMANTARAPUR", "NUAGAON", "SISHUPALGARH", "LINGARAJ TEMPLE", "BAPUJI NAGAR", "MASTER CANTEEN"]
        },
        {
          "route_id": "22",
          "color": "#32CD32",
          "stops": ["KHURDA ROAD", "JATNI", "KHANDAGIRI", "ACHARYA VIHAR", "MASTER CANTEEN", "CUTTACK BADAMBADI"]
        },
        {
          "route_id": "24/24A",
          "color": "#1E90FF",
          "stops": ["KHANDAGIRI", "SUM HOSPITAL", "ACHARYA VIHAR", "RASULGARH", "NANDANKANAN ZOO"]
        },
        {
          "route_id": "25",
          "color": "#008000",
          "stops": ["PHULNAKHARA", "BALIANTA", "RASULGARH", "VANI VIHAR", "MASTER CANTEEN", "AIRPORT"]
        },
        {
          "route_id": "26",
          "color": "#DAA520",
          "stops": ["KHANDAGIRI", "JAGAMARA", "ITER COLLEGE", "MASTER CANTEEN", "RAILWAY STATION"]
        },
        {
          "route_id": "27",
          "color": "#FF8C00",
          "stops": ["SUM HOSPITAL", "KHANDAGIRI", "ACHARYA VIHAR", "MASTER CANTEEN", "RAILWAY STATION"]
        },
        {
          "route_id": "28",
          "color": "#0000CD",
          "stops": ["GANAPATNA", "IIT SQUARE", "SUM HOSPITAL", "KALINGA HOSPITAL", "MASTER CANTEEN", "RAILWAY STATION"]
        }
      ]
    };

    // Create a comprehensive stops database with coordinates
    this.stopsDatabase = this.createStopsDatabase();
  }

  // Create stops database with estimated coordinates
  createStopsDatabase() {
    const stops = {
      // Major landmarks and stations
      "MASTER CANTEEN": { lat: 20.2961, lng: 85.8245, type: "major_hub" },
      "RAILWAY STATION": { lat: 20.2961, lng: 85.8245, type: "transport_hub" },
      "AIRPORT": { lat: 20.2444, lng: 85.8178, type: "transport_hub" },
      
      // Educational institutions
      "KIIT SQUARE": { lat: 20.3558, lng: 85.8180, type: "educational" },
      "IIT SQUARE": { lat: 20.1489, lng: 85.6753, type: "educational" },
      "ITER COLLEGE": { lat: 20.3200, lng: 85.8100, type: "educational" },
      
      // Hospitals
      "SUM HOSPITAL": { lat: 20.3500, lng: 85.8000, type: "medical" },
      "KALINGA HOSPITAL": { lat: 20.2800, lng: 85.8200, type: "medical" },
      
      // Religious places
      "LINGARAJ TEMPLE": { lat: 20.2370, lng: 85.8350, type: "religious" },
      "KHANDAGIRI": { lat: 20.1833, lng: 85.7500, type: "religious" },
      
      // Commercial areas
      "STATE BANK SQUARE": { lat: 20.2700, lng: 85.8300, type: "commercial" },
      "JAYDEV VIHAR SQUARE": { lat: 20.2900, lng: 85.8100, type: "commercial" },
      "INFOSYS SQUARE": { lat: 20.3400, lng: 85.8000, type: "commercial" },
      "PATIA SQUARE": { lat: 20.3600, lng: 85.8200, type: "commercial" },
      
      // Residential areas
      "BAPUJI NAGAR": { lat: 20.2600, lng: 85.8400, type: "residential" },
      "NANDAN VIHAR": { lat: 20.3300, lng: 85.8100, type: "residential" },
      "CHANDRASEKHAR PUR": { lat: 20.3300, lng: 85.7900, type: "residential" },
      "VANIVIHAR": { lat: 20.2800, lng: 85.8100, type: "residential" },
      "ACHARYA VIHAR": { lat: 20.2750, lng: 85.8150, type: "residential" },
      "DAMANA SQUARE": { lat: 20.3100, lng: 85.8300, type: "residential" },
      "NALCO NAGAR": { lat: 20.3000, lng: 85.8400, type: "residential" },
      
      // Industrial/IT areas
      "RASULGARH": { lat: 20.2900, lng: 85.8500, type: "industrial" },
      "KALINGA NAGAR": { lat: 20.2850, lng: 85.8250, type: "industrial" },
      
      // Cuttack areas
      "CUTTACK COLLECTORATE": { lat: 20.4625, lng: 85.8828, type: "government" },
      "BADAMBADI": { lat: 20.4700, lng: 85.8900, type: "commercial" },
      "CANTONMENT ROAD": { lat: 20.4600, lng: 85.8800, type: "commercial" },
      "KHANNAGAR": { lat: 20.4650, lng: 85.8850, type: "residential" },
      "LINK ROAD": { lat: 20.4680, lng: 85.8880, type: "commercial" },
      
      // Outer areas
      "KHURDA ROAD": { lat: 20.1821, lng: 85.6186, type: "transport_hub" },
      "JATNI": { lat: 20.1500, lng: 85.7000, type: "town" },
      "PHULNAKHARA": { lat: 20.2200, lng: 85.7800, type: "town" },
      "BALIA": { lat: 20.2400, lng: 85.8000, type: "residential" },
      "BALIANTA": { lat: 20.2300, lng: 85.8200, type: "residential" },
      
      // Other locations
      "RBI AT/ANW PARK": { lat: 20.3200, lng: 85.8300, type: "commercial" },
      "NANDANKANAN ZOO": { lat: 20.3967, lng: 85.8156, type: "tourist" },
      "LINGIPUR": { lat: 20.2400, lng: 85.8450, type: "residential" },
      "SAMANTARAPUR": { lat: 20.2350, lng: 85.8500, type: "residential" },
      "NAGESWAR TANGI": { lat: 20.2500, lng: 85.8600, type: "residential" },
      "RAVI TALKIES": { lat: 20.2550, lng: 85.8550, type: "commercial" },
      "NUAGAON": { lat: 20.2300, lng: 85.8400, type: "residential" },
      "SISHUPALGARH": { lat: 20.2250, lng: 85.8350, type: "residential" },
      "JAGAMARA": { lat: 20.1900, lng: 85.7600, type: "residential" },
      "GANAPATNA": { lat: 20.1800, lng: 85.7400, type: "residential" }
    };

    return stops;
  }

  // Get all routes
  getAllRoutes() {
    return this.networkData.routes;
  }

  // Get routes that pass through a specific stop
  getRoutesByStop(stopName) {
    const normalizedStop = stopName.toUpperCase();
    return this.networkData.routes.filter(route => 
      route.stops.some(stop => stop.includes(normalizedStop) || normalizedStop.includes(stop))
    );
  }

  // Get all unique stops
  getAllStops() {
    const allStops = new Set();
    this.networkData.routes.forEach(route => {
      route.stops.forEach(stop => allStops.add(stop));
    });
    return Array.from(allStops).map(stop => ({
      name: stop,
      coordinates: this.stopsDatabase[stop] || { lat: 20.2961, lng: 85.8245, type: "unknown" },
      routes: this.getRoutesByStop(stop).map(r => ({ id: r.route_id, color: r.color }))
    }));
  }

  // Find routes between two stops
  findRoutesBetweenStops(fromStop, toStop) {
    const normalizedFrom = fromStop.toUpperCase();
    const normalizedTo = toStop.toUpperCase();
    
    const validRoutes = [];
    
    this.networkData.routes.forEach(route => {
      const fromIndex = route.stops.findIndex(stop => 
        stop.includes(normalizedFrom) || normalizedFrom.includes(stop)
      );
      const toIndex = route.stops.findIndex(stop => 
        stop.includes(normalizedTo) || normalizedTo.includes(stop)
      );
      
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        const stopsInBetween = fromIndex < toIndex 
          ? route.stops.slice(fromIndex, toIndex + 1)
          : route.stops.slice(toIndex, fromIndex + 1).reverse();
        
        validRoutes.push({
          route_id: route.route_id,
          color: route.color,
          stops: stopsInBetween,
          distance: Math.abs(toIndex - fromIndex),
          estimatedTime: Math.abs(toIndex - fromIndex) * 3, // 3 minutes per stop
          fare: Math.max(5, Math.abs(toIndex - fromIndex) * 2) // ₹2 per stop, minimum ₹5
        });
      }
    });
    
    return validRoutes.sort((a, b) => a.distance - b.distance);
  }

  // Search stops by name
  searchStops(query) {
    if (!query || query.length < 2) return [];
    
    const normalizedQuery = query.toUpperCase();
    const allStops = this.getAllStops();
    
    return allStops.filter(stop => 
      stop.name.includes(normalizedQuery) || 
      normalizedQuery.includes(stop.name.split(' ')[0])
    ).slice(0, 10);
  }

  // Get stop details
  getStopDetails(stopName) {
    const normalizedStop = stopName.toUpperCase();
    const coordinates = this.stopsDatabase[normalizedStop];
    const routes = this.getRoutesByStop(stopName);
    
    return {
      name: normalizedStop,
      coordinates: coordinates || { lat: 20.2961, lng: 85.8245, type: "unknown" },
      routes: routes.map(r => ({ id: r.route_id, color: r.color, stops: r.stops })),
      nearbyStops: this.getNearbyStops(normalizedStop)
    };
  }

  // Get nearby stops
  getNearbyStops(stopName, radius = 2) {
    const stopCoords = this.stopsDatabase[stopName.toUpperCase()];
    if (!stopCoords) return [];
    
    const nearbyStops = [];
    Object.entries(this.stopsDatabase).forEach(([name, coords]) => {
      if (name !== stopName.toUpperCase()) {
        const distance = this.calculateDistance(
          stopCoords.lat, stopCoords.lng,
          coords.lat, coords.lng
        );
        if (distance <= radius) {
          nearbyStops.push({
            name,
            coordinates: coords,
            distance: distance.toFixed(1)
          });
        }
      }
    });
    
    return nearbyStops.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  // Calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get network info
  getNetworkInfo() {
    return {
      network: this.networkData.network,
      operator: this.networkData.operator,
      coverage: this.networkData.coverage,
      totalRoutes: this.networkData.routes.length,
      totalStops: this.getAllStops().length
    };
  }
}

export default new MoBusService();