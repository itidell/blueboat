// src/components/AccessRequests.js
import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRobot } from '../api/robotContext';
import { useNotifications } from '../api/notificationContext';
import { formatDistanceToNow } from 'date-fns';

const AccessRequests = () => {
  const { pendingRequests, loadPendingAccessRequests, approveRobotAccess } = useRobot();
  const { markAsRead } = useNotifications();

  useEffect(() => {
    loadPendingAccessRequests();
  }, []);

  const handleApprove = async (request) => {
    try {
      await approveRobotAccess(request.robot_id, request.requester_id);
      await markAsRead(request.notification_id);
      Alert.alert('Success', `Access granted to ${request.requester_name}`);
      // Refresh the list
      loadPendingAccessRequests();
    } catch (error) {
      Alert.alert('Error', `Failed to approve request: ${error.message}`);
    }
  };

  const handleDeny = async (request) => {
    try {
      // Just mark the notification as read to "deny" the request
      await markAsRead(request.notification_id);
      Alert.alert('Success', `Request from ${request.requester_name} denied`);
      // Refresh the list
      loadPendingAccessRequests();
    } catch (error) {
      Alert.alert('Error', `Failed to deny request: ${error.message}`);
    }
  };

  if (pendingRequests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No pending access requests</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Pending Access Requests</Text>
      <FlatList
        data={pendingRequests}
        keyExtractor={(item) => item.notification_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.requestItem}>
            <View style={styles.requestInfo}>
              <Text style={styles.requesterName}>{item.requester_name}</Text>
              <Text style={styles.robotId}>Robot: {item.robot_id}</Text>
              <Text style={styles.timestamp}>
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.button, styles.approveButton]} 
                onPress={() => handleApprove(item)}
              >
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.denyButton]} 
                onPress={() => handleDeny(item)}
              >
                <Text style={styles.buttonText}>Deny</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  requestItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestInfo: {
    marginBottom: 12,
  },
  requesterName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  robotId: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});

export default AccessRequests;