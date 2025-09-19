import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '../services/pocketbase';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(pb.authStore.model && pb.authStore.model.collectionName === '_superusers' ? pb.authStore.model : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (model && model.collectionName === '_superusers') {
        setAdmin(model);
      } else {
        setAdmin(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await pb.collection('_superusers').authWithPassword(email, password);
      if (res?.record) {
        setAdmin(res.record);
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
      const newAdmin = await pb.collection('_superusers').create({
        email: data.email,
        password: data.password,
        passwordConfirm: data.password,
        name: data.name
      });
      await login(data.email, data.password);
      return newAdmin;
    } catch (err) {
      setError(err.message || 'Registration failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, register, logout, loading, error }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
