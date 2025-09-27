export type NotificationType = 'appointment' | 'patient' | 'system' | 'security';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
}

export interface WebSocketMessage {
  type: 'notification' | 'appointment_update' | 'patient_update' | 'system_status' | 'heartbeat';
  payload: any;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private notifications: Notification[] = [];
  private notificationListeners: Set<(notifications: Notification[]) => void> = new Set();

  connect(url: string = 'ws://localhost:5000/ws') {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    console.log('Connecting to WebSocket:', url);

    try {
      this.socket = new WebSocket(url);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      
      // Send authentication if available
      const token = localStorage.getItem('emr_token');
      if (token) {
        this.send('auth', { token });
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.isConnecting = false;
      this.stopHeartbeat();
      
      if (event.code !== 1000) { // Not a normal closure
        this.handleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
    };
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'notification':
        this.addNotification(message.payload);
        break;
      case 'appointment_update':
        this.emit('appointment_update', message.payload);
        break;
      case 'patient_update':
        this.emit('patient_update', message.payload);
        break;
      case 'system_status':
        this.emit('system_status', message.payload);
        break;
      case 'heartbeat':
        // Handle heartbeat response
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private addNotification(notification: Partial<Notification>) {
    const newNotification: Notification = {
      id: notification.id || this.generateId(),
      type: notification.type || 'system',
      title: notification.title || 'System Notification',
      message: notification.message || '',
      timestamp: notification.timestamp ? new Date(notification.timestamp) : new Date(),
      read: false,
      priority: notification.priority || 'medium',
      data: notification.data
    };

    this.notifications.unshift(newNotification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.notifyListeners();
    this.showBrowserNotification(newNotification);
  }

  private showBrowserNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      });

      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms... (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private heartbeatInterval: NodeJS.Timeout | null = null;

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send('heartbeat', { timestamp: new Date().toISOString() });
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  send(type: string, payload: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = { type: type as any, payload };
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  subscribe(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  subscribeToNotifications(callback: (notifications: Notification[]) => void) {
    this.notificationListeners.add(callback);
    callback(this.notifications); // Send current notifications immediately
    
    return () => {
      this.notificationListeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.notificationListeners.forEach(callback => callback(this.notifications));
  }

  markNotificationAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  markAllNotificationsAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Request browser notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }
}

export const webSocketService = new WebSocketService();