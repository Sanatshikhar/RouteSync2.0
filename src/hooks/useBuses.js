import { useState, useEffect } from 'react';
import pb from '../services/pocketbase';

export const useBuses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('buses').getFullList({
        sort: '-created',
        expand: 'route_id',
      });
      setBuses(records);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchBuses = async (startPoint, endPoint) => {
    setLoading(true);
    try {
      const routes = await pb.collection('routes').getFullList({
        filter: `start_point~"${startPoint}" && end_point~"${endPoint}"`,
      });
      
      const routeIds = routes.map(route => route.id);
      if (routeIds.length === 0) {
        setBuses([]);
        return;
      }

      const busRecords = await pb.collection('buses').getFullList({
        filter: routeIds.map(id => `route_id="${id}"`).join('||'),
        expand: 'route_id',
      });
      
      setBuses(busRecords);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBusById = async (id) => {
    try {
      return await pb.collection('buses').getOne(id, {
        expand: 'route_id',
      });
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  return {
    buses,
    loading,
    error,
    fetchBuses,
    searchBuses,
    getBusById,
  };
};