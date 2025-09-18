import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

const SearchBus = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState("oneway");
  const [from, setFrom] = useState("Kochi");
  const [to, setTo] = useState("Chennai");
  const [date, setDate] = useState(new Date());
  const [recentSearches, setRecentSearches] = useState([
    { id: 1, route: "Kochi → Chennai" },
    { id: 2, route: "Thrissur → Aluva" },
  ]);

  const deleteSearch = (id) => {
    setRecentSearches(recentSearches.filter((item) => item.id !== id));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const setToday = () => {
    setDate(new Date());
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow);
  };

  const handleSearch = () => {
    // Save to recent searches
    const newSearch = {
      id: Date.now(),
      route: `${from} → ${to}`
    };
    setRecentSearches(prev => [newSearch, ...prev].slice(0, 5)); // Keep only last 5 searches
    
    // Navigate to list-bus with search params
    navigate('/list-bus', { 
      state: { from, to, date, tripType } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
          <h2 className="text-lg font-semibold flex-1 text-center">Select Bus Route</h2>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Trip Type */}
        <div className="bg-white rounded-lg p-1 flex shadow-sm mb-4">
          <button
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              tripType === "oneway"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setTripType("oneway")}
          >
            One way
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              tripType === "round"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setTripType("round")}
          >
            Round trip
          </button>
        </div>

        {/* From - To */}
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-4 mb-4">
          <div>
            <label className="text-gray-500 text-sm font-medium mb-1 block">From</label>
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter source city"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm font-medium mb-1 block">To</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter destination city"
            />
          </div>
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <label className="text-gray-500 text-sm font-medium mb-2 block">Select date</label>
          <div className="flex items-center space-x-2">
            <button
              className="flex-1 p-2 border border-gray-300 rounded-md text-left text-gray-700"
              onClick={() => document.getElementById('datePicker').showPicker()}
            >
              {formatDate(date)}
            </button>
            <input
              type="date"
              id="datePicker"
              className="hidden"
              value={date.toISOString().split('T')[0]}
              onChange={(e) => setDate(new Date(e.target.value))}
            />
            <button
              onClick={setToday}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={setTomorrow}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-6"
        >
          Search Buses
        </button>

        {/* Recent Search / Upcoming */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b">
            <button className="flex-1 py-3 text-blue-600 border-b-2 border-blue-600 font-medium">
              Recent Search
            </button>
            <button className="flex-1 py-3 text-gray-500 hover:bg-gray-50 transition-colors">
              Upcoming trips
            </button>
          </div>

          {/* Recent Items */}
          <div className="divide-y">
            {recentSearches.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🚍</span>
                  <span className="text-gray-700">{item.route}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => deleteSearch(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default SearchBus;