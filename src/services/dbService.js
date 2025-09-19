import pb from './pocketbase';

class DatabaseService {
  // Get bus stop suggestions from database
  async getStopSuggestions(query) {
    if (!query || query.length < 2) return [];
    
    try {
      const routes = await pb.collection('routes').getFullList({
        filter: `start_point ~ "${query}" || end_point ~ "${query}" || stops ~ "${query}"`
      });
      
      const stops = new Set();
      routes.forEach(route => {
        if (route.start_point && route.start_point.toLowerCase().includes(query.toLowerCase())) {
          stops.add(route.start_point);
        }
        if (route.end_point && route.end_point.toLowerCase().includes(query.toLowerCase())) {
          stops.add(route.end_point);
        }
        // Parse stops array if it's a string
        let routeStops = [];
        if (typeof route.stops === 'string') {
          try {
            routeStops = JSON.parse(route.stops);
          } catch (e) {
            routeStops = route.stops.split(',').map(s => s.trim());
          }
        } else if (Array.isArray(route.stops)) {
          routeStops = route.stops;
        }
        
        routeStops.forEach(stop => {
          if (stop && stop.toLowerCase().includes(query.toLowerCase())) {
            stops.add(stop);
          }
        });
      });
      
      return Array.from(stops).slice(0, 10);
    } catch (error) {
      console.error('Error fetching stop suggestions:', error);
      return [];
    }
  }

  // Get coordinates for a stop (accurate coordinates)
  async getStopCoordinates(stopName) {
    // Accurate coordinates based on Google Maps
    const fallbackCoords = {
      'Master Canteen': { lat: 20.2961, lng: 85.8245 },
      'AIIMS Bhubaneswar': { lat: 20.2700, lng: 85.8400 },
      'Baramunda ISBT': { lat: 20.2500, lng: 85.8100 },
      'Baramunda': { lat: 20.2500, lng: 85.8100 },
      'Nandankanan': { lat: 20.3967, lng: 85.8156 },
      'Nandankana': { lat: 20.3967, lng: 85.8156 },
      'Airport': { lat: 20.2444, lng: 85.8178 },
      'Bhubaneswar Airport': { lat: 20.2444, lng: 85.8178 },
      'Dumduma': { lat: 20.3200, lng: 85.8300 },
      'Puri': { lat: 19.8135, lng: 85.8312 },
      'Cuttack': { lat: 20.4625, lng: 85.8828 },
      'Cuttack Main': { lat: 20.4625, lng: 85.8828 },
      'Cuttack mmain': { lat: 20.4625, lng: 85.8828 },
      'SCB Medical (Cuuttack)': { lat: 20.4625, lng: 85.8828 },
      'Acharya Vihar': { lat: 20.2750, lng: 85.8150 },
      'Acharya Vihar Square': { lat: 20.2750, lng: 85.8150 },
      'Lingipur': { lat: 20.2400, lng: 85.8450 },
      'Bhubaneswar Railway Station': { lat: 20.2500, lng: 85.8400 },
      'Bhubaneswwar Railway Station': { lat: 20.2500, lng: 85.8400 },
      'Sri Sri University': { lat: 20.3500, lng: 85.8200 },
      'Jagatpur': { lat: 20.2800, lng: 85.8600 },
      'OMP Square': { lat: 20.2900, lng: 85.8200 },
      'Khurda New Bus Stand': { lat: 20.1821, lng: 85.6186 },
      'Patia Square': { lat: 20.3600, lng: 85.8200 },
      'Puri Bus Staand': { lat: 19.8135, lng: 85.8312 },
      'Unit-1 Haat': { lat: 20.2700, lng: 85.8350 },
      'Jagannath Temple, Saleepur': { lat: 20.4000, lng: 85.9000 },
      'Kandarpur': { lat: 20.2200, lng: 85.7800 },
      'Pahala': { lat: 20.1800, lng: 85.7500 },
      'Phulnakhara': { lat: 20.2200, lng: 85.7800 },
      'Khandagiri': { lat: 20.1833, lng: 85.7500 },
      'Khandagiri Square': { lat: 20.1833, lng: 85.7500 },
      'Cuttack Badambadi': { lat: 20.4700, lng: 85.8900 },
      'CDA Cuttack': { lat: 20.4600, lng: 85.8800 }
    };
    
    // Try exact match first
    let coord = fallbackCoords[stopName];
    
    // If no exact match, try partial matching
    if (!coord) {
      const keys = Object.keys(fallbackCoords);
      const matchedKey = keys.find(key => 
        key.toLowerCase().includes(stopName.toLowerCase()) ||
        stopName.toLowerCase().includes(key.toLowerCase())
      );
      coord = matchedKey ? fallbackCoords[matchedKey] : { lat: 20.2961, lng: 85.8245 };
    }
    
    return coord;
  }

  // Calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Calculate route distance based on bus stops sequence
  async calculateRouteDistance(fromStop, toStop, routeStops) {
    try {
      if (!routeStops || routeStops.length < 2) {
        // Fallback to direct distance
        const fromCoords = await this.getStopCoordinates(fromStop);
        const toCoords = await this.getStopCoordinates(toStop);
        return this.calculateDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng);
      }

      // Find from and to stops in the route
      const fromIndex = routeStops.findIndex(stop => 
        stop.toLowerCase().includes(fromStop.toLowerCase()) ||
        fromStop.toLowerCase().includes(stop.toLowerCase())
      );
      const toIndex = routeStops.findIndex(stop => 
        stop.toLowerCase().includes(toStop.toLowerCase()) ||
        toStop.toLowerCase().includes(stop.toLowerCase())
      );

      if (fromIndex === -1 || toIndex === -1) {
        // Stops not found in route, use direct distance
        const fromCoords = await this.getStopCoordinates(fromStop);
        const toCoords = await this.getStopCoordinates(toStop);
        return this.calculateDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng);
      }

      // Calculate cumulative distance through stops
      const startIdx = Math.min(fromIndex, toIndex);
      const endIdx = Math.max(fromIndex, toIndex);
      let totalDistance = 0;

      for (let i = startIdx; i < endIdx; i++) {
        const currentStopCoords = await this.getStopCoordinates(routeStops[i]);
        const nextStopCoords = await this.getStopCoordinates(routeStops[i + 1]);
        
        if (currentStopCoords && nextStopCoords) {
          totalDistance += this.calculateDistance(
            currentStopCoords.lat, currentStopCoords.lng,
            nextStopCoords.lat, nextStopCoords.lng
          );
        } else {
          // If coordinates missing, estimate 2km per stop
          totalDistance += 2;
        }
      }

