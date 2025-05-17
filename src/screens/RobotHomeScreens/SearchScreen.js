// --- START OF FILE RobotsMapScreen.js ---
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Use this to reload data on screen focus
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // Import Map components
import * as Font from 'expo-font'; // Assuming you still need custom fonts

import Header from '../../Components/Header';
import BottomNavBar from '../../Components/BottomNavBar'; // Keep the BottomNavBar
import { useRobot } from '../../api/robotContext'; // Import the hook to get robots
import { useTranslation } from 'react-i18next'; // Assuming translation is used
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922; // Standard delta for city view
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const RobotsMapScreen = () => {
  const { t } = useTranslation(); // For translations
  const navigation = useNavigation();
  // Get user robots and loading state from the context
  const { robots, loading, error: robotError, loadRobots } = useRobot();

  // State for UI
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN'); // Manage language state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // Manage notification state
  const [activeTab, setActiveTab] = useState('search'); // Set the active tab to 'search'
  const [mapRegion, setMapRegion] = useState(null); // State to manage map region

  const mapRef = useRef(null); // Ref for MapView

  // Load custom fonts
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Poppins_semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        // Proceed even if fonts fail to load
        setFontsLoaded(true);
      }
    };
    loadFonts();
  }, []);

  // Load robots when the screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log("RobotsMapScreen focused - loading robots");
      loadRobots();
      // No cleanup needed for loadRobots specifically, the hook handles it
      return () => {};
    }, [loadRobots]) // Depend on loadRobots
  );

  // Adjust map region based on robot locations whenever robots data changes
  useEffect(() => {
    if (robots && robots.length > 0) {
      const locations = robots
        .map(robot => robot.realtime?.location)
        .filter(loc => loc?.latitude != null && loc?.longitude != null);

      if (locations.length > 0) {
        // Calculate bounding box
        const minLat = Math.min(...locations.map(loc => loc.latitude));
        const maxLat = Math.max(...locations.map(loc => loc.latitude));
        const minLon = Math.min(...locations.map(loc => loc.longitude));
        const maxLon = Math.max(...locations.map(loc => loc.longitude));

        const centerLat = (minLat + maxLat) / 2;
        const centerLon = (minLon + maxLon) / 2;

        // Add some padding (delta)
        const latitudeDelta = (maxLat - minLat) * 1.2 || LATITUDE_DELTA;
        const longitudeDelta = (maxLon - minLon) * 1.2 || LONGITUDE_DELTA;

        const newRegion = {
          latitude: centerLat,
          longitude: centerLon,
          latitudeDelta: latitudeDelta > 0 ? latitudeDelta : LATITUDE_DELTA,
          longitudeDelta: longitudeDelta > 0 ? longitudeDelta : LONGITUDE_DELTA,
        };

        setMapRegion(newRegion); // Set region state
         // Animate map to the calculated region
        if (mapRef.current) {
             mapRef.current.animateToRegion(newRegion, 500); // Optional animation
        }

      } else {
         // If no locations, default to a known region or world view
        setMapRegion({
            latitude: 36.8981, // Default to Tunis for now
            longitude: 10.1879,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
        });
      }
    } else {
      // If no robots, default to a known region or world view
      setMapRegion({
          latitude: 36.8981, // Default to Tunis for now
          longitude: 10.1879,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
      });
    }
  }, [robots]); // Re-calculate region when robots data changes

  // Handlers for Header components
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    console.log('Language selected:', language);
  };

  const handleNotificationChange = (isEnabled) => {
    setNotificationsEnabled(isEnabled);
  };

  // Show loading state while fonts load
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

      {/* Header */}
      <Header
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        notificationsEnabled={notificationsEnabled}
        onNotificationChange={handleNotificationChange}
      />

      {/* Title Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>{'Robot Locations'}</Text>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.overlayLoader}>
            <ActivityIndicator size="large" color="#57C3EA" />
            <Text style={styles.overlayLoaderText}>{t('common.loadingRobots') || 'Loading robots...'}</Text>
          </View>
        ) : robotError ? (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{robotError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadRobots}>
                    <Text style={styles.retryButtonText}>{t('common.retry') || 'Retry'}</Text>
                </TouchableOpacity>
            </View>
        ) : robots.length === 0 ? (
             <View style={styles.emptyStateContainer}>
                 <Image
                   source={require('../../../assets/images/yacht-black.png')} // Use a suitable icon
                   style={styles.emptyStateIcon}
                 />
                 <Text style={styles.emptyStateText}>{t('robotsMap.noRobotsFound') || 'No robots found for your account.'}</Text>
                 <Text style={styles.emptyStateSubText}>{t('robotsMap.addRobotHint') || 'Add a robot using the "+" button below.'}</Text>
             </View>
        ) : mapRegion ? (
            <MapView
              ref={mapRef} // Attach ref
              style={styles.mapView}
              provider={PROVIDER_GOOGLE}
              initialRegion={mapRegion} // Use calculated or default initial region
              // onRegionChangeComplete={(region) => setMapRegion(region)} // Optional: update region state if user drags
               mapType="standard"
               showsUserLocation={false} // Usually don't show user location on a robot map
               showsCompass={true}
               rotateEnabled={false} // Disable map rotation
               pitchEnabled={false} // Disable pitch gestures
            >
              {/* Render markers for each robot with location data */}
              {robots
                .filter(robot => robot.realtime?.location?.latitude != null && robot.realtime?.location?.longitude != null)
                .map(robot => (
                  <Marker
                    key={robot.robot_id} // Unique key
                    coordinate={{
                      latitude: robot.realtime.location.latitude,
                      longitude: robot.realtime.location.longitude,
                    }}
                    title={`${t('common.robotId') || 'Robot ID'}: ${robot.robot_id}`}
                    description={`${t('common.status')}: ${robot.status || 'N/A'}`}
                  >
                     {/* Optional: Custom Marker Icon */}
                     <Image
                       source={require('../../../assets/images/location.png')} // Use location icon or custom robot icon
                       style={styles.markerIcon}
                       resizeMode="contain"
                     />
                  </Marker>
                ))}
            </MapView>
           ) : (
              // Show a loading indicator while map region is being calculated
              <View style={styles.overlayLoader}>
                 <ActivityIndicator size="large" color="#57C3EA" />
                 <Text style={styles.overlayLoaderText}>{t('robotsMap.calculatingMap') || 'Calculating map view...'}</Text>
              </View>
            )}
      </View>

      {/* Bottom Navigation Bar */}
      {/* Ensure the BottomNavBar is rendered outside the scrollable/map area */}
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
    backgroundColor: '#57C3EA', // Background color for the header area
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
    fontFamily: 'Poppins_semibold',
   },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20, // Adjust spacing as needed
    marginBottom: 15, // Space between title and map card
  },
  screenTitle: {
    fontSize: 24, // Larger title
    fontWeight: 'bold',
    color: '#000', // Or white, depending on design
    fontFamily: 'Poppins_semibold',
  },
  mapContainer: {
    flex: 1, // Take remaining space
    backgroundColor: 'white', // Background for the map area
    borderTopLeftRadius: 30, // Rounded top corners
    borderTopRightRadius: 30,
    overflow: 'hidden', // Clip content to border radius
    marginTop: 10, // Space below title area
    // position: 'absolute', // Alternative positioning if needed
    // top: 100, // Example top position
    // bottom: 0,
    // left: 0,
    // right: 0,
    paddingBottom: 70, // Add padding at the bottom to avoid being hidden by BottomNavBar
  },
  mapView: {
    ...StyleSheet.absoluteFillObject, // Fill the parent container
  },
  markerIcon: {
    width: 30, // Size of the marker icon
    height: 30,
    tintColor: '#098BEA', // Optional: tint color
  },
   overlayLoader: {
     ...StyleSheet.absoluteFillObject,
     backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white overlay
     justifyContent: 'center',
     alignItems: 'center',
     zIndex: 10, // Ensure it's above the map
   },
   overlayLoaderText: {
     marginTop: 10,
     fontSize: 16,
     color: '#333',
     fontFamily: 'Poppins_semibold',
   },
   errorContainer: {
     ...StyleSheet.absoluteFillObject,
     backgroundColor: '#FFEBEE', // Light red background
     justifyContent: 'center',
     alignItems: 'center',
     padding: 20,
      zIndex: 10,
   },
   errorText: {
     fontSize: 16,
     color: '#D32F2F', // Dark red text
     textAlign: 'center',
     marginBottom: 15,
     fontFamily: 'Poppins_semibold',
   },
    retryButton: {
        backgroundColor: '#D32F2F', // Match error color
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontFamily: 'Poppins_semibold',
        fontSize: 14,
    },
    emptyStateContainer: {
       ...StyleSheet.absoluteFillObject,
       backgroundColor: '#F9F9F9', // Light grey background
       justifyContent: 'center',
       alignItems: 'center',
       padding: 20,
       zIndex: 10,
    },
    emptyStateIcon: {
       width: 60,
       height: 60,
       tintColor: '#999',
       opacity: 0.5,
       marginBottom: 15,
    },
    emptyStateText: {
       fontSize: 16,
       color: '#666',
       textAlign: 'center',
       marginBottom: 5,
       fontFamily: 'Poppins_semibold',
    },
    emptyStateSubText: {
      fontSize: 14,
      color: '#888',
      textAlign: 'center',
      paddingHorizontal: 20,
      fontFamily: 'Poppins_semibold',
    },
});

export default RobotsMapScreen;
// --- END OF FILE RobotsMapScreen.js ---