import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

// Context toiri kora
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // App load holei check korbe user login ache kina (HTTP-only cookie theke)
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await api.get('/api/users/profile');
        setUser(data); // User login thakle data set hobe
      } catch (error) {
        setUser(null); // Login na thakle null thakbe
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Login function
  const login = (userData) => {
    setUser(userData);
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/api/auth/logout'); // Backend e logout api thakle call hobe
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Jekono component e useAuth() call korlei data pawa jabe
export const useAuth = () => useContext(AuthContext);