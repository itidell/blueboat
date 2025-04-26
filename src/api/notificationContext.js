// src/api/notificationContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  // Load saved notification state and settings on mount
  useEffect(() => {
    if (isAuthenticated){
        loadNotificationState();
        loadNotifications();
        checkForNewNotifications(true); // Initial fetch
        // Set up polling for real-time notifications
        const interval = setInterval(checkForNewNotifications, 30000); // Check every 30 seconds
    
        return () => clearInterval(interval);
    } else {
      // Clear notifications if user logs out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, notificationsEnabled]);

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
  const checkForNewNotifications = useCallback(
    async (forceRefresh = false) => {
      if (!isAuthenticated || (!notificationsEnabled && !forceRefresh)) return;
        console.log("NotificationContext: Checking for notifications...");
        setLoading(true);
        try{
          const response = await apiClient.get('/notifications')
          if (response && response.data){
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.read).length);
            setLastFetchTime(new Date());
            console.log(`NotificationContext: Fetched ${response.data.length} notifications.`); 
          }
        }catch (error) {
          console.error('NotificationContext: Failed to fetch notifications:', error);
        }finally {
          setLoading(false);
        }
      },[isAuthenticated, notificationsEnabled])
      
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
    if (!Number.isInteger(parseInt(notificationId))){
      console.warn(`Cannot mark non-server notification ${notificationId} as read.`);
      return false;
    }
    setLoading(true);
    try {
      // First update locally
      await apiClient.put(`/notifications/${notificationId}/mark-read`);
      await checkForNewNotifications(true); // Refresh notifications after marking as read
      setLoading(false);
      return true
    } catch (error){
      console.error('Error marking notification as read:', error);
      setLoading(false);
      Alert.alert("Error", "Could not mark notification as read.");
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await apiClient.put('/notifications/mark-all-read');
      await checkForNewNotifications(true);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setLoading(false);
      Alert.alert("Error", "Could not mark all notifications as read.");
      return false;
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    const serverNotifications = notifications.filter(n => Number.isInteger(parseInt(n.id)));
    if (serverNotifications.length === 0) return true; // Nothing to clear
    setLoading(true);
    try {
      setNotifications([]);
      setUnreadCount(0);
      await saveNotifications([]);
      
      const serverNotifications = notifications.filter(n => Number.isInteger(parseInt(n.id)));

      for (const notification of serverNotifications){
        try{
          await apiClient.delete(`/notifications/${notification.id}`)
        }catch (error) {
          console.error(`Failed to delete notification ${notification.id}:`, error);
          success = false;
        }
      }
      await checkForNewNotifications(true); 
    } catch (error){
      console.error('Error clearing notifications:', error);
      success = false;
      Alert.alert("Error", "Could not clear all notifications.");

    }finally{
      setLoading(false)
    }
    return success;
  };

  // Delete a specific notification
  const deleteNotification = async (notificationId) => {
    if (!Number.isInteger(parseInt(notificationId))) {
      console.warn(`Cannot delete non-server notification ${notificationId}.`);
       // Just remove locally if it was purely local
       setNotifications(prev => prev.filter(n => n.id !== notificationId));
       setUnreadCount(prev => prev - (notifications.find(n => n.id === notificationId && !n.read) ? 1 : 0));
      return true;
    }
    setLoading(true);
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      await checkForNewNotifications(true); // Refresh notifications after deletion
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      setLoading(false);
             Alert.alert("Error", "Could not delete notification.");
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
    // Check if globally enabled AND this type is enabled
    if (!notificationsEnabled || notificationSettings[NOTIFICATION_TYPES.BATTERY_LOW] === false) {
      console.log(`Skipping battery low notification for ${robotId} - notifications disabled or type disabled.`);
      return null;
    }

    // Check for existing *unread* battery low notification for THIS robot
    const existingUnread = notifications.find(
      n => n.type === NOTIFICATION_TYPES.BATTERY_LOW &&
           n.robotId === robotId && // Check specifically for the same robot ID
           !n.read // Only consider unread notifications
    );

    if (existingUnread) {
       console.log(`Skipping battery low notification for ${robotId} - existing unread notification found (ID: ${existingUnread.id}).`);
       return existingUnread; // Don't add a duplicate if one is already unread
    }

    console.log(`Creating new battery low notification for ${robotId} at ${batteryLevel}%`);
    // If no existing unread notification, proceed to add a new one
    return addNotification(
      NOTIFICATION_TYPES.BATTERY_LOW,
      'Battery Low', // Title
      `Robot ${robotId} battery level is critically low at ${batteryLevel}%`, // Message
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
        checkForNewNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;