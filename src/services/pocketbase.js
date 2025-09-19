// PocketBase service for CRUD and auth
import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.REACT_APP_POCKETBASE_URL || 'http://127.0.0.1:8090');


export default pb;

// Example: Fetch all buses
export async function getBuses() {
  try {
    return await pb.collection('buses').getFullList();
  } catch (error) {
    console.error('PocketBase getBuses error:', error);
    throw new Error(`Database error: ${error.message}`);
  }
}

// Example: Fetch all routes
export async function getRoutes() {
  return await pb.collection('routes').getFullList();
}

// Example: Create a booking
export async function createBooking(data) {
  return await pb.collection('booking').create(data);
}

// Example: Auth login
export async function login(email, password) {
  return await pb.collection('users').authWithPassword(email, password);
}
