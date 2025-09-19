import { useState, useEffect } from 'react';
import pb from '../services/pocketbase';
import { useAuth } from '../contexts/AuthContext';

export const useWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // Create a wallet if it doesn't exist
  const createWallet = async () => {
    try {
      const newWallet = await pb.collection('wallet').create({
        user: user.id,
        balance: 0,
        last_updated: new Date().toISOString()
      });
      return newWallet;
    } catch (err) {
      throw new Error('Failed to create wallet');
    }
  };

  const fetchWallet = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to get existing wallet
      let record;
      try {
        record = await pb.collection('wallet').getFirstListItem(`user="${user.id}"`);
      } catch (err) {
        // If wallet doesn't exist, create one
        if (err.status === 404) {
          record = await createWallet();
        } else {
          throw err;
        }
      }
      
      setWallet(record);

      // Fetch recent transactions
      const payments = await pb.collection('payments').getList(1, 20, {
        filter: `user_id="${user.id}"`,
        sort: '-timestamp',
        expand: 'ticket_id'
      });
      
      setTransactions(payments.items);
    } catch (err) {
      console.error('Error fetching wallet:', err);
      setError(err.message || 'Failed to fetch wallet');
    } finally {
      setLoading(false);
    }
  };

  const addMoney = async (amount) => {
    if (!user?.id) throw new Error('User not authenticated');
    if (!amount || amount <= 0) throw new Error('Invalid amount');
    if (!wallet?.id) throw new Error('Wallet not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      // Start a transaction-like operation
      const updatedWallet = await pb.collection('wallet').update(wallet.id, {
        balance: wallet.balance + amount,
        last_updated: new Date().toISOString()
      });

      const payment = await pb.collection('payments').create({
        user_id: user.id,
        wallet: wallet.id,
        amount: amount,
        method: 'deposit',
        status: 'completed',
        timestamp: new Date().toISOString()
      });

      setWallet(updatedWallet);
      setTransactions(prev => [payment, ...prev]);
      
      return { wallet: updatedWallet, payment };
    } catch (err) {
      console.error('Error adding money:', err);
      setError(err.message || 'Failed to add money');
      throw new Error(err.message || 'Failed to add money to wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchWallet();
    } else {
      // Reset state when user logs out
      setWallet(null);
      setTransactions([]);
      setError(null);
      setLoading(false);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    wallet,
    loading,
    error,
    transactions,
    addMoney,
    fetchWallet
  };
};

export default useWallet;
