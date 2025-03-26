import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Font from 'expo-font';

import Header from '../../Components/Header';
import BottomNavBar from '../../Components/BottomNavBar';
import RobotStatusHeader from '../../Components/RobotStatusHeader';

const RobotHomeScreen = ({ robotBatteryLevel = 70, route }) => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(robotBatteryLevel);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const {robotId} = route.params;

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins_semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
    
    const batteryMonitor = setInterval(() => {
      setBatteryLevel(currentLevel => {
        return robotBatteryLevel;
      });
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(batteryMonitor);
  }, [robotBatteryLevel]);

  const handlenavigateToLiveStreamingPress = () => {
    navigation.navigate('LiveStreaming',{robotId});
  };
  const handlenavigateToHistoricPress = () => {
    navigation.navigate('Historic',{robotId});
  };
  const handlenavigateToStorageScreenPress = () => {
    navigation.navigate('Storage',{robotId});
  };
  const handlenavigateToLocationAndControllerPress = () => {
    navigation.navigate('LocationAndController',{robotId});
  };
  const handleHomePress = () =>{
    navigation.navigate('MainHome', { screen: 'HomeMain' });
  };
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    console.log('Language selected:', language);
  };
  const handleNotificationChange = (isEnabled) =>{
    setNotificationsEnabled(isEnabled);
  }
  if (!fontsLoaded) return <View style={styles.container}><Text>Loading...</Text></View>;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#57C3EA" barStyle="dark-content" />
      
      {/* Header */}
      <Header
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        notificationsEnabled={notificationsEnabled}
        onNotificationChange={handleNotificationChange}
      />
      <RobotStatusHeader
        robotId={robotId}
        batteryLevel={batteryLevel}
      />

      {/* Main Menu Options */}
      <View style={styles.menuContainer}>
        <View style={styles.menuRow}>
          <TouchableOpacity onPress={handlenavigateToLocationAndControllerPress} style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Image 
                source={require('../../../assets/images/location.png')}
                style={styles.menuIcon}
              />
            </View>
            <Text style={styles.menuText}>Location & Controller</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handlenavigateToLiveStreamingPress}
            style={styles.menuItem}
            
          >
            <View style={styles.menuIconContainer}>
              <Image 
                source={require('../../../assets/images/liveStreaming.png')}
                style={styles.menuIcon}
              />
            </View>
            <Text style={styles.menuText}>Live Streaming</Text>
          </TouchableOpacity>
        </View>
        
        {/* Second Row */}
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItem} onPress={handlenavigateToStorageScreenPress}>
            <View style={styles.menuIconContainer}>
              <Image 
                source={require('../../../assets/images/storage.png')}
                style={styles.menuIcon}
              />
            </View>
            <Text style={styles.menuText}>Storage</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handlenavigateToHistoricPress}>
            <View style={styles.menuIconContainer}>
              <Image 
                source={require('../../../assets/images/historic.png')}
                style={styles.menuIcon}
              />
            </View>
            <Text style={styles.menuText}>Historic</Text>
          </TouchableOpacity>
        </View>
      </View> 
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} navigation={navigation}/>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#57C3EA',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    padding: 100,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#E8F4EA',
    borderRadius: 45,
    paddingVertical: 20,
  },
  menuIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 45,
    backgroundColor: '#E8F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuIcon: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '5800',
    color: '#000',
  },
});

export default RobotHomeScreen;