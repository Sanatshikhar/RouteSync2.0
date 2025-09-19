import { useState, useEffect } from 'react';
import pb from '../services/pocketbase';

const COLLECTION = 'lost_found';

const useLostFound = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    pb.collection(COLLECTION).getFullList()
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch');
        setLoading(false);
      });
  }, []);

  const addItem = async (item) => {
    setLoading(true);
    try {
      const created = await pb.collection(COLLECTION).create(item);
      setItems(prev => [created, ...prev]);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to add item');
      setLoading(false);
    }
  };

  return { items, loading, error, addItem };
};

export default useLostFound;
