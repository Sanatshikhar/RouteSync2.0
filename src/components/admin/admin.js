
import React, { useState, useEffect } from 'react';
import pb from '../../services/pocketbase';

const tabs = [
	{ key: 'buses', label: 'Buses' },
	{ key: 'routes', label: 'Routes' },
	{ key: 'fleets', label: 'Fleets' },
	{ key: 'drivers', label: 'Driver Verification' }
];

// pb is imported from pocketbase.js

const AdminDashboard = () => {
	const [activeTab, setActiveTab] = useState('buses');
	const [search, setSearch] = useState('');
	const [buses, setBuses] = useState([]);
	const [loadingBuses, setLoadingBuses] = useState(false);
	const [busError, setBusError] = useState(null);
	const [routes, setRoutes] = useState([]);
	const [loadingRoutes, setLoadingRoutes] = useState(false);
	const [routeError, setRouteError] = useState(null);

	useEffect(() => {
		if (activeTab === 'buses') {
			setLoadingBuses(true);
			pb.collection('buses').getFullList()
				.then(data => {
					setBuses(data);
					setBusError(null);
				})
				.catch(err => {
					setBusError('Failed to fetch buses');
					setBuses([]);
				})
				.finally(() => setLoadingBuses(false));
		}
		if (activeTab === 'routes') {
			setLoadingRoutes(true);
			pb.collection('routes').getFullList()
				.then(data => {
					setRoutes(data);
					setRouteError(null);
				})
				.catch(err => {
					setRouteError('Failed to fetch routes');
					setRoutes([]);
				})
				.finally(() => setLoadingRoutes(false));
		}
	}, [activeTab]);

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
								{/* List buses from PocketBase */}
								<div className="bg-blue-50 p-4 rounded mb-4">
									{loadingBuses ? (
										<div>Loading buses...</div>
									) : busError ? (
										<div className="text-red-600">{busError}</div>
									) : buses.length === 0 ? (
										<div>No buses found.</div>
									) : (
										<ul className="divide-y">
											{buses.filter(bus => bus.bus_number?.toLowerCase().includes(search.toLowerCase())).map(bus => (
												<li key={bus.id} className="py-2 flex justify-between items-center">
													<span className="font-medium">{bus.bus_number}</span>
													<span className="text-xs text-gray-500">{bus.category}</span>
													<span className="text-xs text-gray-500">{bus.status}</span>
												</li>
											))}
										</ul>
									)}
								</div>
								<button className="bg-blue-600 text-white px-4 py-2 rounded">Add New Bus</button>
							</div>
						)}
						{activeTab === 'routes' && (
							<div>
								<h2 className="font-semibold text-lg mb-2">Manage Routes</h2>
								{/* List routes from PocketBase */}
								<div className="bg-blue-50 p-4 rounded mb-4">
									{loadingRoutes ? (
										<div>Loading routes...</div>
									) : routeError ? (
										<div className="text-red-600">{routeError}</div>
									) : routes.length === 0 ? (
										<div>No routes found.</div>
									) : (
										<ul className="divide-y">
											{routes.filter(route => route.name?.toLowerCase().includes(search.toLowerCase())).map(route => (
												<li key={route.id} className="py-2 flex justify-between items-center">
													<span className="font-medium">{route.name}</span>
													<span className="text-xs text-gray-500">{route.start_point} → {route.end_point}</span>
												</li>
											))}
										</ul>
									)}
								</div>
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
