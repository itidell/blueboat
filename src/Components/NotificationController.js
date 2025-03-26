import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Image } from 'react-native';

const NotificationController = ({ onNotificationChange, initialState = true }) => {
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(initialState);

  const toggleNotificationModal = () => {
    setNotificationModalVisible(!notificationModalVisible);
  };

  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    
    if (onNotificationChange) {
      onNotificationChange(newState);
    }
    
    console.log('Notifications:', newState ? 'Enabled' : 'Disabled');
  };

  return (
    <>
      {/* Notification Button */}
      <TouchableOpacity style={styles.notificationButton} onPress={toggleNotificationModal}>
        <Image 
          source={require('../../assets/images/bell.png')}
          style={styles.iconSmall}
        />
      </TouchableOpacity>

      {/* Notification Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={notificationModalVisible}
        onRequestClose={toggleNotificationModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={toggleNotificationModal}
        >
          <View style={styles.notificationModalContainer}>
            <View style={styles.notificationModal}>
              <View style={styles.notificationModalHeader}>
                <Text style={styles.notificationModalTitle}>Notification Settings</Text>
                <TouchableOpacity onPress={toggleNotificationModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Notification Option */}
              <TouchableOpacity 
                style={styles.notificationOption}
                onPress={toggleNotifications}
              >
                <Text style={styles.notificationOptionText}>
                  {notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
                </Text>
                <Text style={styles.checkmark}>{notificationsEnabled ? '✓' : ''}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.applyButton} onPress={toggleNotificationModal}>
                <Text style={styles.applyButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  notificationButton: {
    marginRight: 8,
  },
  iconSmall: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationModalContainer: {
    width: '80%',
    alignItems: 'center',
  },
  notificationModal: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  notificationModalHeader: {
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
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  notificationOptionText: {
    fontSize: 16,
    color: '#333',
  },
  checkmark: {
    fontSize: 18,
    color: '#098BEA',
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

export default NotificationController;