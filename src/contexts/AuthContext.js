import React, { createContext, useContext, useState, useEffect } from 'react';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(pb.authStore.model);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wallet, setWallet] = useState(null);

  // Subscribe to authStore changes
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(model);
      if (model) {
        fetchUserWallet(model.id);
      } else {
        setWallet(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchUserWallet = async (userId) => {
    try {
      const walletRecord = await pb.collection('wallet').getFirstListItem(`user="${userId}"`);
      setWallet(walletRecord);
    } catch (err) {
      console.error('Error fetching wallet:', err);
    }
  };

  const login = async (email, password) => {
    if (!email || !password) {
      setError('Email and password are required');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const authData = await pb.collection('users').authWithPassword(
        email.trim(),
        password
      );
      
      if (authData?.record) {
        setUser(authData.record);
        try {
          await fetchUserWallet(authData.record.id);
        } catch (walletErr) {
          console.error('Wallet fetch failed:', walletErr);
          // Don't fail the login if wallet fetch fails
        }
        return authData;
      } else {
        throw new Error('Login failed: No user data received');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!userData.email || !userData.password || !userData.name) {
      setError('Email, password, and name are required');
      setLoading(false);
      return null;
    }

    try {
      console.log('Registration attempt with:', {
        ...userData,
        password: '[HIDDEN]',
        confirmPassword: '[HIDDEN]'
      });

      // Prepare user data - minimum required fields for PocketBase auth
      const userDataToSend = {
        username: userData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
        email: userData.email.trim(),
        password: userData.password,
        passwordConfirm: userData.confirmPassword,
        name: userData.name.trim()
      };

      console.log('Attempting to create user with data:', {
        ...userDataToSend,
        password: '[HIDDEN]',
        passwordConfirm: '[HIDDEN]'
      });

      // Create user with required fields
      const newUser = await pb.collection('users').create(userDataToSend);

      // Create wallet for the user
      await pb.collection('wallet').create({
        user: newUser.id,
        balance: 0,
        last_updated: new Date().toISOString(),
      });

      // Log in the user
      await login(userData.email, userData.password);
      setLoading(false);
      return newUser;
    } catch (err) {
      console.error('Registration error:', {
        message: err.message,
        data: err.data,
        response: err.response,
        originalError: err
      });

      // Handle different types of errors
      if (err.data?.data) {
        // PocketBase validation errors
        const errors = Object.entries(err.data.data)
          .map(([field, message]) => `${field}: ${message.message}`)
          .join('\n');
        setError(`Registration failed:\n${errors}`);
      } else if (err.response?.message) {
        // API response error
        setError(`Registration failed: ${err.response.message}`);
      } else {
        // Generic error
        setError(err.message || 'Registration failed. Please try again.');
      }
      
      setLoading(false);
      return null;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
