import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useBuses } from '../../hooks/useBuses';
import pb from '../../services/pocketbase';

const SearchBus = () => {
  const navigate = useNavigate();
  const { buses, loading, error, searchBuses } = useBuses();
  const [tripType, setTripType] = useState("oneway");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date());
  const [recentSearches, setRecentSearches] = useState([]);
  const [availableRoutes, setAvailableRoutes] = useState([]);

  useEffect(() => {
    // Load available routes for autocomplete
    const loadRoutes = async () => {
      try {
        const routes = await pb.collection('routes').getFullList();
        const uniqueLocations = new Set();
        routes.forEach(route => {
          uniqueLocations.add(route.start_point);
          uniqueLocations.add(route.end_point);
        });
        setAvailableRoutes(Array.from(uniqueLocations));
      } catch (err) {
        console.error('Error loading routes:', err);
      }
    };
    loadRoutes();

    // Load recent searches from local storage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearch = async () => {
    if (!from || !to) {
      alert('Please select both source and destination');
      return;
    }

    saveSearch();
    await searchBuses(from, to);
    navigate('/listBus', { 
      state: { 
        from, 
        to, 
        date, 
        buses,
        tripType 
      } 
    });
  };

  const saveSearch = () => {
    const newSearch = {
      id: Date.now(),
      route: `${from} → ${to}`,
      date: date.toISOString()
    };
    const updatedSearches = [newSearch, ...recentSearches].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const deleteSearch = (id) => {
    const updatedSearches = recentSearches.filter((item) => item.id !== id);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
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

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  const handleFromChange = (e) => {
    const value = e.target.value;
    setFrom(value);
    if (value.length > 0) {
      const matches = availableRoutes.filter(route => 
        route.toLowerCase().includes(value.toLowerCase())
      );
      setFromSuggestions(matches);
    } else {
      setFromSuggestions([]);
    }
  };

  const handleToChange = (e) => {
    const value = e.target.value;
    setTo(value);
    if (value.length > 0) {
      const matches = availableRoutes.filter(route => 
        route.toLowerCase().includes(value.toLowerCase())
      );
      setToSuggestions(matches);
    } else {
      setToSuggestions([]);
    }
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
        <div className="bg-blue-100 rounded-lg p-1 flex shadow-sm mb-4">
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
          <div className="relative">
            <label className="text-gray-500 text-sm font-medium mb-1 block">From</label>
            <input
              type="text"
              value={from}
              onChange={handleFromChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter source city"
            />
            {fromSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                {fromSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFrom(suggestion);
                      setFromSuggestions([]);
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative">
            <label className="text-gray-500 text-sm font-medium mb-1 block">To</label>
            <input
              type="text"
              value={to}
              onChange={handleToChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter destination city"
            />
            {toSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                {toSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setTo(suggestion);
                      setToSuggestions([]);
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
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
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
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