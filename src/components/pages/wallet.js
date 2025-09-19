import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useWallet from '../../hooks/useWallet';

const Wallet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wallet, loading, error, updateBalance } = useWallet(user?.id);
  const [amount, setAmount] = useState(0);

  const handleTopUp = (e) => {
    e.preventDefault();
    if (amount > 0) {
      updateBalance(amount);
      setAmount(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-md mx-auto flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold flex-1 text-center">Wallet</h2>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {loading && <div>Loading wallet...</div>}
        {error && <div className="text-red-500">Error: {error}</div>}
        {wallet && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="text-lg font-semibold mb-2">Balance</div>
            <div className="text-3xl font-bold text-blue-600 mb-4">₹ {wallet.balance}</div>
            <form onSubmit={handleTopUp} className="flex gap-2">
              <input
                type="number"
                min="1"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="border rounded px-3 py-2 flex-1"
                placeholder="Top-up amount"
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Top Up</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;