import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);
  const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    // Load user and token from localStorage and initialize session timer
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const lastActivity = localStorage.getItem('lastActivity');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // If last activity is too old, expire session immediately
      if (lastActivity && Date.now() - Number(lastActivity) > SESSION_TIMEOUT) {
        // session expired
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('lastActivity');
      } else {
        // start/reset timer and activity listeners
        localStorage.setItem('lastActivity', Date.now().toString());
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('lastActivity');
        }, SESSION_TIMEOUT);
      }
    }

    setLoading(false);

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (localStorage.getItem('token')) {
        timeoutRef.current = setTimeout(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('lastActivity');
        }, SESSION_TIMEOUT);
      }
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'click'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const login = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('lastActivity', Date.now().toString());
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('lastActivity');
    }, SESSION_TIMEOUT);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('lastActivity');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'user': 'User',
      'manager': 'Manager',
      'admin': 'Administrator'
    };
    return roleMap[role] || role;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, getRoleDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
