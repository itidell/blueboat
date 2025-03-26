import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar, Switch, Alert } from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import Header from '../../Components/Header';
import BottomNavBar from '../../Components/BottomNavBar';
import RobotStatusHeader from '../../Components/RobotStatusHeader';

// Constants
const VIEW_MODES = {
  MAP: 'map',
  LIVESTREAM: 'livestream'
};

const DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
  STOP: 'stop'
};

const BATTERY_CHECK_INTERVAL = 30000; // 30 seconds

const LocationAndControllerScreen = ({ route }) => {
  const navigation = useNavigation();
  const { robotId = 'ROBOT_1', robotBatteryLevel = 70 } = route?.params || {};
  
  // State management
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(robotBatteryLevel);
  const [activeTab, setActiveTab] = useState('home');
  const [activeView, setActiveView] = useState(VIEW_MODES.MAP);

  const [robotPosition, setRobotPosition] = useState({ x: 245, y: 187 });
  const [savedPositions, setSavedPositions] = useState([]);
  const [streamStatus, setStreamStatus] = useState('Connected');
  const [controllerEnabled, setControllerEnabled] = useState(false);

  // Load fonts
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins_semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
      });
      setFontsLoaded(true);
    };
    
    loadFonts();
  }, []);
  
  // Battery monitoring
  useEffect(() => {
    const batteryMonitor = setInterval(() => {
      setBatteryLevel(robotBatteryLevel);
    }, BATTERY_CHECK_INTERVAL);
    
    return () => clearInterval(batteryMonitor);
  }, [robotBatteryLevel]);

  // Handlers as memoized callbacks for better performance
  const handleDirectionPress = useCallback((direction) => {
    if (!controllerEnabled) {
      Alert.alert('Controller Disabled', 'Please enable the controller first.');
      return;
    }
    
    // Simulate robot movement
    switch(direction) {
      case DIRECTIONS.UP:
        setRobotPosition(prev => ({ ...prev, y: Math.max(0, prev.y - 10) }));
        break;
      case DIRECTIONS.DOWN:
        setRobotPosition(prev => ({ ...prev, y: Math.min(300, prev.y + 10) }));
        break;
      case DIRECTIONS.LEFT:
        setRobotPosition(prev => ({ ...prev, x: Math.max(0, prev.x - 10) }));
        break;
      case DIRECTIONS.RIGHT:
        setRobotPosition(prev => ({ ...prev, x: Math.min(400, prev.x + 10) }));
        break;
      case DIRECTIONS.STOP:
        // Optional: Add any specific stop logic
        break;
    }
    console.log(`Robot moving: ${direction}`);
  }, [robotId, controllerEnabled]);

  const handleSavePosition = useCallback(() => {
    const newPosition = {
      id: savedPositions.length + 1,
      robotId: robotId,
      timestamp: new Date().toLocaleString(),
      position: robotPosition
    };

    // If it's the first saved position, mark it as home
    if (savedPositions.length === 0) {
      newPosition.isHome = true;
    }

    setSavedPositions(prev => [...prev, newPosition]);

    Alert.alert(
      'Position Saved', 
      `Position X: ${robotPosition.x}, Y: ${robotPosition.y} has been saved.`,
      [{ text: 'OK' }]
    );
  }, [robotPosition, robotId, savedPositions]);

  const handleReturnToHome = useCallback(() => {
    // Find the home position (first saved position)
    const homePosition = savedPositions.find(pos => pos.isHome);
    
    if (homePosition) {
      setRobotPosition(homePosition.position);
      Alert.alert(
        'Returning Home', 
        `Moving to saved home position: X: ${homePosition.position.x}, Y: ${homePosition.position.y}`,
        [{ text: 'OK' }]
      );
    } else {
      // If no home position is saved, set to a default position
      const defaultHomePosition = { x: 245, y: 187 };
      setRobotPosition(defaultHomePosition);
      Alert.alert(
        'Returning Home', 
        `No saved home position. Moving to default: X: ${defaultHomePosition.x}, Y: ${defaultHomePosition.y}`,
        [{ text: 'OK' }]
      );
    }
  }, [savedPositions]);

  const toggleView = useCallback((mode) => {
    setActiveView(mode);
  }, []);

  const toggleController = useCallback((value) => {
    setControllerEnabled(value);
    console.log(`Controller ${value ? 'enabled' : 'disabled'}`);
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#57C3EA" barStyle="dark-content" />
      
      {/* Header Component */}
      <Header />

      {/* Robot Status Header */}
      <RobotStatusHeader 
        robotId={robotId} 
        batteryLevel={batteryLevel} 
      />

      {/* View Toggle Component */}
      <View style={styles.toggleContainerWrapper}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              activeView === VIEW_MODES.MAP ? styles.toggleActive : styles.toggleInactive
            ]} 
            onPress={() => toggleView(VIEW_MODES.MAP)}
          >
            <Image 
              source={require('../../../assets/images/location.png')}
              style={[
                styles.toggleIcon,
                activeView === VIEW_MODES.MAP ? styles.toggleIconActive : styles.toggleIconInactive
              ]}
            />
            <Text style={[
              styles.toggleText, 
              activeView === VIEW_MODES.MAP ? styles.toggleTextActive : styles.toggleTextInactive
            ]}>
              Map View
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              activeView === VIEW_MODES.LIVESTREAM ? styles.toggleActive : styles.toggleInactive
            ]} 
            onPress={() => toggleView(VIEW_MODES.LIVESTREAM)}
          >
            <Image 
              source={require('../../../assets/images/liveStreaming.png')}
              style={[
                styles.toggleIcon,
                activeView === VIEW_MODES.LIVESTREAM ? styles.toggleIconActive : styles.toggleIconInactive
              ]}
            />
            <Text style={[
              styles.toggleText, 
              activeView === VIEW_MODES.LIVESTREAM ? styles.toggleTextActive : styles.toggleTextInactive
            ]}>
              Live Stream
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Map/Livestream View */}
        <View style={styles.topSection}>
          {activeView === VIEW_MODES.MAP ? (
            <View style={styles.mapView}>
              <Text style={styles.placeholderText}>Robot Location Map</Text>
              <Text style={styles.subtext}>Current Position: X: {robotPosition.x}, Y: {robotPosition.y}</Text>
            </View>
          ) : (
            <View style={styles.livestreamView}>
              <Text style={styles.placeholderText}>Live Video Feed</Text>
              <Text style={styles.subtext}>Connection Status: {streamStatus}</Text>
            </View>
          )}
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.savePositionButton}
              onPress={handleSavePosition}
            >
              <Image 
                source={require('../../../assets/images/storage.png')}
                style={styles.saveButtonIcon}
              />
              <Text style={styles.saveButtonText}>SAVE POSITION</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.returnHomeButton}
              onPress={handleReturnToHome}
            >
              <Image 
                source={require('../../../assets/images/home.png')}
                style={styles.returnHomeButtonIcon}
              />
              <Text style={styles.returnHomeButtonText}>RETURN HOME</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Controller Section */}
        <View style={styles.bottomSection}>
          <View style={styles.controllerHeader}>
            <Text style={styles.controllerTitle}>Robot Controller</Text>
            <View style={styles.controllerToggleContainer}>
              <Text style={[
                styles.controllerToggleLabel,
                controllerEnabled ? styles.controllerEnabledText : styles.controllerDisabledText
              ]}>
                {controllerEnabled ? 'ENABLED' : 'DISABLED'}
              </Text>
              <Switch
                value={controllerEnabled}
                onValueChange={toggleController}
                trackColor={{ false: "#d3d3d3", true: "#81c784" }}
                thumbColor={controllerEnabled ? "#4CAF50" : "#f4f3f4"}
                ios_backgroundColor="#d3d3d3"
                style={styles.smallerSwitch}
              />
            </View>
          </View>
          
          <View style={[
            styles.controlsContainer, 
            !controllerEnabled && styles.controlsDisabled
          ]}>
            <View style={styles.directionRow}>
              <View style={styles.spacer} />
              <TouchableOpacity 
                style={[styles.directionButton, !controllerEnabled && styles.buttonDisabled]}
                onPress={() => handleDirectionPress(DIRECTIONS.UP)}
                disabled={!controllerEnabled}
              >
                <Image 
                  source={require('../../../assets/images/up.png')}
                  style={[styles.arrowIcon, !controllerEnabled && styles.iconDisabled]}
                />
              </TouchableOpacity>
              <View style={styles.spacer} />
            </View>
            
            <View style={styles.directionRow}>
              <TouchableOpacity 
                style={[styles.directionButton, !controllerEnabled && styles.buttonDisabled]}
                onPress={() => handleDirectionPress(DIRECTIONS.LEFT)}
                disabled={!controllerEnabled}
              >
                <Image 
                  source={require('../../../assets/images/right.png')}
                  style={[styles.arrowIcon, !controllerEnabled && styles.iconDisabled]}
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.directionButton, styles.stopButton, !controllerEnabled && styles.stopButtonDisabled]}
                onPress={() => handleDirectionPress(DIRECTIONS.STOP)}
                disabled={!controllerEnabled}
              >
                <Text style={[styles.stopText, !controllerEnabled && styles.stopTextDisabled]}>STOP</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.directionButton, !controllerEnabled && styles.buttonDisabled]}
                onPress={() => handleDirectionPress(DIRECTIONS.RIGHT)}
                disabled={!controllerEnabled}
              >
                <Image 
                  source={require('../../../assets/images/left.png')}
                  style={[styles.arrowIcon, !controllerEnabled && styles.iconDisabled]}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.directionRow}>
              <View style={styles.spacer} />
              <TouchableOpacity 
                style={[styles.directionButton, !controllerEnabled && styles.buttonDisabled]}
                onPress={() => handleDirectionPress(DIRECTIONS.DOWN)}
                disabled={!controllerEnabled}
              >
                <Image 
                  source={require('../../../assets/images/down.png')}
                  style={[styles.arrowIcon, !controllerEnabled && styles.iconDisabled]}
                />
              </TouchableOpacity>
              <View style={styles.spacer} />
            </View>
          </View>
        </View>
      </View>
      
      {/* Fixed Bottom NavBar */}
      <View style={styles.bottomNavContainer}>
        <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#57C3EA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#57C3EA',
  },
  toggleContainerWrapper: {
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    width: '90%', 
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E8F4EA',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#E8F4EA',
    borderWidth: 1,
    borderColor: '#3A8FB7',
  },
  toggleInactive: {
    backgroundColor: '#57C3EA',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    marginRight: 6,
  },
  toggleIconActive: {
    tintColor: '#555555',
  },
  toggleIconInactive: {
    tintColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins_semibold',
  },
  toggleTextActive: {
    color: '#555555',
  },
  toggleTextInactive: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingBottom: 8,
    marginBottom: 66,
  },
  topSection: {
    flex: 1.6,
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  mapView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  livestreamView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 17,
    color: '#999',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePositionButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 8,
    tintColor: 'white',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Poppins_semibold',
  },
  returnHomeButton: {
    flexDirection: 'row',
    backgroundColor: '#f44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  returnHomeButtonIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 8,
    tintColor: 'white',
  },
  returnHomeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Poppins_semibold',
  },
  bottomSection: {
    flex: 1.4,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  controllerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  controllerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_semibold',
  },
  controllerToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controllerToggleLabel: {
    fontSize: 12,
    marginRight: 4,
    fontWeight: 'bold',
  },
  controllerEnabledText: {
    color: '#4CAF50',
  },
  controllerDisabledText: {
    color: '#f44336',
  },
  smallerSwitch: {
    transform: [{ scaleX: 1 }, { scaleY: 1 }],
  },
  controlsContainer: {
    opacity: 1,
  },
  controlsDisabled: {
    opacity: 0.5,
  },
  directionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginRight: 30,
    marginLeft: 30,
  },
  directionButton: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonDisabled: {
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  iconDisabled: {
    opacity: 0.5,
  },
  spacer: {
    width: 45,
  },
  stopButton: {
    backgroundColor: 'red',
  },
  stopButtonDisabled: {
    backgroundColor: '#ffcccb',
  },
  stopText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  stopTextDisabled: {
    color: '#f8f8f8',
  },
  arrowIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  }
});

export default LocationAndControllerScreen;