/// <reference path="../pb_data/types.js" />

// Migration script to create and update all required collections and fields for RouteSync2.0
module.exports = async function migrate(db) {
  // Helper to create or update a collection
  async function ensureCollection(name, schema, options = {}) {
    let coll = await db.collection(name).get();
    if (!coll) {
      coll = await db.collection(name).create({ schema, ...options });
    } else {
      await db.collection(name).update({ schema, ...options });
    }
  }

  // Buses
  await ensureCollection('buses', [
    { name: 'bus_number', type: 'text', required: true },
    { name: 'category', type: 'text' },
    { name: 'fare_amount', type: 'number' },
    { name: 'current_capacity', type: 'number' },
    { name: 'max_capacity', type: 'number' },
    { name: 'status', type: 'text' },
    { name: 'capacity_status', type: 'text' },
    { name: 'route_id', type: 'relation', collection: 'routes' },
    { name: 'service_type', type: 'text' },
    { name: 'last_updated', type: 'date' }
  ]);

  // Routes
  await ensureCollection('routes', [
    { name: 'name', type: 'text', required: true },
    { name: 'start_point', type: 'text' },
    { name: 'end_point', type: 'text' },
    { name: 'stops', type: 'json' },
    { name: 'distance', type: 'number' },
    { name: 'duration', type: 'number' }
  ]);

  // Tickets
  await ensureCollection('tickets', [
    { name: 'user_id', type: 'relation', collection: 'users' },
    { name: 'bus_id', type: 'relation', collection: 'buses' },
    { name: 'route_id', type: 'relation', collection: 'routes' },
    { name: 'fare', type: 'number' },
    { name: 'status', type: 'text' },
    { name: 'booking_time', type: 'date' },
    { name: 'seat_number', type: 'number' }
  ]);

  // Users
  await ensureCollection('users', [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'password', type: 'password', required: true },
    { name: 'avatar', type: 'file' },
    { name: 'phone', type: 'text' },
    { name: 'wallet_id', type: 'relation', collection: 'wallet' }
  ]);

  // Payments
  await ensureCollection('payments', [
    { name: 'user_id', type: 'relation', collection: 'users' },
    { name: 'amount', type: 'number' },
    { name: 'method', type: 'text' },
    { name: 'status', type: 'text' },
    { name: 'timestamp', type: 'date' },
    { name: 'ticket_id', type: 'relation', collection: 'tickets' }
  ]);

  // Notifications
  await ensureCollection('notifications', [
    { name: 'user', type: 'relation', collection: 'users' },
    { name: 'title', type: 'text' },
    { name: 'desc', type: 'text' },
    { name: 'icon', type: 'text' },
    { name: 'time', type: 'date' },
    { name: 'read', type: 'bool' }
  ]);

  // Wallet
  await ensureCollection('wallet', [
    { name: 'user', type: 'relation', collection: 'users' },
    { name: 'balance', type: 'number' },
    { name: 'last_updated', type: 'date' }
  ]);

  // Lost & Found
  await ensureCollection('lost_found', [
    { name: 'user', type: 'relation', collection: 'users' },
    { name: 'description', type: 'text' },
    { name: 'location', type: 'text' },
    { name: 'created', type: 'date' },
    { name: 'status', type: 'text' }
  ]);

  // Wishlist
  await ensureCollection('wishlist', [
    { name: 'user', type: 'relation', collection: 'users' },
    { name: 'busNumber', type: 'text' },
    { name: 'created', type: 'date' }
  ]);
};
