import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useWishlist from '../../hooks/useWishlist';

const WishlistPage = () => {
  const { user } = useAuth();
  const { items, loading, error, addItem, removeItem } = useWishlist(user?.id);
  const [busNumber, setBusNumber] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (busNumber) {
      addItem({ busNumber });
      setBusNumber('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Wishlist</h1>
      <form onSubmit={handleAdd} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Bus number to add"
          value={busNumber}
          onChange={e => setBusNumber(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
            <span className="font-semibold">Bus: {item.busNumber}</span>
            <button className="text-xs text-red-600 bg-red-50 rounded px-2 py-1" onClick={() => removeItem(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WishlistPage;
