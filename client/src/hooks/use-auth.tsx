import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('supabase_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('supabase_token');
        localStorage.removeItem('user_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user, session } = await authApi.login(email, password);
    setUser(user);
    localStorage.setItem('supabase_token', session.access_token);
    localStorage.setItem('user_data', JSON.stringify(user));
    setLocation('/dashboard');
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const { user, session } = await authApi.signup(email, password, fullName);
    setUser(user);
    localStorage.setItem('supabase_token', session.access_token);
    localStorage.setItem('user_data', JSON.stringify(user));
    setLocation('/dashboard');
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    localStorage.removeItem('supabase_token');
    localStorage.removeItem('user_data');
    setLocation('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
