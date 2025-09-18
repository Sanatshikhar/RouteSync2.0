import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/pages/authpage';
import HomePage from './components/pages/homepage';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/homepage" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
