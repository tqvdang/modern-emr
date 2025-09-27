import { useState, useEffect } from 'react';
import { webSocketService, Notification } from '@/lib/websocket';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    webSocketService.connect();

    // Request notification permission
    webSocketService.requestNotificationPermission();

    // Subscribe to notifications
    const unsubscribeNotifications = webSocketService.subscribeToNotifications((notifications) => {
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.read).length);
    });

    // Subscribe to connection status
    const unsubscribeConnection = webSocketService.subscribe('connection_status', (status) => {
      setIsConnected(status.connected);
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeConnection();
    };
  }, []);

  const markAsRead = (id: string) => {
    webSocketService.markNotificationAsRead(id);
  };

  const markAllAsRead = () => {
    webSocketService.markAllNotificationsAsRead();
  };

  const addLocalNotification = (notification: Partial<Notification>) => {
    // For testing purposes - add local notifications
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type: notification.type || 'system',
      title: notification.title || 'Local Notification',
      message: notification.message || '',
      timestamp: new Date(),
      read: false,
      priority: notification.priority || 'medium',
      data: notification.data
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      setUnreadCount(updated.filter(n => !n.read).length);
      return updated;
    });
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    addLocalNotification
  };
};