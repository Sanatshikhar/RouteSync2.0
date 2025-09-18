import React, { useState } from 'react';

const BUS_LIST = [
	{
		id: 1,
		number: 'KI-58-B-0271',
		type: 'Ordinary',
		fare: 15,
		startTime: '09:10 am',
		endTime: '09:20 am',
		duration: '10 min',
		distance: '4 Km',
		crowd: 25,
		crowdColor: 'green',
		crowdLabel: 'Crowd status',
		status: 'Delayed: 4 min',
		statusColor: 'red',
		onTime: false,
		service: 'Ordinary',
	},
	{
		id: 2,
		number: 'KI-07-D-0506',
		type: 'City Circular',
		fare: 15,
		startTime: '09:25 am',
		endTime: '09:35 am',
		duration: '10 min',
		distance: '4 Km',
		crowd: 75,
		crowdColor: 'orange',
		crowdLabel: 'Crowd status',
		status: 'On time',
		statusColor: 'green',
		onTime: true,
		service: 'City Circular',
	},
	{
		id: 3,
		number: 'KI-08-Q-0103',
		type: 'Ordinary',
		fare: 15,
		startTime: '09:35 am',
		endTime: '09:45 am',
		duration: '10 min',
		distance: '4 Km',
		crowd: 50,
		crowdColor: 'yellow',
		crowdLabel: 'Crowd status',
		status: 'Delayed: 4 min',
		statusColor: 'red',
		onTime: false,
		service: 'Ordinary',
	},
	{
		id: 4,
		number: 'KI-12-D-2354',
		type: 'KSRTC',
		fare: 17,
		startTime: '',
		endTime: '',
		duration: '',
		distance: '',
		crowd: null,
		crowdColor: '',
		crowdLabel: '',
		status: '',
		statusColor: '',
		onTime: null,
		service: 'KSRTC',
	},
];

const SERVICE_TYPES = ['Ordinary', 'KSRTC', 'Fast passenger', 'Intercity'];

const ListBus = () => {
	const [selectedTab, setSelectedTab] = useState('All buses');
	const [showModal, setShowModal] = useState(false);
	const [selectedService, setSelectedService] = useState('Ordinary');

	const [selectedBus, setSelectedBus] = useState(null);

	const handleCardClick = (bus) => {
		setSelectedBus(bus);
		setShowModal(true);
		setSelectedService(bus.service);
	};

	const handleServiceSelect = (service) => {
		setSelectedService(service);
	};

	const handleModalClose = () => {
		setShowModal(false);
		setSelectedBus(null);
	};

	return (
		<div className="min-h-screen bg-[#F6F8FB] flex flex-col">
			{/* Header */}
			<div className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<button className="text-white text-2xl font-bold">&#8592;</button>
					<div>
						<div className="font-semibold text-lg">Select bus</div>
						<div className="text-xs opacity-80">Pipeline Jn &rarr; Kaloor</div>
					</div>
				</div>
				<button className="text-white text-xl">&#9881;</button>
			</div>

			{/* Sort Tabs */}
			<div className="bg-white px-4 py-2 flex gap-2 border-b">
				{['All buses', '07am - 12pm', '12pm - 06pm'].map((tab) => (
					<button
						key={tab}
						className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
						onClick={() => setSelectedTab(tab)}
					>
						{tab}
					</button>
				))}
			</div>

			{/* Bus List */}
			<div className="flex-1 overflow-y-auto px-2 py-2">
				{BUS_LIST.map((bus) => (
					<div
						key={bus.id}
						className="bg-white rounded-xl shadow-sm mb-3 p-4 cursor-pointer hover:shadow-md transition border"
						onClick={() => handleCardClick(bus)}
					>
						<div className="flex justify-between items-center mb-1">
							<div className="font-semibold text-base">{bus.number}</div>
							<div className="font-bold text-gray-800">₹ {bus.fare}</div>
						</div>
						<div className="text-xs text-gray-500 mb-1">{bus.type}</div>
						{bus.startTime && (
							<div className="flex items-center justify-between mb-1">
								<div className="text-sm font-medium">{bus.startTime}</div>
								<div className="flex items-center gap-1">
									<span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">{bus.duration}</span>
								</div>
								<div className="text-sm font-medium">{bus.endTime}</div>
							</div>
						)}
						{bus.distance && (
							<div className="flex items-center justify-between mb-1">
								<div className="flex items-center gap-2">
									{bus.crowd !== null && (
										<>
											<span className={`text-xs font-semibold ${bus.crowdColor === 'green' ? 'text-green-600' : bus.crowdColor === 'orange' ? 'text-orange-500' : 'text-yellow-500'}`}>{bus.crowd}%</span>
											<span className="text-xs text-gray-400">{bus.crowdLabel}</span>
										</>
									)}
								</div>
								<div className="text-xs text-gray-700">{bus.distance}</div>
								<div className={`text-xs font-semibold ${bus.statusColor === 'red' ? 'text-red-500' : 'text-green-600'}`}>{bus.status}</div>
							</div>
						)}
					</div>
				))}
			</div>

			{/* Modal (Bottom Sheet) */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-30 flex items-end z-50" onClick={handleModalClose}>
					<div
						className="w-full bg-white rounded-t-2xl p-6 shadow-lg"
						style={{ maxWidth: 500, margin: '0 auto' }}
						onClick={e => e.stopPropagation()}
					>
						<div className="flex justify-between items-center mb-4">
							<div className="font-semibold text-lg">Bus Service type</div>
							<button className="text-gray-500 text-2xl" onClick={handleModalClose}>&#10005;</button>
						</div>
						<div className="flex flex-wrap gap-2 mb-6">
							{SERVICE_TYPES.map((type) => (
								<button
									key={type}
									className={`px-4 py-2 rounded-full border text-sm font-medium ${selectedService === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
									onClick={() => handleServiceSelect(type)}
								>
									{type}
								</button>
							))}
						</div>
						<div className="flex justify-between gap-4">
							<button className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold" onClick={handleModalClose}>cancel</button>
							<button className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold" onClick={handleModalClose}>Save</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ListBus;
