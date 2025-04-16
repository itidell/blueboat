// src/api/notificationContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';
import { useAuth } from './authContext';
// Notification types
export const NOTIFICATION_TYPES = {
  BATTERY_LOW: 'BATTERY_LOW',
  NEW_ROBOT: 'ROBOT_CREATED',
  STORAGE_FULL: 'STORAGE_FULL',
  ROBOT_STUCK: 'ROBOT_STUCK',
  ACCESS_REQUEST: 'ROBOT_ACCESS_REQUESTED',
  ROBOT_STATUS_CHANGED: 'ROBOT_STATUS_CHANGED',
  ROBOT_ACCESS_GRANTED: 'ROBOT_ACCESS_GRANTED',
  ROBOT_ACCESS_SHARED: 'ROBOT_ACCESS_SHARED',
  ROBOT_ACCESSED: 'ROBOT_ACCESSED'
};

// Create context
const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const {user, isAuthenticated} = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [notificationSettings, setNotificationSettings] = useState({
        [NOTIFICATION_TYPES.BATTERY_LOW]: true,
        [NOTIFICATION_TYPES.NEW_ROBOT]: true,
        [NOTIFICATION_TYPES.STORAGE_FULL]: true,
        [NOTIFICATION_TYPES.ROBOT_STUCK]: true
    });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
 
  // Load saved notification state and settings on mount
  useEffect(() => {
    if (isAuthenticated){
        loadNotificationState();
        loadNotifications();
    
        // Set up polling for real-time notifications
        const interval = setInterval(checkForNewNotifications, 30000); // Check every 30 seconds
    
        return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Load notification state from storage
  const loadNotificationState = async () => {
    try {
      const enabled = await AsyncStorage.getItem('notifications_enabled');
      if (enabled !== null) {
        setNotificationsEnabled(JSON.parse(enabled));
      }
      
      const settings = await AsyncStorage.getItem('notification_settings');
      if (settings !== null) {
        setNotificationSettings(JSON.parse(settings));
      }
    } catch (error) {
      console.error('Error loading notification state:', error);
    }
  };

  // Load notifications from storage
  const loadNotifications = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('robot_notifications');
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications(parsedNotifications);
        const unread = parsedNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Save notifications to storage
  const saveNotifications = async (updatedNotifications) => {
    try {
      await AsyncStorage.setItem('robot_notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  // Poll for new notifications from the server
  const checkForNewNotifications = async () => {
    if (!notificationsEnabled) return;
    
    try {
      // Fetch new notifications from API
      const response = await apiClient.get('/notifications');
      const newNotifications = response.data;
      
      if (newNotifications && newNotifications.length > 0) {
        // Process new notifications
        processNewNotifications(newNotifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Process new notifications from the server
  const processNewNotifications = (newNotifications) => {
    // Filter notifications based on user settings and that don't already exist
    const existingIds = new Set(notifications.map(n => n.id));
    
    const filteredNotifications = newNotifications.filter(notification => 
      (notificationSettings[notification.type] !== false) && 
      !existingIds.has(notification.id)
    );
    
    if (filteredNotifications.length === 0) return;
    
    const processedNewNotifications = filteredNotifications.map(notification => ({
      ...notification,
      data: notification.actor_id ? { requesterId: notification.actor_id} : null
    }));

    // Add to existing notifications
    const updatedNotifications = [
      ...processedNewNotifications,
      ...notifications
    ];
    
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    saveNotifications(updatedNotifications);
  };

  // Add a new notification locally
  const addNotification = (type, title, message, robotId = null, data = null) => {
    if (!notificationsEnabled || notificationSettings[type] === false) {
      return null; // Skip if notifications are disabled globally or for this type
    }
    
    const newNotification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      robotId,
      timestamp: new Date().toISOString(),
      read: false,
      data: data
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    setUnreadCount(unreadCount + 1);
    saveNotifications(updatedNotifications);
    
    return newNotification;
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);

      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId ? {...notification, read: true} : notification
      );
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      saveNotifications(updatedNotifications);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/mark-all-read');

      const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
    
      setNotifications(updatedNotifications);
      setUnreadCount(0);
      saveNotifications(updatedNotifications);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    saveNotifications([]);
    return true;
  };

  // Delete a specific notification
  const deleteNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    saveNotifications(updatedNotifications);
    return true;
  };

  // Toggle notifications enabled/disabled
  const toggleNotifications = async () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    
    try {
      await AsyncStorage.setItem('notifications_enabled', JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving notification state:', error);
    }
    
    return newState;
  };

  // Toggle individual notification type
  const toggleNotificationType = async (type) => {
    const updatedSettings = {
      ...notificationSettings,
      [type]: !notificationSettings[type]
    };
    
    setNotificationSettings(updatedSettings);
    
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
    
    return updatedSettings;
  };

  // Update notification settings
  const updateNotificationSettings = async (settings) => {
    setNotificationSettings(settings);
    
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
    
    return settings;
  };

  // Helper function to determine if notification type is enabled
  const isNotificationTypeEnabled = (type) => {
    return notificationsEnabled && notificationSettings[type];
  };

  // Battery low notification helper
  const notifyBatteryLow = (robotId, batteryLevel) => {
    return addNotification(
      NOTIFICATION_TYPES.BATTERY_LOW,
      'Battery Low',
      `Robot ${robotId} battery level is at ${batteryLevel}%`,
      robotId
    );
  };

  // New robot notification helper
  const notifyNewRobot = (robotId, addedBy) => {
    return addNotification(
      NOTIFICATION_TYPES.NEW_ROBOT,
      'New Robot Added',
      `${addedBy} has added robot ${robotId} to your account`,
      robotId
    );
  };

  // Storage full notification helper
  const notifyStorageFull = (robotId, storageLevel) => {
    return addNotification(
      NOTIFICATION_TYPES.STORAGE_FULL,
      'Storage Full',
      `Robot ${robotId} storage is at ${storageLevel}%`,
      robotId
    );
  };

  // Robot stuck notification helper
  const notifyRobotStuck = (robotId, location) => {
    return addNotification(
      NOTIFICATION_TYPES.ROBOT_STUCK,
      'Robot Stuck',
      `Robot ${robotId} is stuck${location ? ` at ${location}` : ''}`,
      robotId
    );
  };
  
  const notifyAccessRequest = (robotId, requesterName, requesterId) => {
    if (!notificationsEnabled || notificationSettings[NOTIFICATION_TYPES.ACCESS_REQUEST] === false) {
      return null;
    }

    const existingNotification = notifications.find(
      n => n.type === NOTIFICATION_TYPES.ACCESS_REQUEST && 
           n.robotId === robotId && 
           n.data?.requesterId === requesterId && 
           !n.read
    );

    if (existingNotification) {
      return existingNotification;
    }

    return addNotification(
      NOTIFICATION_TYPES.ACCESS_REQUEST,
      'Robot Access Request',
      `${requesterName} has requested access to robot ${robotId}`,
      robotId,
      { requesterId }
    );
  };
  

  return (
    <NotificationContext.Provider
      value={{
        // State
        notifications,
        unreadCount,
        notificationsEnabled,
        notificationSettings,
        
        // Core functions
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        setNotificationsEnabled,
        
        // Settings management
        toggleNotifications,
        toggleNotificationType,
        updateNotificationSettings,
        isNotificationTypeEnabled,
        
        // Helper notification creators
        notifyBatteryLow,
        notifyNewRobot,
        notifyStorageFull,
        notifyRobotStuck,
        notifyAccessRequest,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;