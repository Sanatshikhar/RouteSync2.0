import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useNotifications from '../../hooks/useNotifications';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = React.useState('View All');
  const { notifications, loading, error, markAsRead } = useNotifications(user?.id);

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
        {loading && <div>Loading notifications...</div>}
        {error && <div className="text-red-500">Error: {error}</div>}
        {notifications.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow p-4 mb-3 flex items-center justify-between opacity-60">
            <span className="text-xs text-gray-400">No notifications</span>
          </div>
        )}
        {notifications.map((n, i) => (
          <div key={n.id} className={`bg-white rounded-xl shadow p-4 mb-3 flex items-start gap-3 relative ${n.read ? 'opacity-60' : ''}`}>
            <div className="text-2xl mt-1">{n.icon || '🔔'}</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 mb-1 text-sm">{n.title}</div>
              <div className="text-xs text-gray-600">{n.desc}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-xs text-gray-400 whitespace-nowrap">{n.time}</div>
              {!n.read && (
                <button className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1" onClick={() => markAsRead(n.id)}>Mark as read</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;