import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/pages/authpage';
import HomePage from './components/pages/homepage';
import LivetTrack from './components/pages/livet_track';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/livet_track" element={<LivetTrack />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
