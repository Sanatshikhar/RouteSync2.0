import { useEffect, useState } from 'react';
import { getBuses } from '../services/pocketbase';

export default function useLiveBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBuses() {
      setLoading(true);
      try {
        const data = await getBuses();
        setBuses(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBuses();
  }, []);

  return { buses, loading, error };
}
