import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';

const LiveStreamingScreen = ({ robotBatteryLevel = 70, route }) => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(robotBatteryLevel);
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
          <TouchableOpacity style={styles.languageButton}>
            <Image 
              source={require('../../../assets/imges/language.png')}
              style={styles.iconSmall}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <Image 
              source={require('../../../assets/imges/bell.png')}
              style={styles.iconSmall}
            />
          </TouchableOpacity>
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
      <View style={styles.bottomNavbar}>
        <TouchableOpacity style={styles.navbarItem} onPress={() => navigation.navigate('RobotHome')}>
          <View style={styles.navbarIconContainer}>
            <Image 
              source={require('../../../assets/imges/home.png')}
              style={styles.navbarIcon}
            />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')} style={styles.navbarItem}>
          <Image 
            source={require('../../../assets/imges/search.png')}
            style={styles.navbarIcon}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navbarItem}>
          <View style={styles.navbarCenterButton}>
            <Image 
              source={require('../../../assets/imges/add.png')}
              style={styles.navbarCenterIcon}
            />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navbarItem}>
          <Image 
            source={require('../../../assets/imges/profile.png')}
            style={styles.navbarIcon}
          />
        </TouchableOpacity>
      </View>
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
  languageButton: {
    marginRight: 15,
  },
  notificationButton: {
    marginRight: 8,
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
  bottomNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#E8F4EA',
    borderTopLeftRadius: 65,
    borderTopRightRadius: 65,
    paddingVertical: 10,
    paddingHorizontal: 25,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navbarItem: {
    padding: 8,
  },
  navbarIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  navbarIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#57C3EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbarCenterButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbarCenterIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  }
});

export default LiveStreamingScreen;