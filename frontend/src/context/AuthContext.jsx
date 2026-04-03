import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getMe } from '../services/authService';
import { disconnectAll } from '../services/connectionService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await getMe();
      setUser(data);
    } catch {
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const { data } = await loginUser(credentials);
    localStorage.setItem('accessToken', data.accessToken);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      subscription: data.subscription,
    });
    return data;
  };

  const register = async (userData) => {
    const { data } = await registerUser(userData);
    localStorage.setItem('accessToken', data.accessToken);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      subscription: data.subscription,
    });
    return data;
  };

  const logout = async () => {
    try {
      await disconnectAll();
      await logoutUser();
    } catch {
      // proceed with logout even if API fails
    }
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await getMe();
      setUser(data);
    } catch {
      // silently fail
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
