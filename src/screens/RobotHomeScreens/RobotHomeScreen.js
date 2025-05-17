import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar, Alert, Dimensions, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Font from 'expo-font';

import Header from '../../Components/Header';
import BottomNavBar from '../../Components/BottomNavBar';
import RobotStatusHeader from '../../Components/RobotStatusHeader';
import { useRobot } from '../../api/robotContext';
import { useTranslation } from 'react-i18next';
const { width, height } = Dimensions.get('window');
const CIRCLE_RADIUS = width * 0.38; // Increased from 0.28 to 0.38

const RobotHomeScreen = ({ robotBatteryLevel , route }) => {
  const navigation = useNavigation();
  const {currentRobot} = useRobot();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const {robotId} = route.params;
  const {t} = useTranslation();
  // Animation for menu items
  const scaleAnim = useState(new Animated.Value(0))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];
  const batteryLevel = currentRobot?.realtime?.battery?.level_percentage ?? 'N/A';
  
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins_semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
    
    // Animate menu appearance
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      })
    ]).start();
    
    return () => clearInterval();
  }, [robotBatteryLevel]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Menu items configuration
  const menuItems = [
    {
      id: 'location',
      title: t('robotHome.menuLocation'),
      icon: require('../../../assets/images/location.png'),
      onPress: () => navigation.navigate('LocationAndController', {robotId}),
      color: '#E8F4EA',
      angle: 135, // Position at 45 degrees on the circle
    },
    {
      id: 'emergency',
      title: t('robotHome.menuEmergency'),
      icon: require('../../../assets/images/emergency-stop.png'), // You'll need this image
      onPress: handleEmergencyStop,
      color: '#FF3B30',
      angle: 45, // Position at 135 degrees
    },
    {
      id: 'storage',
      title: t('robotHome.menuStorage'),
      icon: require('../../../assets/images/storage.png'),
      onPress: () => navigation.navigate('Storage', {robotId}),
      color: '#E8F4EA',
      angle: 225, // Position at 225 degrees
    },
    {
      id: 'historic',
      title: t('robotHome.menuHistoric'),
      icon: require('../../../assets/images/historic.png'),
      onPress: () => navigation.navigate('Historic', {robotId}),
      color: '#E8F4EA',
      angle: 315, // Position at 315 degrees
    },
  ];

  function handleEmergencyStop() {
    Alert.alert(
      "Emergency Stop",
      "Are you sure you want to stop the robot immediately?",
      [
        {
          text: t('common.cancel'),
          style: "cancel"
        },
        { 
          text: t("STOP"), 
          onPress: () => {
            // Add your emergency stop logic here
            console.log('Emergency stop activated for robot ID:', robotId);
          },
          style: "destructive"
        }
      ]
    );
  }
  const handleNotificationChange = (isEnabled) => {
    setNotificationsEnabled(isEnabled);
  };
  
  if (!fontsLoaded) return <View style={styles.container}><Text>{t('common.loading')}</Text></View>;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#57C3EA" barStyle="dark-content" />
      
      {/* Header */}
      <Header/>
      <RobotStatusHeader
        robotId={robotId}
        batteryLevel={batteryLevel}
      />

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Radial Menu - Now bigger and positioned higher */}
        <View style={styles.radialMenuContainer}>
          {/* Background circles */}
          <View style={styles.backgroundCircle} />
          <View style={styles.outerRing} />
          
          {/* Central Robot Icon */}
          <Animated.View style={[styles.centerCircle, {transform: [{rotate: spin}]}]}>
            <View style={styles.innerCircle}>
              <Image 
                source={require('../../../assets/images/yacht.png')} 
                style={styles.centerIcon}
              />
            </View>
          </Animated.View>
          
          {/* Menu Items */}
          {menuItems.map((item) => {
            // Calculate position based on angle
            const angleRad = (item.angle * Math.PI) / 180;
            const left = CIRCLE_RADIUS * Math.cos(angleRad);
            const top = CIRCLE_RADIUS * Math.sin(angleRad);
            
            return (
              <Animated.View 
                key={item.id}
                style={[
                  styles.menuItemPosition,
                  {
                    transform: [
                      { translateX: left },
                      { translateY: top },
                      { scale: scaleAnim }
                    ]
                  }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: item.color }
                  ]}
                  onPress={item.onPress}
                >
                  <Image source={item.icon} style={styles.menuIcon} />
                </TouchableOpacity>
                <Text style={styles.menuText}>
                  {item.title}
                </Text>
              </Animated.View>
            );
          })}
        </View>
        
        {/* Empty space below the radial menu */}
        <View style={styles.spacer} />
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
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  radialMenuContainer: {
    height: height * 0.65, // Increased from 0.6 to 0.65 of screen height
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30, // Pulled higher on screen
  },
  spacer: {
    flex: 1, // Takes the remaining space below the radial menu
  },
  backgroundCircle: {
    position: 'absolute',
    width: width * 0.85, // Increased from 0.7 to 0.85
    height: width * 0.85, // Increased from 0.7 to 0.85
    borderRadius: width * 0.425,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  outerRing: {
    position: 'absolute',
    width: width * 0.8, // Increased from 0.6 to 0.8
    height: width * 0.8, // Increased from 0.6 to 0.8
    borderRadius: width * 0.4,
    borderWidth: 3, // Increased from 2 to 3
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
  },
  centerCircle: {
    width: 140, // Increased from 110 to 140
    height: 140, // Increased from 110 to 140
    borderRadius: 70,
    backgroundColor: '#E8F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  innerCircle: {
    width: 120, // Increased from 90 to 120
    height: 120, // Increased from 90 to 120
    borderRadius: 60,
    backgroundColor: '#57C3EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerIcon: {
    width: 80, // Increased from 60 to 80
    height: 80, // Increased from 60 to 80
    resizeMode: 'contain',
  },
  menuItemPosition: {
    position: 'absolute',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 100, // Increased from 80 to 100
    height: 100, // Increased from 80 to 100
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 6, // Increased from 5 to 6
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  menuIcon: {
    width: 55, // Increased from 45 to 55
    height: 55, // Increased from 45 to 55
    resizeMode: 'contain',
  },
  menuText: {
    fontSize: 14, // Increased from 12 to 14
    fontWeight: 'bold', // Changed from '600' to 'bold' for more emphasis
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10, // Increased from 8 to 10
    paddingVertical: 3, // Increased from 2 to 3
    borderRadius: 12, // Increased from 10 to 12
    maxWidth: 160, // Added maxWidth to control text wrapping
  },
});

export default RobotHomeScreen;