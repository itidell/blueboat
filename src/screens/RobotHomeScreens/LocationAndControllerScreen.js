import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar, Switch, Alert, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import Header from '../../Components/Header';
import BottomNavBar from '../../Components/BottomNavBar';
import RobotStatusHeader from '../../Components/RobotStatusHeader';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { useRobot } from '../../api/robotContext';
import { useAuth } from '../../api/authContext';
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
  const { robotId } = route?.params || {};
  
  // Check for robotId early
  useEffect(() => {
    if (!robotId) {
      console.error("FATAL: robotId is missing in LocationAndControllerScreen");
      Alert.alert("Error", "Robot ID not provided.", [{ text: "OK", onPress: () => navigation.goBack() }]);
    }
  }, [robotId, navigation]);
  
  if (!robotId) {
    // Return early if no robotId is provided
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>Robot ID not provided.</Text>
        <TouchableOpacity 
          style={styles.returnHomeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.returnHomeButtonText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const { 
    currentRobot, 
    getRobot, 
    loading: robotContextLoading, 
    realtimeLoading, 
    commandLoading, 
    error: robotError, 
    sendRobotCommand, 
    acquireRobotControl, 
    releaseRobotControl
  } = useRobot();
  
  const { user } = useAuth();
  
  // State management
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeView, setActiveView] = useState(VIEW_MODES.MAP);
  
  const isCurrentUserControlling = currentRobot?.control?.controller_user_id === user?.id;
  const isControlAcquiredBySomeone = !!currentRobot?.control?.controller_user_id;
  const controllerEnabled = isCurrentUserControlling;
  const controlAquirerName = currentRobot?.control?.controller_user_name || "another user";
  const batteryLevel = currentRobot?.realtime?.battery?.level_percentage ?? 'N/A';
  const location = currentRobot?.realtime?.location;
  const robotCoordinates = location?.latitude && location?.longitude 
    ? { latitude: location.latitude, longitude: location.longitude } 
    : null;
  const currentPositionText = robotCoordinates 
    ? `Lat: ${robotCoordinates.latitude.toFixed(4)}, Lon: ${robotCoordinates.longitude.toFixed(4)}` 
    : 'Position Unknown';
  const streamActive = currentRobot?.realtime?.live_stream?.is_active ?? false;
  const streamUrl = currentRobot?.realtime?.live_stream?.stream_url;
  const mapRef = useRef(null);
  
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
  
  // Robot data fetching when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (robotId) {
        console.log(`LocationScreen focused, fetching data for robot: ${robotId}`);
        getRobot(robotId);
        
        // Set up periodic battery check
        const interval = setInterval(() => {
          getRobot(robotId);
        }, BATTERY_CHECK_INTERVAL);
        
        return () => {
          clearInterval(interval);
        };
      } else {
        console.error("LocationScreen: robotId is missing!");
      }
    }, [robotId, getRobot])
  );

  // Center map on robot position when coordinates change
  useEffect(() => {
    if (robotCoordinates && mapRef.current && activeView === VIEW_MODES.MAP) {
      mapRef.current.animateToRegion({
        latitude: robotCoordinates.latitude,
        longitude: robotCoordinates.longitude,
        latitudeDelta: 0.005, // Zoom level
        longitudeDelta: 0.005, // Zoom level
      }, 1000); // Animation duration in ms
    }
  }, [robotCoordinates, activeView]);

  // Handlers as memoized callbacks for better performance
  const handleDirectionPress = useCallback(async (direction) => {
    if (!controllerEnabled) {
      Alert.alert('Controller Disabled', 'Please enable the controller first.');
      return;
    }
    const success = await sendRobotCommand(robotId, direction);
    if (!success) {
      Alert.alert('Command Failed', robotError || 'Could not send command.');
    }
    
    console.log(`Robot moving: ${direction}`);
  }, [robotId, controllerEnabled, sendRobotCommand, robotError]);

  const handleSavePosition = useCallback(() => {
    // Implement position saving functionality
    if (!robotCoordinates) {
      Alert.alert('Error', 'Cannot save position: robot location unknown.');
      return;
    }
    
    Alert.alert(
      'Save Position',
      'Do you want to save the current robot position?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: () => {
            // Here you would save the position to your backend
            // For now, just show a confirmation
            Alert.alert('Success', 'Position saved successfully!');
          },
        },
      ]
    );
  }, [robotCoordinates]);

  const handleReturnToHome = useCallback(() => {
    // Implement return to home functionality
    Alert.alert(
      'Return Home',
      'Do you want to send the robot back to its home position?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            // Here you would call an API to make the robot return home
            const success = await sendRobotCommand(robotId, 'return_home');
            if (success) {
              Alert.alert('Success', 'Robot is returning to home position.');
            } else {
              Alert.alert('Error', robotError || 'Failed to send return home command.');
            }
          },
        },
      ]
    );
  }, [robotId, sendRobotCommand, robotError]);

  const toggleView = useCallback((mode) => {
    setActiveView(mode);
  }, []);

  const handleControllerToggle = useCallback(async (value) => {
    if (!currentRobot || !robotId) return;

    if (value === true) {
      if (!isControlAcquiredBySomeone) {
        const success = await acquireRobotControl(robotId);
        if (!success) {
          Alert.alert('Control Acquisition Failed', 'Could not acquire control of the robot.');
        } else {
          Alert.alert('Control Acquired', 'You have acquired control of the robot.');
        }
      } else if (!isCurrentUserControlling) {
        Alert.alert("Control Busy", `Robot is currently controlled by ${controlAquirerName}.`);
      }
    } else {
      if (isCurrentUserControlling) {
        const success = await releaseRobotControl(robotId);
        if (!success) {
          Alert.alert("Release Failed", robotError || "Could not release control.");
        }
      }
    }
  }, [
    currentRobot, robotId, isCurrentUserControlling, 
    isControlAcquiredBySomeone, controlAquirerName, 
    acquireRobotControl, releaseRobotControl, robotError
  ]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#57C3EA" />
        <Text style={styles.loadingText}>Loading...</Text>
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
            <MapView 
              style={styles.mapView}
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              initialRegion={
                robotCoordinates 
                  ? { 
                      latitude: robotCoordinates.latitude, 
                      longitude: robotCoordinates.longitude, 
                      latitudeDelta: 0.005, 
                      longitudeDelta: 0.005
                    }
                  : { 
                      latitude: 36.8981, 
                      longitude: 10.1879, 
                      latitudeDelta: 0.0922, 
                      longitudeDelta: 0.0421
                    }
              } 
              mapType="standard" 
              showsUserLocation={false}
              showsMyLocationButton={false}
            >
              {robotCoordinates && (
                <Marker
                  coordinate={robotCoordinates}
                  title={`Robot ${robotId}`}
                  description={currentPositionText}
                >
                  <View>
                    <Image
                      source={require('../../../assets/images/location.png')}
                      style={styles.mapMarkerIcon}
                    />
                    <ActivityIndicator 
                      style={styles.realtimeLoader} 
                      size="small" 
                      color="#57C3EA"
                    />
                  </View>
                </Marker>
              )}
            </MapView>
          ) : (
            <View style={styles.livestreamView}>
              <Text style={styles.placeholderText}>
                {streamActive ? 'Streaming...' : 'Live Stream Offline'}
              </Text>
              {streamActive && streamUrl && (
                <Text style={styles.subtext}>URL: {streamUrl}</Text>
              )}
              <Text style={styles.subtext}>Status: {streamActive ? 'Active' : 'Inactive'}</Text>
            </View>
          )}
          {realtimeLoading && activeView === VIEW_MODES.MAP && (
            <ActivityIndicator 
              style={styles.mapLoadingIndicator} 
              size="large" 
              color="#57C3EA"
            />
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
              {!isCurrentUserControlling && isControlAcquiredBySomeone && (
                <Text style={styles.controlAcquiredByText} numberOfLines={1}>
                  Controlled by: {controlAquirerName}
                </Text>
              )}
              <Text style={[
                styles.controllerToggleLabel,
                controllerEnabled ? styles.controllerEnabledText : styles.controllerDisabledText
              ]}>
                {controllerEnabled ? 'ENABLED' : 'DISABLED'}
              </Text>
              <Switch
                value={isCurrentUserControlling}
                onValueChange={handleControllerToggle}
                trackColor={{ false: "#d3d3d3", true: "#81c784" }}
                thumbColor={controllerEnabled ? "#4CAF50" : "#f4f3f4"}
                ios_backgroundColor="#d3d3d3"
                style={styles.smallerSwitch}
                disabled={
                  robotContextLoading || 
                  commandLoading || 
                  (isControlAcquiredBySomeone && !isCurrentUserControlling)
                }
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
                style={[styles.directionButton, (!controllerEnabled || commandLoading) && styles.buttonDisabled]}
                onPress={() => handleDirectionPress(DIRECTIONS.UP)}
                disabled={!controllerEnabled || commandLoading}
              >
                <Image 
                  source={require('../../../assets/images/up.png')}
                  style={[styles.arrowIcon, (!controllerEnabled || commandLoading) && styles.iconDisabled]}
                />
              </TouchableOpacity>
              <View style={styles.spacer} />
            </View>
            
            <View style={styles.directionRow}>
              <TouchableOpacity 
                style={[styles.directionButton, (!controllerEnabled || commandLoading) && styles.buttonDisabled]}
                onPress={() => handleDirectionPress(DIRECTIONS.LEFT)}
                disabled={!controllerEnabled || commandLoading}
              >
                <Image 
                  source={require('../../../assets/images/left.png')}
                  style={[styles.arrowIcon, (!controllerEnabled || commandLoading) && styles.iconDisabled]}
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.directionButton, 
                  styles.stopButton, 
                  (!controllerEnabled || commandLoading) && styles.stopButtonDisabled
                ]}
                onPress={() => handleDirectionPress(DIRECTIONS.STOP)}
                disabled={!controllerEnabled || commandLoading}
              >
                <Text style={[
                  styles.stopText, 
                  (!controllerEnabled || commandLoading) && styles.stopTextDisabled
                ]}>
                  STOP
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.directionButton, (!controllerEnabled || commandLoading) && styles.buttonDisabled]}
                onPress={() => handleDirectionPress(DIRECTIONS.RIGHT)}
                disabled={!controllerEnabled || commandLoading}
              >
                <Image 
                  source={require('../../../assets/images/right.png')}
                  style={[styles.arrowIcon, (!controllerEnabled || commandLoading) && styles.iconDisabled]}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.directionRow}>
              <View style={styles.spacer} />
              <TouchableOpacity 
                style={[styles.directionButton, (!controllerEnabled || commandLoading) && styles.buttonDisabled]}
                onPress={() => handleDirectionPress(DIRECTIONS.DOWN)}
                disabled={!controllerEnabled || commandLoading}
              >
                <Image 
                  source={require('../../../assets/images/down.png')}
                  style={[styles.arrowIcon, (!controllerEnabled || commandLoading) && styles.iconDisabled]}
                />
              </TouchableOpacity>
              <View style={styles.spacer} />
            </View>
            {commandLoading && (
              <View style={styles.commandLoadingOverlay}>
                <ActivityIndicator size="small" color="#57C3EA"/>
              </View>
            )}
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
  loadingText: {
    marginTop: 10, 
    fontSize: 16,
    color: '#FFF',
    fontFamily: 'Poppins_semibold'
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#FFF0F0', 
    padding: 20, 
  },
  errorTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#D32F2F', 
    marginBottom: 10, 
    fontFamily: 'Poppins_semibold', 
  },
  errorText: { 
    fontSize: 16, 
    color: '#D32F2F', 
    textAlign: 'center', 
    marginBottom: 20, 
    fontFamily: 'Poppins_semibold', 
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
    fontFamily: 'Poppins_semibold'
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
  controlAcquiredByText: {
    fontSize: 12,
    marginRight: 8,
    color: '#666',
    fontFamily: 'Poppins_semibold',
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
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
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
  },
  mapMarkerIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  mapLoadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
  },
  realtimeLoader: { 
    position: 'absolute', 
    top: 10, 
    right: 10, 
  },
  commandLoadingOverlay: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    top: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(255, 255, 255, 0.6)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 15, 
  },
});

export default LocationAndControllerScreen;