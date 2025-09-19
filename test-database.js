// Simple test to check PocketBase connection
const PocketBase = require('pocketbase/cjs');

async function testDatabase() {
  const pb = new PocketBase('https://routesync.studentvault.xyz');
  
  try {
    console.log('Testing PocketBase connection...');
    
    // Test basic connection
    const health = await fetch('https://routesync.studentvault.xyz/api/health');
    console.log('Health check:', health.status);
    
    // Test without authentication first
    try {
      const buses = await pb.collection('buses').getFullList();
      console.log('✅ Buses collection accessible:', buses.length, 'records');
      
      // Show the actual bus data
      if (buses.length > 0) {
        console.log('📋 Sample bus data:');
        buses.forEach(bus => {
          console.log(`  🚌 ${bus.bus_number} - Route ${bus.route_id} - ${bus.category} - ₹${bus.fare_amount}`);
        });
      }
    } catch (busError) {
      console.log('❌ Buses collection error:', busError.message);
      
      if (busError.message.includes('authorization token')) {
        console.log('🔒 Collections require authentication or have restricted permissions');
        console.log('📝 Please check collection API rules in PocketBase admin dashboard');
      }
    }
    
    try {
      const routes = await pb.collection('routes').getFullList();
      console.log('✅ Routes collection accessible:', routes.length, 'records');
      
      // Show the actual route data
      if (routes.length > 0) {
        console.log('📋 Sample route data:');
        routes.forEach(route => {
          console.log(`  🛣️  Route ${route.name}: ${route.start_point} → ${route.end_point}`);
          console.log(`      Distance: ${route.distance}km, Duration: ${route.duration}min`);
          if (route.stops) {
            const stops = typeof route.stops === 'string' ? JSON.parse(route.stops) : route.stops;
            console.log(`      Stops: ${Array.isArray(stops) ? stops.slice(0, 3).join(', ') : 'N/A'}`);
          }
        });
      }
    } catch (routeError) {
      console.log('❌ Routes collection error:', routeError.message);
    }
    
    // List collections (this might also require auth)
    try {
      const collections = await pb.collections.getFullList();
      console.log('Available collections:', collections.map(c => c.name));
    } catch (collError) {
      console.log('Collections list error:', collError.message);
    }
    
  } catch (error) {
    console.error('Database test failed:', error.message);
  }
}

testDatabase();