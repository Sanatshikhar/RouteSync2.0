import { useState, useEffect } from 'react';
import pb from '../services/pocketbase';

const COLLECTION = 'notifications';

const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    pb.collection(COLLECTION).getFullList({ filter: `user="${userId}"` })
      .then(data => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch notifications');
        setLoading(false);
      });
  }, [userId]);

  const markAsRead = async (id) => {
    setLoading(true);
    try {
      await pb.collection(COLLECTION).update(id, { read: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to mark as read');
      setLoading(false);
    }
  };

  return { notifications, loading, error, markAsRead };
};

export default useNotifications;
