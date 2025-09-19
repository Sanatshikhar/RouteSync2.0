import { useState, useEffect } from 'react';
import pb from '../services/pocketbase';

const COLLECTION = 'wallet';

const useWallet = (userId) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    pb.collection(COLLECTION).getFirstListItem(`user="${userId}"`)
      .then(data => {
        setWallet(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch wallet');
        setLoading(false);
      });
  }, [userId]);

  const updateBalance = async (amount) => {
    if (!wallet) return;
    setLoading(true);
    try {
      const updated = await pb.collection(COLLECTION).update(wallet.id, { balance: wallet.balance + amount });
      setWallet(updated);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to update balance');
      setLoading(false);
    }
  };

  return { wallet, loading, error, updateBalance };
};

export default useWallet;
