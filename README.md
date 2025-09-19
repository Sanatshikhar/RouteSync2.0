# RouteSync2.0 - Odisha Bus Route Planner

A modern bus tracking and route planning application built specifically for Odisha, India, featuring Google Maps-like route visualization with **no API keys required** for basic functionality. Optimized for Odisha locations, landmarks, and OSRTC bus routes.

## 🚀 Features

### ✅ **Completely Free Routing** (No API Keys Required)

- **OpenStreetMap** tiles for map display
- **OSRM** (Open Source Routing Machine) for route calculation
- **Nominatim** for location search and geocoding
- **Overpass API** for finding bus stops

### 🗺️ **Google Maps-like Experience**

- **Blue route lines** with white outlines for better visibility
- **Animated bus markers** that move along the planned route
- **Start/End location markers** with custom icons
- **Auto-fit map bounds** to show entire route
- **Real-time route calculation** with distance and duration

### 🚌 **Odisha Bus-Specific Features**

- **Comprehensive Odisha database** with 50+ cities and towns
- **Famous landmarks** including temples, beaches, and tourist spots
- **OSRTC fare estimation** based on actual bus routes
- **All 30 districts** of Odisha covered
- **Major bus routes** pre-loaded (Bhubaneswar-Puri, Cuttack-Paradip, etc.)
- **Tourist destinations** like Jagannath Temple, Konark, Chilika Lake
- **Educational institutions** like IIT Bhubaneswar, KIIT, NIT Rourkela
- **Route optimization** for public transit
- **Crowd status indicators** and capacity information

## 🛠️ **Tech Stack**

- **Frontend**: React 19, Tailwind CSS
- **Mapping**: Leaflet, React-Leaflet
- **Routing**: OSRM, OpenRouteService (optional)
- **Backend**: PocketBase
- **APIs**: OpenStreetMap, Nominatim, Overpass API

## 📦 **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sanatshikhar/RouteSync2.0.git
   cd RouteSync2.0
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables** (Optional)

   ```bash
   cp .env.example .env
   # Edit .env file with your API keys (optional for enhanced features)
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Start PocketBase backend** (in a separate terminal)
   ```bash
   ./pocketbase.exe serve
   ```

## 🎯 **Usage**

### **Route Planning**

1. Navigate to `/route-planner`
2. Enter start and destination locations
3. Click "Get Directions" to calculate the route
4. Use "Animate Bus" to see route simulation
5. View bus stops automatically detected along the route

### **Live Tracking**

1. Navigate to `/live-tracking`
2. View real-time bus locations on the map
3. See bus capacity, status, and arrival times
4. Track multiple buses simultaneously

## 🔧 **API Configuration**

### **Free APIs (No Keys Required)**

- ✅ **OpenStreetMap**: Map tiles
- ✅ **OSRM**: Route calculation
- ✅ **Nominatim**: Location search
- ✅ **Overpass API**: Bus stop data

### **Optional Enhanced APIs**

For better performance and additional features, you can optionally add:

```env
# OpenRouteService (2000 free requests/day)
REACT_APP_OPENROUTE_API_KEY=your_key_here
```

Get free API key from: https://openrouteservice.org/

## 🗂️ **Project Structure**

```
RouteSync2.0/
├── src/
│   ├── components/
│   │   ├── Map.js                 # Enhanced map with route visualization
│   │   ├── RoutePlanner.js        # Google Maps-like route planner
│   │   ├── RouteDemo.js           # Demo component for testing
│   │   └── pages/
│   │       ├── RoutePlanningPage.js  # Full route planning interface
│   │       └── livet_track.js        # Live bus tracking
│   ├── services/
│   │   └── routingService.js      # OpenStreetMap routing service
│   └── hooks/
│       └── useGeolocation.js      # User location tracking
├── pb_data/                       # PocketBase database
├── pb_migrations/                 # Database migrations
└── pocketbase.exe                 # PocketBase server
```

## 🎨 **Key Components**

### **Map Component**

- Google Maps-style route visualization
- Animated bus markers
- Custom icons for start/end locations
- Auto-fitting bounds for optimal view

### **RoutePlanner Component**

- Location search with autocomplete
- Real-time route calculation
- Distance and duration display
- Bus stop detection along routes

### **RoutingService**

- Multiple API fallbacks for reliability
- Free OSRM routing as primary service
- Nominatim geocoding for location search
- Overpass API for bus stop data

## 🚀 **Deployment**

### **Build for Production**

```bash
npm run build
```

### **Deploy to Vercel/Netlify**

The app is ready for deployment to any static hosting service. No server-side configuration needed for the routing features.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the routing functionality
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 **Acknowledgments**

- **OpenStreetMap** community for free map data
- **OSRM** project for free routing services
- **Leaflet** for the excellent mapping library
- **React-Leaflet** for React integration

---

**🎯 Ready to use with zero configuration - no API keys required for core functionality!**

---

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

#### `npm test`

Launches the test runner in the interactive watch mode.

#### `npm run build`

Builds the app for production to the `build` folder.
