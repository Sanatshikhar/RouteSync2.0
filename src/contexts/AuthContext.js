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

    if (user) {
      fetchUserWallet(user.id);
    }

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
    setLoading(true);
    setError(null);
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      setUser(authData?.record);
      await fetchUserWallet(authData?.record?.id);
      setLoading(false);
      return authData;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      // Create user
      const newUser = await pb.collection('users').create({
        ...userData,
        passwordConfirm: userData.password,
      });

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
      setError(err.message);
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
