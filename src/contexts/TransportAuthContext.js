import React, { createContext, useContext, useState, useEffect } from 'react';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');
const TransportAuthContext = createContext();

export const useTransportAuth = () => useContext(TransportAuthContext);

export const TransportAuthProvider = ({ children }) => {
  const [transporter, setTransporter] = useState(pb.authStore.model && pb.authStore.model.collectionName === 'transporter' ? pb.authStore.model : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (model && model.collectionName === 'transporter') {
        setTransporter(model);
      } else {
        setTransporter(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await pb.collection('transporter').authWithPassword(email, password);
      if (res?.record) {
        setTransporter(res.record);
        return res;
      }
      throw new Error('Login failed');
    } catch (err) {
      setError(err.message || 'Login failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const newTransporter = await pb.collection('transporter').create({
        email: data.email,
        password: data.password,
        passwordConfirm: data.confirmPassword,
        name: data.name
      });
      await login(data.email, data.password);
      return newTransporter;
    } catch (err) {
      setError(err.message || 'Registration failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setTransporter(null);
  };

  return (
    <TransportAuthContext.Provider value={{ transporter, login, register, logout, loading, error }}>
      {children}
    </TransportAuthContext.Provider>
  );
};
