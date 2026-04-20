import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const now = Date.now();
    return [
      {
        id: 1,
        title: 'New Backorder Created',
        message: 'Backorder BO-1008 has been created for Brake Pads',
        type: 'info',
        timestamp: new Date(now - 1000 * 60 * 30), // 30 minutes ago
        read: false
      },
      {
        id: 2,
        title: 'Low Stock Alert',
        message: 'Control Module (P-004) stock is below threshold',
        type: 'warning',
        timestamp: new Date(now - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false
      },
      {
        id: 3,
        title: 'Employee Added',
        message: 'New employee Jennifer Davis has been added to Sorting department',
        type: 'success',
        timestamp: new Date(now - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true
      },
      {
        id: 4,
        title: 'Warehouse Capacity Warning',
        message: 'WH02 Los Angeles warehouse is at 95% capacity',
        type: 'warning',
        timestamp: new Date(now - 1000 * 60 * 60 * 6), // 6 hours ago
        read: false
      },
      {
        id: 5,
        title: 'Query Executed',
        message: 'System query Q8 completed successfully',
        type: 'info',
        timestamp: new Date(now - 1000 * 60 * 60 * 8), // 8 hours ago
        read: true
      }
    ];
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvents = [
        {
          title: 'Part Stock Updated',
          message: 'Transmission Belt stock updated to 145 units',
          type: 'info'
        },
        {
          title: 'Backorder Fulfilled',
          message: 'Backorder BO-1005 has been completed',
          type: 'success'
        },
        {
          title: 'System Maintenance',
          message: 'Scheduled maintenance completed successfully',
          type: 'info'
        }
      ];

      if (Math.random() < 0.3) { // 30% chance every 5 minutes
        const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        addNotification(randomEvent);
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};