// src/api/notificationContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';
import { useAuth } from './authContext';
// Notification types
export const NOTIFICATION_TYPES = {
  BATTERY_LOW: 'BATTERY_LOW',
  NEW_ROBOT: 'NEW_ROBOT',
  STORAGE_FULL: 'STORAGE_FULL',
  ACCESS_REQUEST: 'ACCESS_REQUEST',
  ROBOT_STUCK: 'ROBOT_STUCK',
  ROBOT_STATUS_CHANGED: 'ROBOT_STATUS_CHANGED',
  ROBOT_ACCESS_GRANTED: 'ROBOT_ACCESS_GRANTED',
  ROBOT_ACCESS_SHARED: 'ROBOT_ACCESS_SHARED',
  ROBOT_ACCESSED: 'ROBOT_ACCESSED',
  ROBOT_ACCESS_REQUEST_SENT: 'ROBOT_ACCESS_REQUEST_SENT',
  ACCESS_DENIED: 'ACCESS_DENIED'
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
      [NOTIFICATION_TYPES.ROBOT_STUCK]: true,
      [NOTIFICATION_TYPES.ACCESS_REQUEST]: true,
      [NOTIFICATION_TYPES.ROBOT_STATUS_CHANGED]: true,
      [NOTIFICATION_TYPES.ROBOT_ACCESS_GRANTED]: true,
      [NOTIFICATION_TYPES.ROBOT_ACCESS_SHARED]: true,
      [NOTIFICATION_TYPES.ROBOT_ACCESSED]: true,
      [NOTIFICATION_TYPES.ROBOT_ACCESS_REQUEST_SENT]: true,
      [NOTIFICATION_TYPES.ACCESS_DENIED]: true
    });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(null);
 
  // Load saved notification state and settings on mount
  useEffect(() => {
    if (isAuthenticated){
        loadNotificationState();
        loadNotifications();
    
        // Set up polling for real-time notifications
        const interval = setInterval(checkForNewNotifications, 30000); // Check every 30 seconds
    
        return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  // Load notification state from storage
  const loadNotificationState = async () => {
    try {
      const enabled = await AsyncStorage.getItem('notifications_enabled');
      if (enabled !== null) {
        setNotificationsEnabled(JSON.parse(enabled));
      }
      
      const settings = await AsyncStorage.getItem('notification_settings');
      if (settings !== null) {
        setNotificationSettings(prevSettings => ({
          ...prevSettings,
          ...JSON.parse(settings)
        }));
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
      
      // Now fetch from server to get the latest
      await checkForNewNotifications(true);
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
  const checkForNewNotifications = async (forceRefresh = false) => {
    if (!notificationsEnabled && !forceRefresh) return;
    if (!isAuthenticated) return;
    
    try {
      // Fetch new notifications from API
      const response = await apiClient.get('/notifications');
      
      if (response && response.data) {
        // Process new notifications
        processServerNotifications(response.data);
        setLastFetchTime(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Process notifications from the server
  const processServerNotifications = (serverNotifications) => {
    if (!serverNotifications || serverNotifications.length === 0) return;
    
    // Create a map of existing notifications for quick lookup
    const existingNotificationMap = new Map();
    notifications.forEach(notification => {
      existingNotificationMap.set(notification.id, notification);
    });
    
    // Identify new notifications and update existing ones
    const updatedNotifications = [...notifications];
    let hasChanges = false;
    
    serverNotifications.forEach(serverNotification => {
      // Check if this notification already exists locally
      const existingNotification = existingNotificationMap.get(serverNotification.id);
      
      if (!existingNotification) {
        // This is a new notification
        const newNotification = {
          ...serverNotification,
          data: serverNotification.actor_id ? { requesterId: serverNotification.actor_id } : null
        };
        
        // Only add if enabled for this type
        if (notificationSettings[serverNotification.type] !== false) {
          updatedNotifications.unshift(newNotification);
          hasChanges = true;
        }
      } else if (existingNotification.read !== serverNotification.read) {
        // Update read status if changed on server
        const index = updatedNotifications.findIndex(n => n.id === serverNotification.id);
        if (index !== -1) {
          updatedNotifications[index].read = serverNotification.read;
          hasChanges = true;
        }
      }
    });
    
    if (hasChanges) {
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      saveNotifications(updatedNotifications);
    }
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
      // First update locally
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId ? {...notification, read: true} : notification
      );
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      saveNotifications(updatedNotifications);
      
      if (Number.isInteger(parseInt(notificationId))) {
        await apiClient.put(`/notifications/${notificationId}/read`);
      }
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // If server update fails, we keep the local update
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // First update locally
      const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
      saveNotifications(updatedNotifications);
      
      // Then sync with server
      await apiClient.put('/notifications/mark-all-read');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // If server update fails, we keep the local update
      return false;
    }
  };

  // Clear all notifications
  const clearAllNotifications =async () => {
    try{
      setNotifications([]);
      setUnreadCount(0);
      await saveNotifications([]);
      
      const serverNotifications = notifications.filter(n => Number.isInteger(parseInt(n.id)));

      for (const notification of serverNotifications){
        try{
          await apiClient.delete(`/notifications/${notification.id}`)
        }catch (error) {
          console.error(`Failed to delete notification ${notification.id}:`, error);
        }
      }
      return true;
    } catch (error){
      console.error('Error clearing notifications:', error);
      return false;
    }
  };

  // Delete a specific notification
  const deleteNotification = async (notificationId) => {
    try {
      // Update locally first
      const updatedNotifications = notifications.filter(
        notification => notification.id !== notificationId
      );
      
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      saveNotifications(updatedNotifications);
      
      // Delete from server if it's a server notification
      if (Number.isInteger(parseInt(notificationId))) {
        await apiClient.delete(`/notifications/${notificationId}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Keep local deletion even if server deletion fails
      return false;
    }
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

  // NOTIFICATION HELPER FUNCTIONS

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
  
  // Access request notification helper
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
      { requesterId: requesterId,
        robotId: robotId 
      }
    );
  };
  
  // Robot status changed notification helper
  const notifyRobotStatusChanged = (robotId, oldStatus, newStatus) => {
    return addNotification(
      NOTIFICATION_TYPES.ROBOT_STATUS_CHANGED,
      'Robot Status Changed',
      `Robot ${robotId} status changed from ${oldStatus} to ${newStatus}`,
      robotId
    );
  };
  
  // Access granted notification helper
  const notifyAccessGranted = (robotId, ownerName) => {
    return addNotification(
      NOTIFICATION_TYPES.ROBOT_ACCESS_GRANTED,
      'Robot Access Granted',
      `${ownerName} has granted you access to robot ${robotId}`,
      robotId
    );
  };
  
  // Robot accessed notification helper
  const notifyRobotAccessed = (robotId, accessorName, accessorId) => {
    return addNotification(
      NOTIFICATION_TYPES.ROBOT_ACCESSED,
      'Robot Accessed',
      `${accessorName} has accessed your robot ${robotId}`,
      robotId,
      { accessorId }
    );
  };
  
  // Access request sent notification helper
  const notifyAccessRequestSent = (robotId, ownerName) => {
    return addNotification(
      NOTIFICATION_TYPES.ROBOT_ACCESS_REQUEST_SENT,
      'Access Request Sent',
      `You have requested access to robot ${robotId} owned by ${ownerName}`,
      robotId
    );
  };

  // Access denied notification helper
  const notifyAccessDenied = (robotId, ownerName) => {
    return addNotification(
      NOTIFICATION_TYPES.ACCESS_DENIED,
      'Access Denied',
      `${ownerName} has denied your request to access robot ${robotId}`,
      robotId
    );
  };

  // Force refresh notifications
  const refreshNotifications = () => {
    return checkForNewNotifications(true);
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
        refreshNotifications,
        
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
        notifyRobotStatusChanged,
        notifyAccessGranted,
        notifyRobotAccessed,
        notifyAccessRequestSent,
        notifyAccessDenied,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;