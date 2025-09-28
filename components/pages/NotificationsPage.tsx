import React, { useEffect } from 'react';
import PageWrapper from '../ui/PageWrapper';
import { Page, Notification } from '../../types';
// Fix: Corrected the import path for useNotification.
import { useNotification } from '../../contexts/NavigationContext';

const ICONS = {
    success: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    danger: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    info: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
};


const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
  <div className={`neo-container p-4 rounded-xl flex items-start space-x-4 ${notification.isRead ? '' : 'border-l-4 border-blue-500'}`}>
    <div className="flex-shrink-0 mt-1">
      {ICONS[notification.type]}
    </div>
    <div className="flex-grow">
      <p className="text-sm font-semibold text-gray-800">{notification.message}</p>
      <span className="text-xs text-gray-500">
        {formatTimeAgo(notification.timestamp)}
      </span>
    </div>
  </div>
);

const NotificationsPage: React.FC = () => {
    const { notifications, markAllAsRead, clearAllNotifications } = useNotification();

    useEffect(() => {
        markAllAsRead();
    }, [markAllAsRead]);

  return (
    <PageWrapper page={Page.Notifications}>
        <div className="flex justify-end mb-4">
            <button onClick={clearAllNotifications} className="neo-button rounded-xl px-4 py-2 text-sm font-semibold text-red-600 flex items-center space-x-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                 <span>Clear All</span>
            </button>
        </div>
      <div className="space-y-4">
        {notifications.length > 0 ? (
            notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
            ))
        ) : (
            <div className="neo-container p-6 text-center text-gray-500 rounded-xl">
                You have no notifications.
            </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default NotificationsPage;