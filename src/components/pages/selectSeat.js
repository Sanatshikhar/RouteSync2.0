import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import { useAuth } from '../../contexts/AuthContext';
import pb from '../../services/pocketbase';

const SelectSeat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createTicket } = useTickets();
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const { bus, from, to, date } = location.state || {};

  useEffect(() => {
    const fetchOccupiedSeats = async () => {
      try {
        const records = await pb.collection('tickets').getFullList({
          filter: `bus_id="${bus.id}" && status="confirmed"`,
        });
        setOccupiedSeats(records.map(ticket => ticket.seat_number));
      } catch (err) {
        console.error('Error fetching occupied seats:', err);
      }
    };
    fetchOccupiedSeats();
  }, [bus.id]);

  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedSeats, setSelectedSeats] = useState([]);

  const isReserved = (berth, row, col) =>
    RESERVED.some(s => s.berth === berth && s.row === row && s.col === col);

  const isSelected = (berth, row, col) =>
    selectedSeats.some(s => s.berth === berth && s.row === row && s.col === col);

  const handleSeatClick = (berth, row, col, price) => {
    if (isReserved(berth, row, col)) return;
    const seat = { berth, row, col };
    if (isSelected(berth, row, col)) {
      setSelectedSeats(selectedSeats.filter(s => !(s.berth === berth && s.row === row && s.col === col)));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const renderSeats = (berth, layout) => (
    <div className="flex flex-col gap-2">
      {layout.map((rowArr, rowIdx) => (
        <div key={rowIdx} className="flex gap-2">
          {rowArr.map((price, colIdx) => {
            if (price === null) {
              // Render steering wheel for first cell
              return (
                <div key={colIdx} className="w-8 h-8 flex items-center justify-center">
                  {rowIdx === 0 && colIdx === 0 ? (
                    <span className="text-2xl">&#128663;</span>
                  ) : null}
                </div>
              );
            }
            // Price filter
            if (selectedPrice !== 'All' && price !== selectedPrice) {
              return <div key={colIdx} className="w-8 h-8" />;
            }
            const reserved = isReserved(berth, rowIdx, colIdx);
            const selected = isSelected(berth, rowIdx, colIdx);
            return (
              <button
                key={colIdx}
                className={`w-12 h-8 rounded flex items-center justify-center border text-xs font-semibold
                  ${reserved ? 'bg-gray-300 text-gray-400 border-gray-300' :
                    selected ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-400 hover:bg-blue-50'}
                `}
                disabled={reserved}
                onClick={() => handleSeatClick(berth, rowIdx, colIdx, price)}
              >
                ₹ {price}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="text-white text-2xl font-bold">&#8592;</button>
          <div>
            <div className="font-semibold text-lg">Select Seat</div>
            <div className="text-xs opacity-80">KSRTC (Kerala) - 2396</div>
          </div>
        </div>
        <button className="text-white text-xl">&#9881;</button>
      </div>

      {/* Price Filter */}
      <div className="bg-white px-4 py-2 flex gap-2 border-b">
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${selectedPrice === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setSelectedPrice('All')}
        >
          All Prices
        </button>
        {SEAT_PRICES.map(price => (
          <button
            key={price}
            className={`px-3 py-1 rounded-full text-sm font-medium ${selectedPrice === price ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setSelectedPrice(price)}
          >
            ₹ {price}
          </button>
        ))}
      </div>

      {/* Seat Layout */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="flex gap-8 bg-white rounded-2xl p-4 shadow-md">
          {/* Lower Berth */}
          <div className="flex flex-col items-center">
            <div className="font-semibold mb-1">Lower berth</div>
            <div className="text-xs text-gray-400 mb-2">12 Seats left</div>
            {renderSeats('lower', LOWER_BERTH)}
          </div>
          {/* Upper Berth */}
          <div className="flex flex-col items-center">
            <div className="font-semibold mb-1">Upper berth</div>
            <div className="text-xs text-gray-400 mb-2">08 Seats left</div>
            {renderSeats('upper', UPPER_BERTH)}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 py-3 bg-white border-t">
        <div className="flex items-center gap-1">
          <span className="w-5 h-5 rounded bg-white border border-gray-400 inline-block"></span>
          <span className="text-xs text-gray-500 ml-1">Available</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-5 h-5 rounded bg-gray-300 border border-gray-300 inline-block"></span>
          <span className="text-xs text-gray-500 ml-1">Reserved</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-5 h-5 rounded bg-green-100 border border-green-500 inline-block"></span>
          <span className="text-xs text-gray-500 ml-1">Selected</span>
        </div>
      </div>
    </div>
  );
};

export default SelectSeat;
