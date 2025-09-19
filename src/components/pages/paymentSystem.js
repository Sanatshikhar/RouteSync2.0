import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import pb from '../../services/pocketbase';
import { useAuth } from '../../contexts/AuthContext';

const PAYMENT_METHODS = [
  {
    key: 'wallet',
    label: 'Wallet',
    desc: 'Pay using wallet balance',
    icon: '💳',
    recommended: true,
  },
  { key: 'card', label: 'Credit card/ Debit card', desc: 'Visa, Mastercard, and more', icon: '💳' },
  { key: 'netbanking', label: 'Net Banking', desc: 'Available for 40+ Banks', icon: '🏦' },
  { key: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm', icon: '�' },
];

const UPI_METHODS = [
  { key: 'gpay', label: 'Google Pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Google_Pay_Logo.svg' },
  { key: 'phonepe', label: 'PhonePe', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/55/PhonePe_Logo.png' },
  { key: 'paytm', label: 'Paytm', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Paytm_logo.png' },
  { key: 'phonepe', label: 'Phone pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/PhonePe_Logo.png' },
  { key: 'more', label: '+ 2 more', icon: '' },
];

const PaymentSystem = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { confirmTicket } = useTickets();
  const [selected, setSelected] = useState('wallet');
  const [loading, setLoading] = useState(false);
  const { ticket, bus, from, to, date, seatNumber } = location.state || {};

  const [wallet, setWallet] = useState(null);

  React.useEffect(() => {
    const fetchWallet = async () => {
      try {
        const walletRecord = await pb.collection('wallet').getFirstListItem(`user="${user.id}"`);
        setWallet(walletRecord);
      } catch (err) {
        console.error('Error fetching wallet:', err);
      }
    };
    fetchWallet();
  }, [user?.id]);

  const handlePayment = async () => {
    if (selected !== 'wallet') {
      alert('Only wallet payment is supported at the moment');
      return;
    }

    if (!wallet) {
      alert('Unable to fetch wallet information');
      return;
    }

    if (wallet.balance < ticket.fare) {
      alert('Insufficient balance in wallet');
      return;
    }

    setLoading(true);
    try {
      // Update wallet balance
      await pb.collection('wallet').update(wallet.id, {
        balance: wallet.balance - ticket.fare,
        last_updated: new Date().toISOString()
      });

      // Find and update payment record
      const payment = await pb.collection('payments').getFirstListItem(`ticket_id="${ticket.id}"`);
      const success = await confirmTicket(ticket.id, payment.id);

      if (success) {
        navigate('/ticket', { state: { ticketId: ticket.id } });
      } else {
        throw new Error('Failed to confirm ticket');
      }
    } catch (err) {
      alert('Payment failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!ticket || !bus) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Payment information not found</p>
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
            <h1 className="font-semibold text-lg">Payment</h1>
            <p className="text-sm opacity-80">Complete your booking</p>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="p-4 space-y-4">
        {/* Amount Card */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-sm text-gray-600 mb-1">Amount Payable</div>
          <div className="text-3xl font-bold">₹{ticket.fare}</div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <p className="text-gray-600">Bus Number</p>
              <p className="font-medium">{bus.bus_number}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Route</p>
              <p className="font-medium">{from} → {to}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Date</p>
              <p className="font-medium">{new Date(date).toLocaleDateString()}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Seat Number</p>
              <p className="font-medium">{seatNumber}</p>
            </div>
          </div>
        </div>

        {/* Wallet Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Wallet Balance</h2>
            {wallet?.balance < ticket.fare && (
              <button
                onClick={() => navigate('/wallet')}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg"
              >
                Add Money
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Available Balance</p>
              <p className="text-2xl font-semibold mt-1">₹{wallet?.balance || 0}</p>
            </div>
            {wallet && (
              <input
                type="radio"
                checked={selected === 'wallet'}
                onChange={() => setSelected('wallet')}
                className="accent-blue-600 w-5 h-5"
              />
            )}
          </div>
        </div>

        {/* Other Payment Methods */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Other Payment Methods</h2>
          <div className="space-y-4">
            {PAYMENT_METHODS.filter(m => m.key !== 'wallet').map(method => (
              <div key={method.key} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <p className="font-medium">{method.label}</p>
                    <p className="text-xs text-gray-500">{method.desc}</p>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={selected === method.key}
                  onChange={() => setSelected(method.key)}
                  className="accent-blue-600 w-5 h-5"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button
          onClick={handlePayment}
          disabled={loading || !wallet || wallet.balance < ticket.fare}
          className={`w-full py-3 rounded-lg text-white font-medium
            ${(!loading && selected === 'wallet' && wallet?.balance >= ticket.fare)
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400'}
            transition-colors duration-200`}
        >
          {loading
            ? 'Processing...'
            : !wallet
            ? 'Loading wallet...'
            : wallet.balance < ticket.fare
            ? 'Insufficient Balance'
            : `Pay ₹${ticket.fare}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentSystem;