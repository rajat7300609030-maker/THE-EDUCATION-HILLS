import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
// FIX: Added Notification type and useLocalStorage import for the Notification system.
import { Page, Notification } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

export interface NavigationState {
  page: Page;
  data?: any;
}

interface NavigationContextType {
  currentPage: NavigationState;
  navigate: (page: Page, data?: any) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  initialNavigation?: NavigationState | null;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children, initialNavigation }) => {
  const [history, setHistory] = useState<NavigationState[]>([]);
  const [currentPage, setCurrentPage] = useState<NavigationState>(initialNavigation || { page: Page.Dashboard });

  const navigate = useCallback((page: Page, data: any = null) => {
    setHistory(prev => [...prev, currentPage]);
    setCurrentPage({ page, data });
  }, [currentPage]);

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const lastPage = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentPage(lastPage);
    }
  }, [history]);

  return (
    <NavigationContext.Provider value={{ currentPage, navigate, goBack, canGoBack: history.length > 0 }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

// --- Notification System ---
// FIX: Moved Notification system from App.tsx to break circular dependency.
interface NotificationContextType {
  notifications: Notification[];
  activeToasts: Notification[];
  addNotification: (message: string, type: 'success' | 'danger' | 'info') => void;
  dismissToast: (id: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);
  const [activeToasts, setActiveToasts] = useState<Notification[]>([]);

  const dismissToast = useCallback((id: string) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addNotification = useCallback((message: string, type: 'success' | 'danger' | 'info') => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      message,
      type,
      timestamp: Date.now(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
    setActiveToasts(prev => [...prev, newNotification]);
  }, [setNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, [setNotifications]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, activeToasts, addNotification, dismissToast, markAllAsRead, clearAllNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
// --- End Notification System ---
