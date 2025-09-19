
import React, { useState } from 'react';

const tabs = [
	{ key: 'buses', label: 'Buses' },
	{ key: 'routes', label: 'Routes' },
	{ key: 'fleets', label: 'Fleets' },
	{ key: 'drivers', label: 'Driver Verification' }
];

const AdminDashboard = () => {
	const [activeTab, setActiveTab] = useState('buses');
	const [search, setSearch] = useState('');

	// Dummy filtered results (replace with real data logic)
	const getSearchPlaceholder = () => {
		if (activeTab === 'buses') return 'Search buses...';
		if (activeTab === 'routes') return 'Search routes...';
		if (activeTab === 'drivers') return 'Search drivers...';
		return 'Search...';
	};

	return (
		<div className="min-h-screen bg-[#F6F8FB] flex flex-col">
					{/* Header */}
					<div className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
								<span className="font-bold text-blue-600">A</span>
							</div>
							<div>
								<div className="font-semibold text-lg">Admin Dashboard</div>
								<div className="text-xs opacity-80">Manage everything</div>
							</div>
						</div>
						<button className="bg-white text-blue-600 font-semibold px-4 py-2 rounded shadow hover:bg-blue-100">Logout</button>
					</div>

			{/* Tabs */}
			<div className="flex bg-white border-b">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						className={`flex-1 py-2 text-center font-semibold ${activeTab === tab.key ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500'}`}
						onClick={() => setActiveTab(tab.key)}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Search Bar */}
			<div className="bg-white px-4 py-3 border-b flex items-center">
				<input
					type="text"
					className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-400"
					placeholder={getSearchPlaceholder()}
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
				<button className="ml-2 px-3 py-2 bg-blue-600 text-white rounded">Search</button>
			</div>

			{/* Tab Content */}
			<div className="flex-1 overflow-y-auto bg-white p-4">
				{activeTab === 'buses' && (
					<div>
						<h2 className="font-semibold text-lg mb-2">Manage Buses</h2>
						{/* List, add, edit, delete buses */}
						<div className="bg-blue-50 p-4 rounded mb-4">Bus list and controls go here.</div>
						<button className="bg-blue-600 text-white px-4 py-2 rounded">Add New Bus</button>
					</div>
				)}
				{activeTab === 'routes' && (
					<div>
						<h2 className="font-semibold text-lg mb-2">Manage Routes</h2>
						{/* List, add, edit, delete routes */}
						<div className="bg-blue-50 p-4 rounded mb-4">Route list and controls go here.</div>
						<button className="bg-blue-600 text-white px-4 py-2 rounded">Add New Route</button>
					</div>
				)}
				{activeTab === 'fleets' && (
					<div>
						<h2 className="font-semibold text-lg mb-2">Bus & Route Allocation</h2>
						{/* Assign buses to routes and drivers to buses */}
						<div className="bg-blue-50 p-4 rounded mb-4">Allocation controls go here.</div>
						<button className="bg-blue-600 text-white px-4 py-2 rounded">Assign Bus/Route</button>
					</div>
				)}
				{activeTab === 'drivers' && (
					<div>
						<h2 className="font-semibold text-lg mb-2">Driver Verification</h2>
						{/* Approve/reject driver applications */}
						<div className="bg-blue-50 p-4 rounded mb-4">Driver applications and controls go here.</div>
						<button className="bg-blue-600 text-white px-4 py-2 rounded">Approve Selected</button>
					</div>
				)}
			</div>

		</div>
	);
};

export default AdminDashboard;
