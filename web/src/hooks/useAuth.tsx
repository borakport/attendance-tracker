'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, Permission } from '@/types';
import { APP_CONFIG, ROUTES } from '@/constants';

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER);
        const authToken = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
        
        if (userData && authToken) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, token);
    setUser(userData);
    
    // Redirect based on role
    switch (userData.role) {
      case 'admin':
        router.push(ROUTES.ADMIN_DASHBOARD);
        break;
      case 'instructor':
        router.push(ROUTES.INSTRUCTOR_DASHBOARD);
        break;
      case 'student':
        router.push(ROUTES.STUDENT_DASHBOARD);
        break;
    }
  };

  const logout = () => {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    setUser(null);
    router.push(ROUTES.LOGIN);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Role-based access control hook
export function useRoleAccess(requiredRole?: string[]) {
  const { user } = useAuth();
  
  if (!user) return false;
  if (!requiredRole || requiredRole.length === 0) return true;
  
  return requiredRole.includes(user.role);
}

// Permission-based access control hook
export function usePermission(requiredPermission: Permission) {
  const { user } = useAuth();
  
  if (!user) return false;
  return user.permissions.includes(requiredPermission);
}
