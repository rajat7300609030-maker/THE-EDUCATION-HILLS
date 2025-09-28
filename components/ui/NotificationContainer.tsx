import React, { useEffect } from 'react';
import { useNotification } from '../../contexts/NavigationContext';
import { Notification } from '../../types';

const ICONS = {
  success: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  danger: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  info: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const NotificationToast: React.FC<{ notification: Notification, onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div className="notification-toast neo-container rounded-xl p-4 flex items-start space-x-3 w-full max-w-sm">
      <div className="flex-shrink-0">{ICONS[notification.type]}</div>
      <div className="flex-grow text-sm font-medium text-gray-800">{notification.message}</div>
      <button onClick={() => onDismiss(notification.id)} className="neo-button rounded-full p-1 text-gray-500 hover:text-gray-800">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
    </div>
  );
};

const NotificationContainer: React.FC = () => {
  const { activeToasts, dismissToast } = useNotification();
  return (
    <div className="notification-container">
      {activeToasts.map(notification => (
        <NotificationToast key={notification.id} notification={notification} onDismiss={dismissToast} />
      ))}
    </div>
  );
};

export default NotificationContainer;