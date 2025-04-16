import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Image, FlatList, Alert } from 'react-native';
import { useNotifications, NOTIFICATION_TYPES } from '../api/notificationContext';


const NotificationController = ({ onNotificationChange, initialState}) => {
  // Use the notification context
  const {
    notifications,
    unreadCount,
    notificationsEnabled,
    notificationSettings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    toggleNotifications,
    toggleNotificationType,
    setNotificationsEnabled
  } = useNotifications();
  
  // Local UI state
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  useEffect(() => {
    if (initialState !== undefined && initialState !== notificationsEnabled){
      setNotificationsEnabled(initialState)
    }
  }, [initialState]);

  useEffect(() => {
    if(onNotificationChange && typeof onNotificationChange === 'function'){
      onNotificationChange(notificationsEnabled);
    }
  }, [notificationsEnabled, onNotificationChange])
  // Toggle notification list modal
  const toggleNotificationModal = () => {
    setNotificationModalVisible(!notificationModalVisible);
    if (!notificationModalVisible) {
      markAllAsRead();
    }
  };

  // Toggle notification settings modal
  const toggleSettingsModal = () => {
    setSettingsModalVisible(!settingsModalVisible);
  };

  // Helper function to get notification icon based on type
  const getNotificationIcon = (type) => {
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
        return require('../../assets/images/access.png');
      case NOTIFICATION_TYPES.ROBOT_STATUS_CHANGED:
        return require('../../assets/images/yacht-black.png'); // Add appropriate image
      case NOTIFICATION_TYPES.ROBOT_ACCESS_GRANTED:
        return require('../../assets/images/granted.png'); // Add appropriate image
      case NOTIFICATION_TYPES.ROBOT_ACCESS_SHARED:
        return require('../../assets/images/yacht-black.png'); // Add appropriate image
      case NOTIFICATION_TYPES.ROBOT_ACCESSED:
        return require('../../assets/images/accessed.png'); // Add appropriate image
      default:
        return require('../../assets/images/bell.png');
    }
  };

  // Render each notification item
  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, item.read ? {} : styles.unreadNotification]}
      onPress={() => markAsRead(item.id)}
    >
      <Image source={getNotificationIcon(item.type)} style={styles.notificationIcon} />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Notification Button with Badge */}
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

      {/* Notification List Modal */}
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
                <TouchableOpacity 
                  style={styles.settingsButton} 
                  onPress={toggleSettingsModal}
                >
                  <Image 
                    source={require('../../assets/images/settings.png')}
                    style={styles.iconSmall}
                  />
                </TouchableOpacity>
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
                  renderItem={renderNotificationItem}
                  keyExtractor={item => item.id}
                  style={styles.notificationList}
                />
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={clearAllNotifications}
                >
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              </>
            ) : (
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

      {/* Notification Settings Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={settingsModalVisible}
        onRequestClose={toggleSettingsModal}
      >
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
                
                <TouchableOpacity 
                  style={styles.settingOption}
                  onPress={() => toggleNotificationType(NOTIFICATION_TYPES.BATTERY_LOW)}
                >
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

                <TouchableOpacity 
                  style={styles.settingOption}
                  onPress={() => toggleNotificationType(NOTIFICATION_TYPES.NEW_ROBOT)}
                >
                  <View style={styles.settingOptionContent}>
                    <Image 
                      source={require('../../assets/images/add.png')}
                      style={styles.settingIcon}
                    />
                    <Text style={styles.settingOptionText}>New Robot Added</Text>
                  </View>  
                  <View style={[
                    styles.toggleSwitch, 
                    notificationSettings[NOTIFICATION_TYPES.NEW_ROBOT] ? styles.toggleActive : styles.toggleInactive
                  ]}>
                    <View style={[
                      styles.toggleKnob,
                      notificationSettings[NOTIFICATION_TYPES.NEW_ROBOT] ? styles.toggleKnobRight : styles.toggleKnobLeft
                    ]} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.settingOption}
                  onPress={() => toggleNotificationType(NOTIFICATION_TYPES.STORAGE_FULL)}
                >
                  <View style={styles.settingOptionContent}>
                    <Image 
                      source={require('../../assets/images/storage.png')}
                      style={styles.settingIcon}
                    />
                    <Text style={styles.settingOptionText}>Storage Full</Text>
                  </View>
                  <View style={[
                    styles.toggleSwitch, 
                    notificationSettings[NOTIFICATION_TYPES.STORAGE_FULL] ? styles.toggleActive : styles.toggleInactive
                  ]}>
                    <View style={[
                      styles.toggleKnob,
                      notificationSettings[NOTIFICATION_TYPES.STORAGE_FULL] ? styles.toggleKnobRight : styles.toggleKnobLeft
                    ]} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.settingOption}
                  onPress={() => toggleNotificationType(NOTIFICATION_TYPES.ROBOT_STUCK)}
                >
                  <View style={styles.settingOptionContent}>
                    <Image 
                      source={require('../../assets/images/stuck.png')}
                      style={styles.settingIcon}
                    />
                    <Text style={styles.settingOptionText}>Robot Stuck</Text>
                  </View>
                  <View style={[
                    styles.toggleSwitch, 
                    notificationSettings[NOTIFICATION_TYPES.ROBOT_STUCK] ? styles.toggleActive : styles.toggleInactive
                  ]}>
                    <View style={[
                      styles.toggleKnob,
                      notificationSettings[NOTIFICATION_TYPES.ROBOT_STUCK] ? styles.toggleKnobRight : styles.toggleKnobLeft
                    ]} />
                  </View>
                </TouchableOpacity>
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

const styles = StyleSheet.create({
  notificationButton: {
    marginRight: 8,
    position: 'relative',
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
    maxHeight: 400,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    alignItems: 'center',
  },
  unreadNotification: {
    backgroundColor: 'rgba(9, 139, 234, 0.05)',
  },
  notificationIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
  clearButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    paddingVertical: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 5,
    color: '#333',
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
});

export default NotificationController