import { useState } from 'react';
import pb from '../services/pocketbase';
import { useAuth } from '../contexts/AuthContext';

export const useTickets = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const createTicket = async (busId, routeId, seatNumber, fare) => {
    setLoading(true);
    try {
      const ticket = await pb.collection('tickets').create({
        user_id: user.id,
        bus_id: busId,
        route_id: routeId,
        fare: fare,
        status: 'pending',
        booking_time: new Date().toISOString(),
        seat_number: seatNumber
      });

      // Create a payment record
      await pb.collection('payments').create({
        user_id: user.id,
        amount: fare,
        method: 'wallet',
        status: 'pending',
        timestamp: new Date().toISOString(),
        ticket_id: ticket.id
      });

      return ticket;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const confirmTicket = async (ticketId, paymentId) => {
    setLoading(true);
    try {
      await pb.collection('tickets').update(ticketId, {
        status: 'confirmed'
      });
      await pb.collection('payments').update(paymentId, {
        status: 'completed'
      });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelTicket = async (ticketId) => {
    setLoading(true);
    try {
      const ticket = await pb.collection('tickets').update(ticketId, {
        status: 'cancelled'
      });

      // Find and update the payment
      const payment = await pb.collection('payments').getFirstListItem(`ticket_id="${ticketId}"`);
      if (payment) {
        await pb.collection('payments').update(payment.id, {
          status: 'refunded'
        });

        // Refund to wallet
        const wallet = await pb.collection('wallet').getFirstListItem(`user="${user.id}"`);
        await pb.collection('wallet').update(wallet.id, {
          balance: wallet.balance + payment.amount,
          last_updated: new Date().toISOString()
        });
      }

      return ticket;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserTickets = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('tickets').getFullList({
        filter: `user_id="${user.id}"`,
        sort: '-booking_time',
        expand: 'bus_id,route_id'
      });
      return records;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTicketById = async (id) => {
    try {
      return await pb.collection('tickets').getOne(id, {
        expand: 'bus_id,route_id,user_id'
      });
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  return {
    loading,
    error,
    createTicket,
    confirmTicket,
    cancelTicket,
    getUserTickets,
    getTicketById
  };
};