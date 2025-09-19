import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../BottomNav';

// Mock ticket data
const tickets = [
  {
    id: 'BN-ERK-23215-0456',
    operator: 'KSRTC (Kerala)',
    from: 'Kochi',
    to: 'Chennai',
    date: '25 Nov 2025',
    seatNo: '4C',
    status: 'confirmed',
  },
  {
    id: 'BN-ERK-23215-0457',
    operator: 'Kallada travels',
    from: 'Kochi',
    to: 'Bangalore',
    date: '10 Nov 2025',
    seatNo: '7A',
    status: 'completed',
  },
];

const TicketList = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between">
        <div className="font-semibold text-lg">Tickets</div>
      </div>
      <div className="min-h-screen bg-gray-50 p-4">
        <h2 className="text-lg font-semibold mb-4">Your Tickets</h2>
        {tickets.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No tickets found</div>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-blue-50"
                onClick={() => navigate(`/ticket/${ticket.id}`)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{ticket.operator}</h3>
                    <p className="text-sm text-gray-500">{ticket.date}</p>
                  </div>
                  <span className="text-xs text-gray-600">{ticket.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{ticket.from} → {ticket.to}</span>
                  <span className="text-sm text-gray-600">Seat: {ticket.seatNo}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
};

export default TicketList;
