import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';

const RobotHomeScreen = ({ robotBatteryLevel = 70, route }) => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(robotBatteryLevel);
  const { robotId } = route.params;
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins_semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
    
    // This would be replaced with your actual robot battery monitoring
    const batteryMonitor = setInterval(() => {
      // Simulating battery updates - replace with your actual implementation
      // that connects to your robot's battery level
      setBatteryLevel(currentLevel => {
        // This is just a placeholder. Replace with your actual battery data source
        return robotBatteryLevel;
      });
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(batteryMonitor);
  }, [robotBatteryLevel]);

  const navigateToLiveStreaming = () => {
    navigation.navigate('LiveStreamingScreen');
  };

  if (!fontsLoaded) return <View style={styles.container}><Text>Loading...</Text></View>;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#57C3EA" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Image 
            source={require('../../../assets/imges/Logoo.png')} 
            style={styles.logoImage}
          />
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
        <Text style={styles.robotIdText}>ROBOT ID: {robotId}</Text>
        <View style={styles.batteryContainer}>
          <Image 
            source={require('../../../assets/imges/battery.png')}
            style={styles.iconSmall}
          />
          <Text style={styles.batteryText}>{batteryLevel}%</Text>
        </View>
      </View>

      {/* Main Menu Options */}
      <View style={styles.menuContainer}>
        {/* First Row */}
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Image 
                source={require('../../../assets/imges/location.png')}
                style={styles.menuIcon}
              />
            </View>
            <Text style={styles.menuText}>Location</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('LiveStreaming')}
            style={styles.menuItem}
            
          >
            <View style={styles.menuIconContainer}>
              <Image 
                source={require('../../../assets/imges/liveStreaming.png')}
                style={styles.menuIcon}
              />
            </View>
            <Text style={styles.menuText}>Live Streaming</Text>
          </TouchableOpacity>
        </View>
        
        {/* Second Row */}
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Image 
                source={require('../../../assets/imges/storage.png')}
                style={styles.menuIcon}
              />
            </View>
            <Text style={styles.menuText}>Storage</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Image 
                source={require('../../../assets/imges/historic.png')}
                style={styles.menuIcon}
              />
            </View>
            <Text style={styles.menuText}>Historic</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavbar}>
        <TouchableOpacity style={styles.navbarItem}>
          <View style={styles.navbarCenterButton}>
            <Image 
              source={require('../../../assets/imges/home.png')}
              style={styles.navbarIcon}
            />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')} style={styles.navbarItem } >
          <Image 
            source={require('../../../assets/imges/search.png')}
            style={styles.navbarIcon}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navbarCenterItem}>
          <Image 
            source={require('../../../assets/imges/add.png')}
            style={styles.navbarCenterIcon}
          />
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

const screenWidth = Dimensions.get('window').width;
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
  navbarCenterItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navbarCenterButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#57C3EA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  navbarCenterIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  }
});

export default RobotHomeScreen;