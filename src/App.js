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

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/search-bus" element={<SearchBus />} />
          <Route path="/list-bus" element={<ListBus />} />
          <Route path="/live-tracking" element={<LiveTracking />} />
          <Route path="/boarding" element={<Boarding />} />
          <Route path="/payment" element={<PaymentSystem />} />
          <Route path="/ticket" element={<Ticket />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
