// src/components/AccessRequests.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { useNotifications, NOTIFICATION_TYPES } from '../api/notificationContext';
import { useRobot } from '../api/robotContext';
import { formatDistanceToNow } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const AccessRequests = () => {
  const navigation = useNavigation();
  const { 
    notifications, 
    markAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useNotifications();
  
  const { 
    approveRobotAccess, 
    pendingRequests, 
    loadPendingAccessRequests 
  } = useRobot();
  
  const [visible, setVisible] = useState(false);
  const [processingIds, setProcessingIds] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'requests'
  
  useEffect(() => {
    if (visible) {
      loadPendingAccessRequests();
    }
  }, [visible]);
  
  useEffect(() => {
    // Map pending requests to include notification details
    const requests = pendingRequests.map(request => {
      // Find matching notification
      const notification = notifications.find(
        n => n.type === NOTIFICATION_TYPES.ACCESS_REQUEST && 
             n.robotId === request.robot_id &&
             !n.read
      );
      
      return {
        ...request,
        notification_id: notification?.id,
        timestamp: notification?.timestamp || request.timestamp
      };
    });
    
    setAccessRequests(requests);
  }, [pendingRequests, notifications]);

  const handleApprove = async (request) => {
    if (!request.robot_id || !request.requester_id) {
      console.error("Missing required data for approval", request);
      Alert.alert("Error", "Missing required data for approval");
      return;
    }
    
    try {
      setProcessingIds(prev => [...prev, request.notification_id]);
      console.log("Approving access for robot:", request.robot_id, "requester:", request.requester_id);
      const result = await approveRobotAccess(request.robot_id, request.requester_id);
      console.log("Approval result:", result);
      
      // Mark the notification as read if it exists
      if (request.notification_id) {
        await markAsRead(request.notification_id);
      }
      Alert.alert("Success", "Access request approved successfully");
      await loadPendingAccessRequests();
    } catch (error) {
      console.error('Failed to approve request:', error);
      Alert.alert("Error", error.message || "Failed to approve access request");
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== request.notification_id));
    }
  };

  const handleDeny = async (request) => {
    if (!request.notification_id) {
      console.error("Missing notification ID for denial", request);
      Alert.alert("Error", "Missing notification ID for denial");
      return;
    }
    
    try {
      setProcessingIds(prev => [...prev, request.notification_id]);
      
      if (request.notification_id) {
        await markAsRead(request.notification_id);
      }
      Alert.alert("Success", "Access request denied");
      await loadPendingAccessRequests();
    } catch (error) {
      console.error('Failed to deny request:', error);
      Alert.alert("Error", error.message || "Failed to deny access request");
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== request.notification_id));
    }
  };

  const handleNotificationPress = (notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    if (notification.type === NOTIFICATION_TYPES.ACCESS_REQUEST) {
      // First set the active tab to 'requests' to show access requests
      setVisible(true)
      setActiveTab('requests');
      loadPendingAccessRequests();
      // If we have the requesterId in the notification data, we can pre-select it
      if (notification.data && notification.data.requesterId) {
        console.log('Access request notification clicked:', notification);
        // Look for the matching request in our access requests
        const matchingRequest = accessRequests.find(
          req => req.requester_id === notification.data.requesterId && 
                 req.robot_id === notification.robotId
        );
        
        if (matchingRequest) {
          handleApprove(matchingRequest)
          // If found, we could highlight it or scroll to it
          // This would require additional implementation
          console.log('Found matching request:', matchingRequest);
        }
      }
      return;
    }
  };

  const renderNotificationItem = ({ item }) => {
    const isAccessRequest = item.type === NOTIFICATION_TYPES.ACCESS_REQUEST;
    
    return (
      <TouchableOpacity 
        style={[styles.item, !item.read && styles.unread]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.itemContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          {item.timestamp && (
            <Text style={styles.time}>
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderAccessRequestItem = ({ item }) => {
    const isProcessing = processingIds.includes(item.notification_id);
    
    return (
      <View style={[styles.item, styles.requestItem]}>
        <View style={styles.itemContent}>
          <Text style={styles.title}>{item.requester_name || 'Unknown User'}</Text>
          <Text style={styles.message}>Requested access to Robot: {item.robot_id}</Text>
          {item.timestamp && (
            <Text style={styles.time}>
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </Text>
          )}
        </View>
        
        <View style={styles.actionButtons}>
          {isProcessing ? (
            <ActivityIndicator size="small" color="#4caf50" />
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.approveButton]} 
                onPress={() => handleApprove(item)}
                disabled={isProcessing}
              >
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.denyButton]} 
                onPress={() => handleDeny(item)}
                disabled={isProcessing}
              >
                <Text style={styles.buttonText}>Deny</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'requests') {
      return accessRequests;
    }
    return notifications;
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="notifications-none" size={60} color="#ccc" />
      <Text style={styles.emptyText}>
        {activeTab === 'requests' 
          ? 'No pending access requests' 
          : 'No notifications'}
      </Text>
    </View>
  );

  return (
    <>
      <TouchableOpacity 
        style={styles.notificationButton}
        onPress={() => setVisible(true)}
      >
        <Icon name="notifications" size={24} color="#098BEA" />
        {(notifications.filter(n => !n.read).length > 0) && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notifications.filter(n => !n.read).length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Notification Center</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setVisible(false)}
              >
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                onPress={() => setActiveTab('all')}
              >
                <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                  All Notifications
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
                onPress={() => setActiveTab('requests')}
              >
                <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
                  Access Requests
                  {accessRequests.length > 0 && (
                    <Text style={styles.countBadge}> ({accessRequests.length})</Text>
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={getFilteredNotifications()}
              keyExtractor={(item) => (item.notification_id || item.id || Math.random().toString()).toString()}
              renderItem={activeTab === 'requests' ? renderAccessRequestItem : renderNotificationItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={renderEmptyList}
            />

            {getFilteredNotifications().length > 0 && activeTab === 'all' && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearAllNotifications}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#098BEA',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#555',
    lineHeight: 24,
  },
  tabs: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  tab: {
    padding: 8,
    marginRight: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#098BEA',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#098BEA',
    fontWeight: '500',
  },
  countBadge: {
    color: '#098BEA',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  requestItem: {
    flexDirection: 'column',
    paddingBottom: 16,
  },
  unread: {
    backgroundColor: 'rgba(9, 139, 234, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: '#098BEA',
  },
  itemContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  deleteButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 22,
    color: '#888',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4caf50',
  },
  denyButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 12,
  },
  clearButton: {
    margin: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#666',
    fontWeight: '500',
  },
});

export default AccessRequests;