      return totalDistance;
    } catch (error) {
      console.error('Error calculating route distance:', error);
      // Fallback to direct distance
      const fromCoords = await this.getStopCoordinates(fromStop);
      const toCoords = await this.getStopCoordinates(toStop);
      return this.calculateDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng);
    }
  }

  // Calculate bus current position on route
  calculateBusPositionOnRoute(routeStops, currentStopIndex = 0, progressPercent = 0) {
    try {
      if (!routeStops || routeStops.length < 2) return null;
      
      const currentStopIdx = Math.min(currentStopIndex, routeStops.length - 1);
      const nextStopIdx = Math.min(currentStopIdx + 1, routeStops.length - 1);
      
      return {
        currentStop: routeStops[currentStopIdx],
        nextStop: routeStops[nextStopIdx],
        currentStopIndex: currentStopIdx,
        progressToNext: progressPercent, // 0-100% progress to next stop
        totalStops: routeStops.length
      };
    } catch (error) {
      console.error('Error calculating bus position:', error);
      return null;
    }
  }

  // Calculate ETA for bus to reach user's boarding stop
  async calculateETAToUserStop(userBoardingStop, busPosition, routeStops) {
    try {
      if (!busPosition || !routeStops) {
        return { eta: 15, distance: 5 }; // fallback
      }

      // Find user's boarding stop in route
      const userStopIndex = routeStops.findIndex(stop => 
        stop.toLowerCase().includes(userBoardingStop.toLowerCase()) ||
        userBoardingStop.toLowerCase().includes(stop.toLowerCase())
      );

      if (userStopIndex === -1) {
        return { eta: 15, distance: 5 }; // stop not found
      }

      const currentBusStopIndex = busPosition.currentStopIndex;
      
      // If bus already passed user's stop
      if (currentBusStopIndex > userStopIndex) {
        return { eta: 0, distance: 0, message: 'Bus has already passed this stop' };
      }

      // If bus is at user's stop
      if (currentBusStopIndex === userStopIndex) {
        const remainingTime = Math.round((1 - busPosition.progressToNext / 100) * 3); // 3 min per stop
        return { eta: Math.max(1, remainingTime), distance: 0.5, message: 'Bus is approaching your stop' };
      }

      // Calculate distance and time to user's stop
      let totalDistance = 0;
      let totalTime = 0;

      // Add remaining distance to next stop
      const currentStopCoords = await this.getStopCoordinates(routeStops[currentBusStopIndex]);
      const nextStopCoords = await this.getStopCoordinates(routeStops[currentBusStopIndex + 1]);
      
      if (currentStopCoords && nextStopCoords) {
        const segmentDistance = this.calculateDistance(
          currentStopCoords.lat, currentStopCoords.lng,
          nextStopCoords.lat, nextStopCoords.lng
        );
        const remainingInSegment = segmentDistance * (1 - busPosition.progressToNext / 100);
        totalDistance += remainingInSegment;
        totalTime += (remainingInSegment / 25) * 60; // 25 km/h average speed
      }

      // Add distance for intermediate stops
      for (let i = currentBusStopIndex + 1; i < userStopIndex; i++) {
        const stopCoords = await this.getStopCoordinates(routeStops[i]);
        const nextStopCoords = await this.getStopCoordinates(routeStops[i + 1]);
        
        if (stopCoords && nextStopCoords) {
          const segmentDistance = this.calculateDistance(
            stopCoords.lat, stopCoords.lng,
            nextStopCoords.lat, nextStopCoords.lng
          );
          totalDistance += segmentDistance;
          totalTime += (segmentDistance / 25) * 60; // 25 km/h + stop time
        }
        
        totalTime += 2; // 2 minutes stop time
      }

      return {
        eta: Math.round(totalTime),
        distance: totalDistance.toFixed(1),
        stopsAway: userStopIndex - currentBusStopIndex
      };
    } catch (error) {
      console.error('Error calculating ETA to user stop:', error);
      return { eta: 15, distance: 5 };
    }
  }

  // Find routes between stops
  async findRoutesBetweenStops(fromStop, toStop) {
    try {
      const routes = await pb.collection('routes').getFullList({
        filter: `(start_point ~ "${fromStop}" || stops ~ "${fromStop}") && (end_point ~ "${toStop}" || stops ~ "${toStop}")`
      });
      
      const processedRoutes = [];
      for (const route of routes) {
        let routeStops = [];
        if (typeof route.stops === 'string') {
          try {
            routeStops = JSON.parse(route.stops);
          } catch (e) {
            routeStops = route.stops.split(',').map(s => s.trim());
          }
        } else if (Array.isArray(route.stops)) {
          routeStops = route.stops;
        }
        
        // Calculate distance if not provided - use route-based calculation
        let distance = route.distance || 0;
        if (!distance || distance === 0) {
          // Use route stops for more accurate distance calculation
          distance = await this.calculateRouteDistance(route.start_point, route.end_point, routeStops);
        }
        
        processedRoutes.push({
          route_id: route.name || route.id,
          name: route.name,
          stops: routeStops,
          color: '#3B82F6',
          fare: 25,
          distance: distance,
          estimatedTime: route.duration || Math.round((distance / 30) * 60) // 30 km/h average
        });
      }
      
      return processedRoutes;
    } catch (error) {
      console.error('Error finding routes:', error);
      return [];
    }
  }
}

export default new DatabaseService();