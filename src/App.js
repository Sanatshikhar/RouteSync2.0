import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/pages/authpage';
import HomePage from './components/pages/homepage';
import ListBus from './components/pages/listBus';
import SearchBus from './components/pages/searchBus';
import LiveTracking from './components/pages/livet_track';
import PaymentSystem from './components/pages/paymentSystem';
import Ticket from './components/pages/ticket';
import Boarding from './components/pages/boarding';
import Notifications from './components/pages/notifications';
import Wallet from './components/pages/wallet';
import Profile from './components/pages/profile';
import BookingHistory from './components/pages/bookingHistory';
import Settings from './components/pages/settings';
import LostFoundPage from './components/pages/lostFound';
import WishlistPage from './components/pages/wishlist';

// Placeholder components for missing pages
const SelectLocation = () => <div>Select Location Page</div>;
const BusStatusInfo = () => <div>Bus Status Info Page</div>;
const ConfirmPage = () => <div>Confirm Page</div>;
const DownloadTicket = () => <div>Download Ticket Page</div>;
const PayFare = () => <div>Pay Fare Page</div>;
const PaymentMethod = () => <div>Payment Method Page</div>;
const TakeRide = () => <div>Take a Ride Page</div>;
const SaveAlarm = () => <div>Save Alarm Page</div>;

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/live-tracking" element={<LiveTracking />} />
          <Route path="/search-bus" element={<SearchBus />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/select-location" element={<SelectLocation />} />
          <Route path="/list-bus" element={<ListBus />} />
          <Route path="/bus-status-info" element={<BusStatusInfo />} />
          <Route path="/confirm" element={<ConfirmPage />} />
          <Route path="/download-ticket" element={<DownloadTicket />} />
          <Route path="/pay-fare" element={<PayFare />} />
          <Route path="/payment-method" element={<PaymentMethod />} />
          <Route path="/take-ride" element={<TakeRide />} />
          <Route path="/save-alarm" element={<SaveAlarm />} />
          <Route path="/boarding" element={<Boarding />} />
          <Route path="/payment" element={<PaymentSystem />} />
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/lostFound" element={<LostFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
