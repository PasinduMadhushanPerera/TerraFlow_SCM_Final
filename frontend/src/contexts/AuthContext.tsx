import React, { useEffect, useState, createContext, useContext } from 'react';
interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'supplier' | 'customer';
  fullName: string;
  isApproved?: boolean;
}
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<boolean>;
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
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('terraflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Make API call to backend for authentication
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const user: User = {
          id: result.user.id.toString(),
          username: result.user.full_name,
          email: result.user.email,
          role: result.user.role,
          fullName: result.user.full_name,
          isApproved: true
        };
        
        setUser(user);
        localStorage.setItem('terraflow_user', JSON.stringify(user));
        setIsLoading(false);
        return true;
      } else {
        console.error('Login failed:', result.message);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('terraflow_user');
  };  const register = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Sending registration request:', userData);
      
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          ...userData, 
          termsAccepted: true 
        })
      });

      const data = await response.json();
      setIsLoading(false);
      
      if (!response.ok) {
        console.error('Registration failed:', data.message);
        throw new Error(data.message || 'Registration failed');
      }
      
      console.log('Registration successful:', data);
      return data.success;
    } catch (error: any) {
      console.error('Registration error:', error);
      setIsLoading(false);
      
      // Check if it's a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend server is running on port 5000.');
      }
      
      throw error;
    }
  };
  return <AuthContext.Provider value={{
    user,
    login,
    logout,
    register,
    isLoading
  }}>
      {children}
    </AuthContext.Provider>;
};
