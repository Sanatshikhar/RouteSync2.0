import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    fullName: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Sample user credentials for testing
  const sampleUser = {
    email: 'test@test.com',
    password: 'test123'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      // Sample login validation
      if (formData.email === sampleUser.email && formData.password === sampleUser.password) {
        // Successful login
        alert('Login successful!');
        // Store login state in localStorage (temporary solution)
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', formData.email);
        // Navigate to homepage
        navigate('/homepage');
      } else {
        // Failed login
        alert('Invalid credentials! Use test@test.com / test123 for testing');
      }
    } else {
      // Handle signup
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      console.log('Signup:', formData);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      mobileNumber: '',
      fullName: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with Logo */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <div className="flex justify-center mb-4">
            {/* You can replace this SVG with your actual logo image */}
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">RouteSync</h1>
          <p className="text-sm text-blue-100">Your Smart Travel Companion</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-medium">Email ID</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {!isLogin && (
            <>
              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Mobile Number Field */}
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">Mobile number</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Full Name Field */}
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>

          {/* Links Section */}
          <div className="text-center space-y-2">
            {isLogin && (
              <a href="#" className="text-blue-600 text-sm hover:underline block">
                Forgot Password?
              </a>
            )}
            <p className="text-gray-600 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-blue-600 font-medium hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
