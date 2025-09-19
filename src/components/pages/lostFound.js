import React, { useState } from 'react';
import useLostFound from '../../hooks/useLostFound';

const LostFoundPage = () => {
  const { items, loading, error, addItem } = useLostFound();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description && location) {
      addItem({ description, location });
      setDescription('');
      setLocation('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Lost & Found</h1>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Item description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <input
          type="text"
          placeholder="Location found/lost"
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.id} className="bg-white p-4 rounded shadow flex flex-col">
            <span className="font-semibold">{item.description}</span>
            <span className="text-sm text-gray-500">Location: {item.location}</span>
            <span className="text-xs text-gray-400">Reported: {item.created}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LostFoundPage;
