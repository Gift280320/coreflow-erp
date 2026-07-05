import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../lib/axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: { name: string };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/users/me')
        .then(res => setUser(res.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { accessToken, user } = res.data;
    localStorage.setItem('accessToken', accessToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setUser(user);
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
