import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Boarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingDetails = location.state || {};
  const [boarding, setBoarding] = useState(null);
  const [dropping, setDropping] = useState(null);
  const [selectedBoarding, setSelectedBoarding] = useState(null);
  const [selectedDropping, setSelectedDropping] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState({
    fullName: '',
    email: '',
    mobile: '',
    age: '',
    gender: ''
  });

  // Define boarding points data
  const boardingPoints = [
    { id: 1, name: "KSRTC Bus Stand", time: "07:30", date: "05 Nov" },
    { id: 2, name: "Vytilla Hub", time: "07:30", date: "05 Nov" },
    { id: 3, name: "Palarivattom", time: "07:35", date: "05 Nov" },
    { id: 4, name: "Edapally", time: "07:40", date: "05 Nov" },
    { id: 5, name: "Kalamassery", time: "07:55", date: "05 Nov" },
    { id: 6, name: "Athani (EKM)", time: "08:15", date: "05 Nov" },
    { id: 7, name: "Atingal", time: "08:25", date: "05 Nov" },
  ];

  // Define dropping points data
  const droppingPoints = [
    { id: 1, name: "Thindivanam", time: "05:25", date: "06 Nov" },
    { id: 2, name: "Madhuranthagam", time: "06:05", date: "06 Nov" },
    { id: 3, name: "Chengalpettu", time: "06:25", date: "06 Nov" },
    { id: 4, name: "Mahendra City", time: "06:35", date: "06 Nov" },
    { id: 5, name: "Urapakkam", time: "06:55", date: "06 Nov" },
    { id: 6, name: "Kilambakkam Bus Stand", time: "07:05", date: "06 Nov" },
    { id: 7, name: "Koyambedu", time: "07:45", date: "06 Nov" },
  ];

  const handleContinue = () => {
    if (!selectedBoarding || !selectedDropping || !passengerDetails.fullName) {
      alert('Please fill all required details');
      return;
    }
    
    navigate('/payment', {
      state: {
        ...bookingDetails,
        boardingPoint: selectedBoarding,
        droppingPoint: selectedDropping,
        passengerDetails
      }
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
          <h2 className="text-lg font-semibold flex-1 text-center">Boarding & Passenger Details</h2>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Boarding Points */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="font-medium mb-3">Select Boarding Point</h3>
          <div className="space-y-2">
            {boardingPoints.map(point => (
              <button
                key={point.id}
                onClick={() => setSelectedBoarding(point)}
                className={`w-full p-3 rounded-lg text-left ${
                  selectedBoarding?.id === point.id
                    ? "bg-blue-50 border-2 border-blue-600"
                    : "border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{point.name}</span>
                  <span className="text-gray-500">{point.time}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dropping Points */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="font-medium mb-3">Select Dropping Point</h3>
          <div className="space-y-2">
            {droppingPoints.map(point => (
              <button
                key={point.id}
                onClick={() => setSelectedDropping(point)}
                className={`w-full p-3 rounded-lg text-left ${
                  selectedDropping?.id === point.id
                    ? "bg-blue-50 border-2 border-blue-600"
                    : "border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{point.name}</span>
                  <span className="text-gray-500">{point.time}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Passenger Details */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="font-medium mb-3">Passenger Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={passengerDetails.fullName}
                onChange={(e) => setPassengerDetails(prev => ({
                  ...prev,
                  fullName: e.target.value
                }))}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={passengerDetails.email}
                onChange={(e) => setPassengerDetails(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input
                type="tel"
                value={passengerDetails.mobile}
                onChange={(e) => setPassengerDetails(prev => ({
                  ...prev,
                  mobile: e.target.value
                }))}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  value={passengerDetails.age}
                  onChange={(e) => setPassengerDetails(prev => ({
                    ...prev,
                    age: e.target.value
                  }))}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={passengerDetails.gender}
                  onChange={(e) => setPassengerDetails(prev => ({
                    ...prev,
                    gender: e.target.value
                  }))}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default Boarding;