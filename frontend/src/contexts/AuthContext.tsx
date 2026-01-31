import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '@/lib/utils';

interface User {
  email: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const logoutTimerRef = typeof window !== 'undefined' ? { current: 0 as number | null } : ({ current: null } as { current: number | null });

  const TOKEN_EXP_MS = 60 * 60 * 1000; // 1 hour

  const scheduleAutoLogout = (expiresAt: number) => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    const msRemaining = Math.max(0, expiresAt - Date.now());
    logoutTimerRef.current = window.setTimeout(() => {
      logout();
    }, msRemaining);
  };

  useEffect(() => {
    // Check for stored auth token on app load with expiry validation
    const storedToken = localStorage.getItem('access_token') || localStorage.getItem('token');
    const storedEmail = localStorage.getItem('email');
    const expiresAtStr = localStorage.getItem('token_expires_at');
    const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : 0;

    if (storedToken && storedEmail && expiresAt > Date.now()) {
      setUser({ email: storedEmail, accessToken: storedToken });
      scheduleAutoLogout(expiresAt);
    } else {
      // Clear stale data
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('token_expires_at');
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiFetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { access_token } = data;
        
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('token', access_token); // compatibility
        localStorage.setItem('email', email);
        const expiresAt = Date.now() + TOKEN_EXP_MS;
        localStorage.setItem('token_expires_at', String(expiresAt));
        
        setUser({ email, accessToken: access_token });
        scheduleAutoLogout(expiresAt);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiFetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('token_expires_at');
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    setUser(null);
    // Optional: also clear other app state if needed
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};