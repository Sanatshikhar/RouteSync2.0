// PocketBase service for CRUD and auth
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090'); // Change to your PocketBase URL

export default pb;

// Example: Fetch all buses
export async function getBuses() {
  return await pb.collection('buses').getFullList();
}

// Example: Fetch all routes
export async function getRoutes() {
  return await pb.collection('routes').getFullList();
}

// Example: Create a booking
export async function createBooking(data) {
  return await pb.collection('seat_bookings').create(data);
}

// Example: Auth login
export async function login(email, password) {
  return await pb.collection('users').authWithPassword(email, password);
}
