import React, { useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Import the components from the original code
import Header from '../../Components/Header';
import BottomNavBar from '../../Components/BottomNavBar';
import RobotStatusHeader from '../../Components/RobotStatusHeader';

const HistoricScreen = ({ route }) => {
  const navigation = useNavigation();
  const { robotId = 'robotId', robotBatteryLevel = 70 } = route?.params || {};
  
  const [activeTab, setActiveTab] = useState('home');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    console.log('Language selected:', language);
  };

  const handleNotificationChange = (isEnabled) => {
    setNotificationsEnabled(isEnabled);
  };

  const scheduleData = [
    {
      email: 'bouhinichiheb@gmail.com',
      location: 'Location',
      time: '18:27 - April 30',
    },
    {
      email: 'ayyoutertani@gmail.com',
      location: 'Location',
      time: '17:00 - April 28',
    },
    {
      email: 'bouhinichiheb@gmail.com',
      location: 'Location',
      time: '8:30 - April 18',
    },
    {
      email: 'ayyoutertani@gmail.com',
      location: 'Location',
      time: '7:30 - April 08',
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#57C3EA" barStyle="dark-content" />
      
      {/* Header Component */}
      <Header
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        notificationsEnabled={notificationsEnabled}
        onNotificationChange={handleNotificationChange}
      />

      {/* Robot Status Header */}
      <RobotStatusHeader 
        robotId={robotId} 
        batteryLevel={robotBatteryLevel} 
      />
      
      {/* Schedule Container */}
      <View style={styles.scheduleContainer}>
        {/* Month Header */}
        <View style={styles.monthHeader}>
          <Text style={styles.monthText}>April</Text>
          <TouchableOpacity 
            activeOpacity={0.7} // Added for better touch feedback
            onPress={() => {/* Optional: Add calendar navigation */}}
          >
            <Image 
              source={require('../../../assets/images/calendar.png')} 
              style={styles.calendarIcon} 
              resizeMode="contain" // Improved image rendering
            />
          </TouchableOpacity>
        </View>

        {/* Schedule Items */}
        <View style={styles.scheduleItemsContainer}>
          {scheduleData.map((item, index) => (
            <View 
              key={index} 
              style={[
                styles.scheduleItem,
                // Add last item's bottom border removal
                index === scheduleData.length - 1 && { borderBottomWidth: 0 }
              ]}
            >
              <Text style={styles.emailText}>{item.email}</Text>
              <View style={styles.scheduleDetails}>
                <Image 
                  source={require('../../../assets/images/location.png')} 
                  style={styles.locationIcon} 
                  resizeMode="contain" // Consistent image rendering
                />
                <Text style={styles.locationText}>{item.location}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Navigation */}
      <BottomNavBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#57C3EA',
  },
  scheduleContainer: {
    flex: 1,
    backgroundColor: '#FFFFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    top: 70,
    bottom: 0,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center', // Improved vertical alignment
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarIcon: {
    width: 24,
    height: 24,
  },
  scheduleItemsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scheduleItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  emailText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scheduleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
  },
  locationText: {
    flex: 1,
    color: 'gray',
  },
  timeText: {
    color: 'gray',
  },
});

export default HistoricScreen;