import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TicketConfirmation = ({ onViewTicket }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F8FB] px-4">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="bg-white rounded-full p-8 mb-6 shadow">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="40" fill="#E6F9EC"/><path d="M25 41.5L36.5 53L56 33.5" stroke="#22C55E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="text-center mb-8">
          <div className="text-lg font-semibold mb-2">Congratulation, your bus ticket is confirmed, download your ticket now.</div>
        </div>
      </div>
      <div className="w-full max-w-md flex flex-col gap-3 mb-4">
        <button className="w-full py-3 rounded-lg bg-white border text-gray-700 font-semibold" onClick={() => navigate(-1)}>Back</button>
        <button className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold" onClick={onViewTicket}>View Ticket</button>
      </div>
    </div>
  );
};

const TicketDetails = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F8FB] px-4">
    <div className="flex-1 flex flex-col items-center justify-center w-full">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-0 overflow-hidden mb-8">
        <div className="flex justify-between items-center bg-blue-600 text-white px-6 py-4">
          <div className="text-center">
            <div className="text-lg font-bold">EKM</div>
            <div className="text-xs opacity-80">Mon, 25 Nov</div>
          </div>
          <div className="text-2xl">→</div>
          <div className="text-center">
            <div className="text-lg font-bold">CHN</div>
            <div className="text-xs opacity-80">Tue, 26 Nov</div>
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-gray-500">Jayadovan</div>
            <div className="text-xs text-gray-500">BN-ERK-23215-0456</div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-xs text-gray-500">KSRTC Bus Stand</div>
            <div className="text-xs text-gray-500">Mahendra City</div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-lg font-bold">07:30 pm</div>
              <div className="text-xs text-gray-500">Departure</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-blue-600 font-semibold">11h 05m</div>
            </div>
            <div>
              <div className="text-lg font-bold">06:35 am</div>
              <div className="text-xs text-gray-500">Arrival</div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-xs text-gray-500">Seat Number</div>
              <div className="font-semibold">C 4</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Baggage</div>
              <div className="font-semibold">2 Bags</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Coach type</div>
              <div className="font-semibold">A/C</div>
            </div>
          </div>
          <div className="flex flex-col items-center mt-6 mb-2">
            <div className="text-xs text-gray-400 mb-1">Scan ticket</div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=BN-ERK-23215-0456" alt="QR Code" className="w-20 h-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="w-full max-w-md flex flex-col gap-3 mb-4">
      <button className="w-full py-3 rounded-lg bg-white border text-gray-700 font-semibold" onClick={() => window.location.href = '/livet_track'}>Check bus status</button>
      <button className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold">Download ticket</button>
    </div>
  </div>
);

const TicketPage = () => {
  const [showDetails, setShowDetails] = useState(false);
  const { id } = useParams();

  // You can fetch ticket details using id here if needed
  // For now, just pass id to TicketDetails for display
  return showDetails ? <TicketDetails ticketId={id} /> : <TicketConfirmation onViewTicket={() => setShowDetails(true)} />;
};

export default TicketPage;
