import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/pages/authpage';
import HomePage from './components/pages/homepage';
import ListBus from './components/pages/listBus';
import SearchBus from './components/pages/searchBus';
import LiveTracking from './components/pages/livet_track';
import PaymentSystem from './components/pages/paymentSystem';
import Ticket from './components/pages/ticket';
import TicketList from './components/pages/ticketList';
import Boarding from './components/pages/boarding';
import Notifications from './components/pages/notifications';
import Wallet from './components/pages/wallet';
import Profile from './components/pages/profile';
import BookingHistory from './components/pages/bookingHistory';
import Settings from './components/pages/settings';
import LostFoundPage from './components/pages/lostFound';
import WishlistPage from './components/pages/wishlist';
import AdminDashboard from './components/admin/admin';
import TransportDashboard from './components/TransportDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/search-bus" element={<SearchBus />} />
          <Route path="/listbus" element={<ListBus />} />
          {/* Protected features */}
          <Route path="/live-tracking" element={<ProtectedRoute><LiveTracking /></ProtectedRoute>} />
          <Route path="/boarding" element={<ProtectedRoute><Boarding /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><PaymentSystem /></ProtectedRoute>} />
          <Route path="/ticket" element={<ProtectedRoute><TicketList /></ProtectedRoute>} />
          <Route path="/ticket/:id" element={<ProtectedRoute><Ticket /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/booking-history" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/lostFound" element={<ProtectedRoute><LostFoundPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/transport" element={<ProtectedRoute><TransportDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
