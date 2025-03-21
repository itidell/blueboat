import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import LanguageSelector from '../../Componets/LanguageSelector';
import NotificationController from '../../Componets/NotificationController';
import BottomNavBar from '../../Componets/BottomNavBar';

const LiveStreamingScreen = ({ robotBatteryLevel = 70, route }) => {
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
    navigation.navigate('Home')
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
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <TouchableOpacity onPress={handleHomePress} >
              <Image
                  source={require('../../../assets/imges/Logoo.png')} 
                  style={styles.logoImage}
              />
          </TouchableOpacity>
          <View>
            <Text style={styles.welcomeText}>Hi, Welcome</Text>
            <Text style={styles.usernameText}>User Name</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
            <LanguageSelector
              onLanguageChange={handleLanguageChange}
              initialLanguage={selectedLanguage}
            />
            <NotificationController
              onNotificationChange={handleNotificationChange}
              initialState={notificationsEnabled}
            />
        </View>
      </View>

      {/* Robot ID Display */}
      <View style={styles.robotIdContainer}>
        <Text style={styles.robotIdText}>ROBOT_ID : {robotId}</Text>
        <View style={styles.batteryContainer}>
          <Image 
            source={require('../../../assets/imges/battery.png')}
            style={styles.iconSmall}
          />
          <Text style={styles.batteryText}>{batteryLevel}%</Text>
        </View>
      </View>

      {/* Live Streaming Container */}
      <View style={styles.streamingContainer}>
        <View style={styles.videoContainer}>
          <TouchableOpacity style={styles.playButton}>
            <Image 
              source={require('../../../assets/imges/play.png')}
              style={styles.playIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab}/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#57C3EA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 8,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  usernameText: {
    fontSize: 12,
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSmall: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    fontSize: 12,
    marginLeft: 2,
  },
  robotIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  robotIdText: {
    fontSize: 14,
    fontWeight: '500',
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