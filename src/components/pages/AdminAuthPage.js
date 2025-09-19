import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const { login, register, loading, error, admin } = useAdminAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const redirectTo = location.state?.from?.pathname || '/admin';
    if (isLogin) {
      const res = await login(formData.email, formData.password);
      if (res && res.record) {
        navigate(redirectTo);
      }
    } else {
      if (!formData.email || !formData.password || !formData.name) {
        alert('Email, password, and name are required!');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      const res = await register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        name: formData.name
      });
      if (res && res.id) {
        navigate(redirectTo);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-700 p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
          <p className="text-sm text-blue-100">For Superusers Only</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-medium">Email ID</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-medium">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          {!isLogin && (
            <>
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>
          )}
          <button type="submit" disabled={loading} className={`w-full bg-blue-700 text-white py-3 rounded-lg font-medium ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800'} transition-colors`}>
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
          <div className="text-center space-y-2">
            <p className="text-gray-600 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-700 font-medium hover:underline">
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAuthPage;
