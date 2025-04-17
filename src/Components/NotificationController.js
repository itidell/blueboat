import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Image, FlatList, Alert, ActivityIndicator } from 'react-native'; // Added ActivityIndicator
import { useNotifications, NOTIFICATION_TYPES } from '../api/notificationContext';
import { useRobot } from '../api/robotContext'; // Import useRobot
import { formatDistanceToNow } from 'date-fns'; // Import for better time display

const NotificationController = ({ onNotificationChange, initialState }) => {
  // Use the notification context
  const {
    notifications,
    unreadCount,
    notificationsEnabled,
    notificationSettings,
    markAsRead, // We'll use this after approve/deny
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    toggleNotifications,
    toggleNotificationType,
    setNotificationsEnabled,
    refreshNotifications, // Use this to update list after action
  } = useNotifications();

  // Use the robot context for actions
  const { approveRobotAccess, denyRobotAccess, loading: robotLoading } = useRobot(); // Get needed functions

  // Local UI state
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [processingIds, setProcessingIds] = useState([]); // State to track ongoing approve/deny actions

  useEffect(() => {
    if (initialState !== undefined && initialState !== notificationsEnabled) {
      setNotificationsEnabled(initialState);
    }
  }, [initialState]);

  useEffect(() => {
    if (onNotificationChange && typeof onNotificationChange === 'function') {
      onNotificationChange(notificationsEnabled);
    }
  }, [notificationsEnabled, onNotificationChange]);

  // Toggle notification list modal
  const toggleNotificationModal = () => {
    setNotificationModalVisible(!notificationModalVisible);
    // Consider if markAllAsRead should happen here or be explicit button
    // if (!notificationModalVisible) {
    //   markAllAsRead();
    // }
  };

  // Toggle notification settings modal
  const toggleSettingsModal = () => {
    setSettingsModalVisible(!settingsModalVisible);
  };

  // --- Action Handlers ---

  const handleApprove = async (notification) => {
    const robotId = notification.robot_id;
    const requesterId = notification.data?.actor_id; // Use optional chaining

    if (!robotId || !requesterId) {
      Alert.alert("Error", "Missing data to approve this request.");
      return;
    }

    const processingId = notification.id; // Use notification ID to track processing
    setProcessingIds(prev => [...prev, processingId]);

    try {
      console.log("Approving access via NotificationController for robot:", robotId, "requester:", requesterId);
      await approveRobotAccess(robotId, requesterId);
      Alert.alert("Success", "Access request approved successfully.");
      // Mark as read locally and attempt server update
      await markAsRead(notification.id);
      // Refresh the notification list from the server
      await refreshNotifications();
    } catch (error) {
      console.error('Failed to approve request:', error);
      Alert.alert("Error", error.message || "Failed to approve access request");
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== processingId));
    }
  };

  const handleDeny = async (notification) => {
    const robotId = notification.robotId;
    const requesterId = notification.data?.requesterId; // Use optional chaining

    if (!robotId || !requesterId) {
      Alert.alert("Error", "Missing data to deny this request.");
      return;
    }

    const processingId = notification.id;
    setProcessingIds(prev => [...prev, processingId]);

    try {
      console.log("Denying access via NotificationController for robot:", robotId, "requester:", requesterId);
      await denyRobotAccess(robotId, requesterId);
      Alert.alert("Success", "Access request denied.");
      // Mark as read locally and attempt server update
      await markAsRead(notification.id);
      // Refresh the notification list from the server
      await refreshNotifications();
    } catch (error) {
      console.error('Failed to deny request:', error);
      Alert.alert("Error", error.message || "Failed to deny access request");
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== processingId));
    }
  };


  // Helper function to get notification icon based on type
  const getNotificationIcon = (type) => {
    // ... (keep your existing switch statement for icons)
      switch (type) {
      case NOTIFICATION_TYPES.BATTERY_LOW:
        return require('../../assets/images/battery.png');
      case NOTIFICATION_TYPES.NEW_ROBOT:
        return require('../../assets/images/adding.png'); // Or a more appropriate image
      case NOTIFICATION_TYPES.STORAGE_FULL:
        return require('../../assets/images/storage.png');
      case NOTIFICATION_TYPES.ROBOT_STUCK:
        return require('../../assets/images/stuck.png');
      case NOTIFICATION_TYPES.ACCESS_REQUEST:
        return require('../../assets/images/access.png'); // Specific icon for requests
      case NOTIFICATION_TYPES.ROBOT_STATUS_CHANGED:
        return require('../../assets/images/yacht-black.png'); // Add appropriate image
      case NOTIFICATION_TYPES.ROBOT_ACCESS_GRANTED:
        return require('../../assets/images/granted.png'); // Add appropriate image
      case NOTIFICATION_TYPES.ROBOT_ACCESS_SHARED:
        return require('../../assets/images/yacht-black.png'); // Add appropriate image
      case NOTIFICATION_TYPES.ROBOT_ACCESSED:
        return require('../../assets/images/accessed.png'); // Add appropriate image
       case NOTIFICATION_TYPES.ACCESS_DENIED: // Add case for denied
         return require('../../assets/images/restriction.png'); // Create or find a 'denied' icon
       case NOTIFICATION_TYPES.ROBOT_ACCESS_REQUEST_SENT: // Add case for sent
         return require('../../assets/images/send.png'); // Create or find a 'sent' icon
      default:
        return require('../../assets/images/bell.png');
    }
  };

  // Render each notification item - MODIFIED
  const renderNotificationItem = ({ item }) => {
    const isAccessRequest = item.type === NOTIFICATION_TYPES.ACCESS_REQUEST;
    // Check if the current notification action is processing
    const isProcessing = processingIds.includes(item.id);
    // Check if the request might have already been handled (e.g., marked read or maybe data indicates status)
    // We rely on refreshNotifications to remove it, but dimming read requests is good UX.
    const isHandled = item.read; // Simple check: if read, assume handled or user dismissed

    return (
      <View style={[styles.notificationItemContainer, isHandled && !isAccessRequest ? styles.readItem : {}]}>
        <TouchableOpacity
          style={[styles.notificationItem, isHandled && !isAccessRequest ? styles.readItemContent : {}]}
          onPress={() => !isAccessRequest && markAsRead(item.id)} // Only mark non-actionable items read on tap
          disabled={isProcessing} // Disable tap while processing
        >
          <Image source={getNotificationIcon(item.type)} style={styles.notificationIcon} />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </Text>
          </View>
          {/* Only show delete for non-access requests or if it's already handled */}
          {(!isAccessRequest || isHandled) && !isProcessing && (
             <TouchableOpacity
                style={styles.deleteButtonSmall} // Use a smaller delete button maybe?
                onPress={() => deleteNotification(item.id)}
             >
                <Text style={styles.deleteButtonText}>×</Text>
             </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* --- Action Buttons for Access Requests --- */}
        {isAccessRequest && !isHandled && ( // Show buttons only for unread/unhandled access requests
          <View style={styles.actionButtonContainer}>
            {isProcessing ? (
              <ActivityIndicator size="small" color="#098BEA" style={styles.activityIndicator} />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(item)}
                  disabled={isProcessing}
                >
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.denyButton]}
                  onPress={() => handleDeny(item)}
                  disabled={isProcessing}
                >
                  <Text style={styles.actionButtonText}>Deny</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {/* Notification Button with Badge (Existing) */}
      <TouchableOpacity style={styles.notificationButton} onPress={toggleNotificationModal}>
        <Image
          source={require('../../assets/images/bell.png')}
          style={styles.iconSmall}
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notification List Modal (Existing) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={notificationModalVisible}
        onRequestClose={toggleNotificationModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notificationModalContainer}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationModalTitle}>Notifications</Text>
              <View style={styles.headerButtons}>
                {/* Keep Settings Button */}
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={toggleSettingsModal}
                >
                  <Image
                    source={require('../../assets/images/settings.png')}
                    style={styles.iconSmall}
                  />
                </TouchableOpacity>
                {/* Keep Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={toggleNotificationModal}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>

            {notifications.length > 0 ? (
              <>
                <FlatList
                  data={notifications}
                  renderItem={renderNotificationItem} // Uses the modified renderer
                  keyExtractor={item => item.id.toString()} // Ensure key is string
                  style={styles.notificationList}
                />
                {/* Consider adding explicit Mark All Read / Clear buttons if needed */}
                 <View style={styles.footerButtons}>
                    <TouchableOpacity
                      style={styles.footerButton}
                      onPress={markAllAsRead}
                    >
                       <Text style={styles.footerButtonText}>Mark All Read</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.footerButton}
                      onPress={clearAllNotifications}
                    >
                       <Text style={styles.footerButtonText}>Clear All</Text>
                    </TouchableOpacity>
                 </View>
              </>
            ) : (
              // Keep Empty State
              <View style={styles.emptyStateContainer}>
                 <Image
                   source={require('../../assets/images/bell.png')}
                   style={styles.emptyStateIcon}
                 />
                 <Text style={styles.emptyStateText}>No notifications</Text>
               </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Notification Settings Modal (Existing - Unchanged) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={settingsModalVisible}
        onRequestClose={toggleSettingsModal}
      >
         {/* ... rest of your settings modal code ... */}
         <View style={styles.modalOverlay}>
          <View style={styles.settingsModalContainer}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationModalTitle}>Notification Settings</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={toggleSettingsModal}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Global Notification Toggle */}
            <TouchableOpacity
              style={styles.settingOption}
              onPress={toggleNotifications}
            >
              <Text style={styles.settingOptionText}>
                {notificationsEnabled ? 'Disable All Notifications' : 'Enable All Notifications'}
              </Text>
              <View style={[
                styles.toggleSwitch,
                notificationsEnabled ? styles.toggleActive : styles.toggleInactive
              ]}>
                <View style={[
                  styles.toggleKnob,
                  notificationsEnabled ? styles.toggleKnobRight : styles.toggleKnobLeft
                ]} />
              </View>
            </TouchableOpacity>

            {/* Individual Notification Type Settings */}
            {notificationsEnabled && (
              <>
                <Text style={styles.sectionTitle}>Notification Types</Text>

                 {/* Example for Access Request Toggle */}
                 <TouchableOpacity
                  style={styles.settingOption}
                  onPress={() => toggleNotificationType(NOTIFICATION_TYPES.ACCESS_REQUEST)}
                 >
                    <View style={styles.settingOptionContent}>
                       <Image
                         source={require('../../assets/images/access.png')} // Use the correct icon
                         style={styles.settingIcon}
                       />
                       <Text style={styles.settingOptionText}>Access Requests</Text>
                    </View>
                    <View style={[
                       styles.toggleSwitch,
                       notificationSettings[NOTIFICATION_TYPES.ACCESS_REQUEST] ? styles.toggleActive : styles.toggleInactive
                    ]}>
                       <View style={[
                         styles.toggleKnob,
                         notificationSettings[NOTIFICATION_TYPES.ACCESS_REQUEST] ? styles.toggleKnobRight : styles.toggleKnobLeft
                       ]} />
                    </View>
                 </TouchableOpacity>


                {/* ... include other toggles for BATTERY_LOW, NEW_ROBOT, etc. ... */}
                <TouchableOpacity
                  style={styles.settingOption}
                  onPress={() => toggleNotificationType(NOTIFICATION_TYPES.BATTERY_LOW)}
                >
                  {/* ... Battery Low Toggle ... */}
                   <View style={styles.settingOptionContent}>
                    <Image
                      source={require('../../assets/images/battery.png')}
                      style={styles.settingIcon}
                    />
                    <Text style={styles.settingOptionText}>Battery Low</Text>
                  </View>
                  <View style={[
                    styles.toggleSwitch,
                    notificationSettings[NOTIFICATION_TYPES.BATTERY_LOW] ? styles.toggleActive : styles.toggleInactive
                  ]}>
                    <View style={[
                      styles.toggleKnob,
                      notificationSettings[NOTIFICATION_TYPES.BATTERY_LOW] ? styles.toggleKnobRight : styles.toggleKnobLeft
                    ]} />
                  </View>
                </TouchableOpacity>
                 {/* ... Add toggles for NEW_ROBOT, STORAGE_FULL, ROBOT_STUCK, etc. ... */}

              </>
            )}

            <TouchableOpacity style={styles.applyButton} onPress={toggleSettingsModal}>
              <Text style={styles.applyButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

// --- Add/Modify Styles ---
const styles = StyleSheet.create({
  // ... (Keep all your existing styles) ...

  // Style for the container of each notification item + its potential actions
  notificationItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    marginBottom: 5, // Add some space between items
  },
  // Modified style for the main content part of the notification item
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10, // Adjust padding as needed
    alignItems: 'center',
    // Remove borderBottom here, it's on the container now
  },
  readItem: {
     backgroundColor: '#f9f9f9', // Slightly different background for read items container
  },
  readItemContent: {
     opacity: 0.7, // Dim the content of read items slightly
  },
  notificationIcon: {
    width: 30, // Slightly larger icon maybe?
    height: 30,
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 15, // Slightly adjusted size
    marginBottom: 3,
    color: '#333',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555', // Darker grey
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11, // Smaller time text
    color: '#888',
  },
   deleteButtonSmall: { // Optional: smaller delete button for less emphasis
     padding: 5, // Increase tappable area
     marginLeft: 5,
   },
  deleteButtonText: {
    fontSize: 20, // Keep size or adjust
    color: '#aaa', // Lighter color
    fontWeight: 'bold',
  },

  // Styles for the action buttons container
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align buttons to the right
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: -5, // Pull up slightly closer to message
    marginBottom: 5,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20, // Rounded buttons
    marginLeft: 10,
    minWidth: 90, // Ensure minimum width
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
     shadowOffset: {width: 0, height: 1},
     shadowOpacity: 0.15,
     shadowRadius: 1.5
  },
  approveButton: {
    backgroundColor: '#4CAF50', // Green
    shadowColor: '#388E3C',
  },
  denyButton: {
    backgroundColor: '#F44336', // Red
    shadowColor: '#D32F2F',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activityIndicator: {
    marginHorizontal: 20, // Space for the indicator when loading
  },
  // Footer buttons inside the modal
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 10,
    marginTop: 10,
  },
  footerButton: {
     padding: 8,
  },
  footerButtonText: {
     color: '#098BEA',
     fontSize: 14,
     fontWeight: '500',
  },

  // ... (Keep all your other existing styles like modalOverlay, settingsModalContainer, etc.)
  // Ensure you have styles for settingOption, toggleSwitch, etc. from the original file
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationModalContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  settingsModalContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingBottom: 10,
    marginBottom: 15,
  },
  notificationModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#098BEA',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    marginRight: 10,
  },
    iconSmall: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
    badge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    lineHeight: 22,
  },
  notificationList: {
    // maxHeight: 400, // Adjust max height if needed
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 150, // Ensure empty state takes some space
  },
  emptyStateIcon: {
    width: 60,
    height: 60,
    opacity: 0.3,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15, // Increased margin
    marginBottom: 10, // Increased margin
    color: '#333',
    paddingHorizontal: 5, // Align with options
  },
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
    settingOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
    settingIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  settingOptionText: {
    fontSize: 16,
    color: '#333',
  },
   toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 3,
  },
  toggleActive: {
    backgroundColor: '#098BEA',
  },
  toggleInactive: {
    backgroundColor: '#D1D1D1',
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'white',
  },
  toggleKnobLeft: {
    alignSelf: 'flex-start',
  },
  toggleKnobRight: {
    alignSelf: 'flex-end',
  },
  applyButton: {
    backgroundColor: '#098BEA',
    borderRadius: 25,
    paddingVertical: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
   notificationButton: { // Ensure this exists if used outside the component
    marginRight: 8,
    position: 'relative',
  },

});

export default NotificationController;