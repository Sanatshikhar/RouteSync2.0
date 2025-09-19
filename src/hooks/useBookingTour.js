import { useEffect, useState } from 'react';
import { getBuses, getRoutes } from '../services/pocketbase';

export default function useBookingTour() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [busData, routeData] = await Promise.all([
          getBuses(),
          getRoutes()
        ]);
        setBuses(busData);
        setRoutes(routeData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { buses, routes, loading, error };
}
