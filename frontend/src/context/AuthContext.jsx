import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/login', { email, password }, config);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response && error.response.data.message ? error.response.data.message : error.message 
      };
    }
  };

  const register = async (name, email, studentId, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/register', { name, email, studentId, password }, config);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response && error.response.data.message ? error.response.data.message : error.message 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
