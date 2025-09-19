import { useState, useEffect } from 'react';
import axios from 'axios';

export function useBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBuses() {
      setLoading(true);
      try {
        // Replace with your actual API endpoint or PocketBase logic
        const response = await axios.get('/api/buses');
        setBuses(response.data);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBuses();
  }, []);

  // Optionally, add a searchBuses function for filtering
  function searchBuses(from, to, date) {
    return buses.filter(bus => {
      return (
        (!from || bus.from === from) &&
        (!to || bus.to === to) &&
        (!date || bus.date === date)
      );
    });
  }

  return { buses, loading, error, searchBuses };
}
