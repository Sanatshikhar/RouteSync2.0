// Script to set up PocketBase with sample data
// Run this after creating the collections in PocketBase admin

const pb = require('./src/services/pocketbase');
// pb is imported from pocketbase.js

async function setupDatabase() {
  try {
    console.log('Setting up PocketBase database...');

    // Sample bus data for Route 26 (KHANDAGIRI → ITER)
    const sampleBuses = [
      {
        bus_number: 'OD-01-000',
        route_id: '26',
        category: 'AC',
        fare_amount: 5,
        current_capacity: 28,
        max_capacity: 45,
        status: 'On Time',
        departure_time: '09:21 PM',
        arrival_time: '09:56 PM',
        last_known_lat: 20.1833,
        last_known_lng: 85.75,
        last_location_update: new Date().toISOString()
      },
      {
        bus_number: 'OD-01-001',
        route_id: '26',
        category: 'Non-AC',
        fare_amount: 5,
        current_capacity: 30,
        max_capacity: 45,
        status: 'On Time',
        departure_time: '09:37 PM',
        arrival_time: '10:12 PM',
        last_known_lat: 20.1833,
        last_known_lng: 85.75,
        last_location_update: new Date().toISOString()
      },
      {
        bus_number: 'OD-01-002',
        route_id: '26',
        category: 'AC',
        fare_amount: 5,
        current_capacity: 35,
        max_capacity: 45,
        status: 'Delayed',
        departure_time: '10:05 PM',
        arrival_time: '10:45 PM',
        last_known_lat: 20.1900,
        last_known_lng: 85.7600,
        last_location_update: new Date().toISOString()
      }
    ];

    // Sample route data
    const sampleRoutes = [
      {
        route_number: '26',
        route_name: 'KHANDAGIRI - ITER COLLEGE',
        start_stop: 'KHANDAGIRI',
        end_stop: 'ITER COLLEGE',
        stops: ['KHANDAGIRI', 'JAGAMARA', 'ITER COLLEGE'],
        color: '#DAA520',
        distance: 14.8,
        estimated_time: 35
      },
      {
        route_number: '10',
        route_name: 'RBI - MASTER CANTEEN',
        start_stop: 'RBI AT/ANW PARK',
        end_stop: 'MASTER CANTEEN',
        stops: ['RBI AT/ANW PARK', 'STATE BANK SQUARE', 'JAYDEV VIHAR SQUARE', 'SUM HOSPITAL', 'INFOSYS SQUARE', 'KIIT SQUARE', 'NANDAN VIHAR', 'PATIA SQUARE', 'CHANDRASEKHAR PUR', 'DAMANA SQUARE', 'NALCO NAGAR', 'RASULGARH', 'VANIVIHAR', 'ACHARYA VIHAR', 'MASTER CANTEEN'],
        color: '#00CED1',
        distance: 25.5,
        estimated_time: 45
      }
    ];

    // Add buses to database
    console.log('Adding sample buses...');
    for (const bus of sampleBuses) {
      try {
        await pb.collection('buses').create(bus);
        console.log(`✅ Added bus: ${bus.bus_number}`);
      } catch (error) {
        console.log(`❌ Failed to add bus ${bus.bus_number}:`, error.message);
      }
    }

    // Add routes to database
    console.log('Adding sample routes...');
    for (const route of sampleRoutes) {
      try {
        await pb.collection('routes').create(route);
        console.log(`✅ Added route: ${route.route_number}`);
      } catch (error) {
        console.log(`❌ Failed to add route ${route.route_number}:`, error.message);
      }
    }

    console.log('✅ Database setup complete!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

// Run the setup
setupDatabase();