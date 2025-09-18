import React from 'react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const navigate = useNavigate();
const [tab, setTab] = React.useState('View All');
  const notificationsToday = [
    {
      title: 'Bus arrival update',
      desc: <span>Your bus has reached <b>Vazhakkala</b> and will arrive at <b>Pipeline JN</b> in <b>10 minutes!</b></span>,
      time: '1 min',
      icon: '🔔',
    },
    {
      title: 'Traffic Update',
      desc: <span>Heavy traffic at <b>Padamugal</b>. The Perumbavoor-Kaloor bus will reach <b>Pipeline Junction</b> in <b>10 mins!</b></span>,
      time: '10 min',
      icon: '🚦',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-blue-400 text-white px-4 py-4 flex items-center justify-between">
        <button className="text-white text-2xl font-bold" onClick={() => navigate(-1)}>&#8592;</button>
        <div className="font-semibold text-lg">Notifications</div>
        <button className="text-white text-xl">&#8942;</button>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-md flex gap-2 px-4 py-3 bg-white border-b">
        {['View All', 'Unread', 'Trip updates', 'Offers'].map((t) => (
          <button
            key={t}
            className={`px-3 py-1 rounded-full text-sm font-medium ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="w-full max-w-md flex-1 px-4 py-2">
        <div className="text-xs text-gray-400 mt-2 mb-1">Today</div>
        {notificationsToday.map((n, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-4 mb-3 flex items-start gap-3 relative">
            <div className="text-2xl mt-1">{n.icon}</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 mb-1 text-sm">{n.title}</div>
              <div className="text-xs text-gray-600">{n.desc}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-xs text-gray-400 whitespace-nowrap">{n.time}</div>
              <button className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">Mark as read</button>
            </div>
          </div>
        ))}
        <div className="text-xs text-gray-400 mt-6 mb-1">Yesterday</div>
        <div className="bg-white rounded-xl shadow p-4 mb-3 flex items-center justify-between opacity-60">
          <span className="text-xs text-gray-400">No notifications</span>
          <button className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">Mark as read</button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;