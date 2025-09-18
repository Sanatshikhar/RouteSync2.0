import React, { useState } from 'react';

const BUS_INFO = {
  number: 'KI-58-B-0271',
  type: 'Ordinary',
  crowd: 25,
  crowdColor: 'green',
  status: 'Delayed',
  statusColor: 'red',
  arrival: '09:18 am',
  distance: '4 Km',
  fare: 15,
};

const STOPS = [
  { time: '08:50 am', actual: '08:55 am', name: 'Company Pady', distance: '8 Km' },
  { time: '09:10 am', actual: '', name: 'Kakkanad Stand', distance: '12 Km' },
  { time: '08:50 am', actual: '08:55 am', name: 'Padamugal', distance: '13.6 Km' },
  { time: '08:56 am', actual: '09:00 am', name: 'Colony Jn', distance: '14.5 Km', icon: 'bus' },
  { time: '09:09 am', actual: '', name: 'Vazhakala Bus stop', distance: '15.6 Km' },
  { time: '09:06 am', actual: '09:10 am', name: 'Chembumukku', distance: '17 Km' },
  { time: '09:10 am', actual: '09:14 am', name: 'Pipeline Jn', distance: '18 Km' },
  { time: '09:16 am', actual: '', name: 'Palarivattom Jn', distance: '19 Km' },
  { time: '09:20 am', actual: '', name: 'Janatha Junction', distance: '' },
];

const LivetTrack = () => {
  const [tab, setTab] = useState('Live status');

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="text-white text-2xl font-bold">&#8592;</button>
          <div>
            <div className="font-semibold text-lg">Bus Status</div>
            <div className="text-xs opacity-80">Pipeline Jn &rarr; Kaloor</div>
          </div>
        </div>
        <button className="text-white text-xl">&#8942;</button>
      </div>

      {/* Map Section (Placeholder) */}
      {tab === 'Live status' && (
        <div className="bg-white flex flex-col items-center justify-center" style={{ height: 220, position: 'relative' }}>
          <img src="https://maps.googleapis.com/maps/api/staticmap?center=10.012,76.312&zoom=14&size=400x200&maptype=roadmap&markers=color:red%7Clabel:B%7C10.012,76.312" alt="Map" className="w-full h-full object-cover rounded-b-2xl" />
          {/* Bus Card Overlay */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-[90%] bg-white rounded-xl shadow-lg p-4">
            <div className="flex justify-between items-center mb-1">
              <div className="font-semibold text-base">{BUS_INFO.number}</div>
              <button className="text-gray-400 text-xl">&#9825;</button>
            </div>
            <div className="text-xs text-gray-500 mb-1">{BUS_INFO.type}</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600 font-bold text-lg">{BUS_INFO.crowd}%</span>
              <span className="text-xs text-gray-400">Crowd status</span>
              <div className="flex-1 h-2 bg-gray-200 rounded mx-2">
                <div className="h-2 bg-green-500 rounded" style={{ width: `${BUS_INFO.crowd}%` }}></div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="text-gray-500">Arrives at</div>
                <div className="font-semibold">{BUS_INFO.arrival}</div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-semibold text-red-500">Delayed</div>
              </div>
              <div>
                <div className="text-gray-500">Travel distance</div>
                <div className="font-semibold">{BUS_INFO.distance}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white border-b">
        {['Live status', 'Bus details'].map((t) => (
          <button
            key={t}
            className={`flex-1 py-2 text-center font-semibold ${tab === t ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500'}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {tab === 'Live status' ? (
          <div className="p-4">
            {/* Next Stop */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-blue-600 text-lg font-bold">08:15 am</span>
              </div>
              <div>
                <div className="font-semibold">Lakkipady</div>
                <div className="text-xs text-gray-400">1 Km</div>
              </div>
              <div className="ml-auto text-xs text-red-500">08:25 am</div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200" style={{ zIndex: 0 }}></div>
              {STOPS.map((stop, idx) => (
                <div key={idx} className="flex items-start mb-4 relative" style={{ zIndex: 1 }}>
                  <div className="flex flex-col items-center mr-4" style={{ width: 32 }}>
                    <div className={`w-4 h-4 rounded-full ${idx === 3 ? 'bg-blue-600' : 'bg-white border-2 border-blue-600'} flex items-center justify-center`}>
                      {stop.icon === 'bus' ? <span className="text-blue-600">&#128652;</span> : null}
                    </div>
                  </div>
                  <div>
                    <div className="flex gap-2 items-baseline">
                      <span className="text-xs text-gray-400">{stop.time}</span>
                      {stop.actual && <span className="text-xs text-red-500">{stop.actual}</span>}
                      <span className="font-semibold text-sm ml-2">{stop.name}</span>
                    </div>
                    <div className="text-xs text-gray-400 ml-2">{stop.distance}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t">
        <div className="text-xs text-gray-500">Pipeline Jn &rarr; Kaloor</div>
        <div className="font-bold text-lg">₹ {BUS_INFO.fare}</div>
      </div>
      <div className="bg-white px-4 py-2 flex gap-3 border-t">
        <button className="flex-1 py-2 rounded-lg border border-blue-600 text-blue-600 font-semibold">Alarm</button>
        <button className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold">Pay the fare</button>
      </div>
    </div>
  );
};

export default LivetTrack;
