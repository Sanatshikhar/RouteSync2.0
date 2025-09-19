import { useState, useEffect } from 'react';
import pb from '../services/pocketbase';

const COLLECTION = 'wishlist';

const useWishlist = (userId) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    pb.collection(COLLECTION).getFullList({ filter: `user="${userId}"` })
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch wishlist');
        setLoading(false);
      });
  }, [userId]);

  const addItem = async (item) => {
    setLoading(true);
    try {
      const created = await pb.collection(COLLECTION).create({ ...item, user: userId });
      setItems(prev => [created, ...prev]);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to add item');
      setLoading(false);
    }
  };

  const removeItem = async (id) => {
    setLoading(true);
    try {
      await pb.collection(COLLECTION).delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to remove item');
      setLoading(false);
    }
  };

  return { items, loading, error, addItem, removeItem };
};

export default useWishlist;
