import React, { createContext, useContext, useState } from 'react';
import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.REACT_APP_PB_URL);

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(pb.authStore.model);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      setUser(authData?.record);
      setLoading(false);
      return authData;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const register = async (email, password, more = {}) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        ...more,
      });
      await login(email, password);
      setLoading(false);
      return userData;
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
