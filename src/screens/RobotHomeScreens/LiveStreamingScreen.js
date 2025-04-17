import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Font from 'expo-font';

import Header from '../../Components/Header';
import BottomNavBar from '../../Components/BottomNavBar';
import RobotStatusHeader from '../../Components/RobotStatusHeader';


const LiveStreamingScreen = ({ robotBatteryLevel, route }) => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(robotBatteryLevel);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [activeTab, setActiveTab] = useState('home');
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
    
    // Battery monitoring
    const batteryMonitor = setInterval(() => {
      setBatteryLevel(robotBatteryLevel);
    }, 30000);
    
    return () => clearInterval(batteryMonitor);
  }, [robotBatteryLevel]);
 
  const handleHomePress = () =>{
    navigation.navigate('MainHome', { 
      screen: 'RobotHome',
      params: { robotId } 
    });
  };
  const handleGoBack = () => {
    navigation.goBack();
  };
  const handleLanguageChange = (language) =>{
    setSelectedLanguage(language);
    console.log('Language selected', language);
  };
  const handleNotificationChange = (isEnabled) =>{
    setNotificationsEnabled(isEnabled);
  };

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

      {/* Robot ID Display */}
      <RobotStatusHeader
        robotId={robotId}
        batteryLevel={batteryLevel}
      />
      
      {/* Live Streaming Container */}
      <View style={styles.streamingContainer}>
        <View style={styles.videoContainer}>
          <TouchableOpacity style={styles.playButton}>
            <Image 
              source={require('../../../assets/images/play.png')}
              style={styles.playIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} navigation={navigation}/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#57C3EA',
  },
  streamingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  videoContainer: {
    width: '100%',
    height: 300,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  playIcon: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
});

export default LiveStreamingScreen;