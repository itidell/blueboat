import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import LanguageSelector from '../Componets/LanguageSelector';
import NotificationController from '../Componets/NotificationController';
import { isEnabled } from 'react-native/Libraries/Performance/Systrace';

const RobotHomeScreen = ({ robotBatteryLevel = 70, route }) => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(robotBatteryLevel);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
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

  const handlenavigateToLiveStreamingPress = () => {
    navigation.navigate('LiveStreaming',{robotId});
  };
  const handleAddNewRobotPress = () =>{
    navigation.navigate('AddRobot')
  };
  const handleHomePress = () =>{
    navigation.navigate('Home')
  };
  const handleSearchPress = () =>{
    navigation.navigate('SearchScreen')
  };
  const handleProfilePress = () =>{
    navigation.navigate('ProfileScreen')
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
          
          <TouchableOpacity onPress={handlenavigateToLiveStreamingPress}
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
          <TouchableOpacity 
            style={[styles.navbarItem, activeTab === 'home' ? styles.activeNavItem : null]}
            onPress={() =>{
              setActiveTab('home');
              handleHomePress();
            }}
          >
            <View style={styles.navbarCenterButton}>
                <Image
                    source={require('../../../assets/imges/home.png')}
                    style={styles.navbarIcon}
                />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navbarItem, activeTab === 'search' ? styles.activeNavItem : null]}
            onPress={() => {
                setActiveTab('search');
                handleSearchPress();
            }}
          >
              <Image 
                  source={require('../../../assets/imges/search.png')}
                  style={styles.navbarIcon}
              />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navbarItem, activeTab === 'add' ? styles.activeNavItem : null]}
            onPress={() => {
                setActiveTab('add');
                handleAddNewRobotPress();
            }}
          >
              <Image
                  source={require('../../../assets/imges/add.png')}
                  style={styles.navbarCenterIcon}
              />
          </TouchableOpacity>
          <TouchableOpacity 
              style={[styles.navbarItem, activeTab === 'profile' ? styles.activeNavItem : null]}
              onPress={() => {
                  setActiveTab('profile');
                  handleProfilePress();
              }}
          >
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeNavItem: {
    alignItems:'center',
    justifyContent:'center',
    width: 42,
    height: 42,
    backgroundColor: '#57C3EA',
    borderRadius: 15,
    padding: 10,
    elevation:2,
  },
  navbarCenterIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  }
});

export default RobotHomeScreen;