import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../BottomNav';
import useWallet from '../../hooks/useWallet';

const AMOUNTS = [100, 200, 500, 1000, 2000];

const Wallet = () => {
  const navigate = useNavigate();
  const { wallet, loading, error, transactions, addMoney } = useWallet();
  const [selectedAmount, setSelectedAmount] = useState(AMOUNTS[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddMoney = async () => {
    if (!selectedAmount || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await addMoney(selectedAmount);
      alert('Money added successfully!');
    } catch (err) {
      alert('Failed to add money: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading wallet...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="text-white text-2xl font-bold"
          >
            &#8592;
          </button>
          <div>
            <h1 className="font-semibold text-lg">Wallet</h1>
            <p className="text-sm opacity-80">Manage your balance</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Available Balance</p>
          <p className="text-3xl font-bold mb-4">₹{wallet?.balance || 0}</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`py-2 rounded-lg text-sm font-medium border
                    ${selectedAmount === amount
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'}
                  `}
                >
                  ₹{amount}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddMoney}
              disabled={isProcessing}
              className={`w-full py-3 rounded-lg text-white font-medium
                ${isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
                transition-colors duration-200`}
            >
              {isProcessing ? 'Processing...' : `Add ₹${selectedAmount}`}
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-medium">
                      {transaction.ticket_id
                        ? `Ticket Booking - ${transaction.expand?.ticket_id?.bus_id}`
                        : transaction.method === 'deposit'
                        ? 'Wallet Top-up'
                        : 'Transaction'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={`font-medium ${
                    transaction.method === 'deposit'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {transaction.method === 'deposit' ? '+' : '-'}₹{transaction.amount}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
  {/* ...existing code... */}
  <BottomNav />
};

export default Wallet;