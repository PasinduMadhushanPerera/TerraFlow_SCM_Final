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
  login: (username: string, password: string) => Promise<boolean>;
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
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Hardcoded admin login
    if (username === 'admin' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@terraflow.com',
        role: 'admin',
        fullName: 'System Administrator'
      };
      setUser(adminUser);
      localStorage.setItem('terraflow_user', JSON.stringify(adminUser));
      setIsLoading(false);
      return true;
    }
    // Mock customer login
    if (username === 'customer' && password === 'customer123') {
      const customerUser: User = {
        id: 'customer-1',
        username: 'customer',
        email: 'customer@example.com',
        role: 'customer',
        fullName: 'John Customer'
      };
      setUser(customerUser);
      localStorage.setItem('terraflow_user', JSON.stringify(customerUser));
      setIsLoading(false);
      return true;
    }
    // Mock supplier login
    if (username === 'supplier' && password === 'supplier123') {
      const supplierUser: User = {
        id: 'supplier-1',
        username: 'supplier',
        email: 'supplier@example.com',
        role: 'supplier',
        fullName: 'Clay Supplier Co.',
        isApproved: true
      };
      setUser(supplierUser);
      localStorage.setItem('terraflow_user', JSON.stringify(supplierUser));
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('terraflow_user');
  };
  const register = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Mock registration success
    setIsLoading(false);
    return true;
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