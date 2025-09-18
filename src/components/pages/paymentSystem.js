import React, { useState } from 'react';

const AMOUNT = 1795;

const PAYMENT_METHODS = [
  {
    key: 'wallet',
    label: 'Wallet',
    desc: 'Balance 250/-',
    icon: '💳',
    recommended: true,
  },
  { key: 'card', label: 'Credit card/ Debit card', desc: 'Visa, Mastercard, and more', icon: '💳' },
  { key: 'netbanking', label: 'Net Banking', desc: 'Available for 40+ Banks', icon: '🏦' },
  { key: 'paylater', label: 'Pay Later', desc: 'HDFC, ICICI, IDFC and more', icon: '🕒' },
];

const UPI_METHODS = [
  { key: 'gpay', label: 'Gpay', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Google_Pay_Logo.svg' },
  { key: 'paytm', label: 'Paytm', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Paytm_logo.png' },
  { key: 'phonepe', label: 'Phone pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/PhonePe_Logo.png' },
  { key: 'more', label: '+ 2 more', icon: '' },
];

const PaymentSystem = () => {
  const [selected, setSelected] = useState('');
  const [walletActive, setWalletActive] = useState(false);

  const handleSelect = (key) => {
    setSelected(key);
    setWalletActive(key === 'wallet');
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="text-white text-2xl font-bold">&#8592;</button>
          <div>
            <div className="font-semibold text-lg">Payment method</div>
            <div className="text-xs opacity-80">Kochi → Chennai</div>
          </div>
        </div>
        <button className="text-white text-xl">&#8942;</button>
      </div>

      {/* Amount Payable */}
      <div className="bg-white rounded-xl shadow p-6 mx-4 mt-6 mb-2 flex flex-col items-center">
        <div className="text-xs text-gray-400 mb-1">Amount payable</div>
        <div className="text-2xl font-bold">₹ {AMOUNT}</div>
      </div>

      {/* Recommended */}
      <div className="bg-white rounded-xl shadow p-4 mx-4 mb-2">
        <div className="font-semibold mb-2">Recommended</div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💳</span>
            <span className="font-medium">Wallet</span>
            <span className="text-xs text-gray-400 ml-2">Balance 250/-</span>
          </div>
          <input
            type="radio"
            checked={selected === 'wallet'}
            onChange={() => handleSelect('wallet')}
            className="accent-blue-600 w-5 h-5"
          />
        </div>
        {walletActive && (
          <button className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold mb-2">Pay now</button>
        )}
      </div>

      {/* UPI Payment */}
      <div className="bg-white rounded-xl shadow p-4 mx-4 mb-2">
        <div className="font-semibold mb-2">UPI Payment</div>
        <div className="flex gap-4 items-center">
          {UPI_METHODS.map((m) => (
            <div key={m.key} className="flex flex-col items-center gap-1">
              {m.icon ? (
                <img src={m.icon} alt={m.label} className="w-8 h-8 object-contain rounded-full bg-white border" />
              ) : (
                <span className="w-8 h-8 flex items-center justify-center text-lg font-bold bg-gray-100 rounded-full">...</span>
              )}
              <span className="text-xs mt-1">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Other payment methods */}
      <div className="bg-white rounded-xl shadow p-4 mx-4 mb-4">
        <div className="font-semibold mb-2">Other payment methods</div>
        {PAYMENT_METHODS.filter(m => !m.recommended).map((m) => (
          <div key={m.key} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{m.icon}</span>
              <span className="font-medium">{m.label}</span>
              <span className="text-xs text-gray-400 ml-2">{m.desc}</span>
            </div>
            <input
              type="radio"
              checked={selected === m.key}
              onChange={() => handleSelect(m.key)}
              className="accent-blue-600 w-5 h-5"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentSystem;
