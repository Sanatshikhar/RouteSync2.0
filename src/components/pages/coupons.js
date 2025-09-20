import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../BottomNav';

const Coupons = () => {
  const navigate = useNavigate();

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
            <h1 className="font-semibold text-lg">Offers & Coupons</h1>
            <p className="text-sm opacity-80">Save more on your rides</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Weekly Pass Coupon */}
        <div className="bg-green-600 rounded-xl p-5 shadow-md text-white">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-bold">WEEKLY200</span>
              </div>
              <h3 className="font-bold text-2xl mb-1">₹200 OFF</h3>
              <p className="text-sm font-medium opacity-90">Weekly Bus Pass</p>
              <p className="text-xs opacity-80 mt-2 bg-white bg-opacity-20 rounded-full px-3 py-1 inline-block">Valid till 31 Dec • Min ₹500</p>
            </div>
            <div className="text-right">
              <button 
                onClick={() => navigate("/search-bus")}
                className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Claim Now
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Pass Coupon */}
        <div className="bg-blue-600 rounded-xl p-5 shadow-md text-white">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold">MONTHLY300</span>
              </div>
              <h3 className="font-bold text-2xl mb-1">₹300 OFF</h3>
              <p className="text-sm font-medium opacity-90">Monthly Bus Pass</p>
              <p className="text-xs opacity-80 mt-2 bg-white bg-opacity-20 rounded-full px-3 py-1 inline-block">Valid till 31 Dec • Min ₹1000</p>
            </div>
            <div className="text-right">
              <button 
                onClick={() => navigate("/search-bus")}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Claim Now
              </button>
            </div>
          </div>
        </div>

        {/* First Ride Coupon */}
        <div className="bg-gray-800 rounded-xl p-5 shadow-md text-white">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-bold">FIRST50</span>
              </div>
              <h3 className="font-bold text-2xl mb-1">₹50 OFF</h3>
              <p className="text-sm font-medium opacity-90">First Bus Ride</p>
              <p className="text-xs opacity-80 mt-2 bg-white bg-opacity-20 rounded-full px-3 py-1 inline-block">New users only • Min ₹100</p>
            </div>
            <div className="text-right">
              <button 
                onClick={() => navigate("/search-bus")}
                className="bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Claim Now
              </button>
            </div>
          </div>
        </div>

        {/* Student Discount Coupon */}
        <div className="bg-indigo-600 rounded-xl p-5 shadow-md text-white">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">STUDENT25</span>
              </div>
              <h3 className="font-bold text-2xl mb-1">25% OFF</h3>
              <p className="text-sm font-medium opacity-90">Student Discount</p>
              <p className="text-xs opacity-80 mt-2 bg-white bg-opacity-20 rounded-full px-3 py-1 inline-block">Student ID required • Max ₹100</p>
            </div>
            <div className="text-right">
              <button 
                onClick={() => navigate("/search-bus")}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Claim Now
              </button>
            </div>
          </div>
        </div>

        {/* Weekend Special Coupon */}
        <div className="bg-teal-600 rounded-xl p-5 shadow-md text-white">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <span className="bg-white text-teal-600 px-3 py-1 rounded-full text-xs font-bold">WEEKEND75</span>
              </div>
              <h3 className="font-bold text-2xl mb-1">₹75 OFF</h3>
              <p className="text-sm font-medium opacity-90">Weekend Special</p>
              <p className="text-xs opacity-80 mt-2 bg-white bg-opacity-20 rounded-full px-3 py-1 inline-block">Sat-Sun only • Min ₹300</p>
            </div>
            <div className="text-right">
              <button 
                onClick={() => navigate("/search-bus")}
                className="bg-white text-teal-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Claim Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-20"></div>
      
      <BottomNav />
    </div>
  );
};

export default Coupons;