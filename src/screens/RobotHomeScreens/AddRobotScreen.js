import React, { useState, useEffect } from 'react';
import {
    StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar,
    TextInput, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, G, Circle, Line, Rect } from 'react-native-svg';
import * as Font from 'expo-font';
import Header from "../../Components/Header";

// Assuming these components exist and match the initial style
import BottomNavBar from '../../Components/BottomNavBar';
import { useRobot } from '../../api/robotContext';

// --- Icons ---
const ErrorIcon = () => (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 5, marginTop: 1 }}>
        <G id="SVGRepo_iconCarrier">
            <Path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#FF3830" strokeWidth="2" />
            <Path d="M12 8L12 13" stroke="#FF3830" strokeWidth="2" strokeLinecap="round" />
            <Path d="M12 16V15.9888" stroke="#FF3830" strokeWidth="2" strokeLinecap="round" />
        </G>
    </Svg>
);

const AddRobotScreen = () => {
  const navigation = useNavigation();
  const { addRobot, loading: apiLoading } = useRobot();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [mode, setMode] = useState('create'); // 'create' or 'join'

  // State for Create Mode
  const [newRobotId, setNewRobotId] = useState('');
  const [createErrorMessage, setCreateErrorMessage] = useState('');

  // State for Join Mode
  const [joinRobotId, setJoinRobotId] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [joinErrorMessage, setJoinErrorMessage] = useState('');

  // Shared State (original Header component state if needed)
  const [activeTab, setActiveTab] = useState('add'); // For BottomNavBar
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins_semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
        'Poppins_bold': require('../../../assets/fonts/Poppins-Bold.ttf'),
        
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    console.log('Language selected:', language);
  };
  const handleNotificationChange = (isEnabled) =>{
    setNotificationsEnabled(isEnabled);
  }

  const handleCreateRobot = async () => {
    setCreateErrorMessage('');
    if (!newRobotId.trim()) {
      setCreateErrorMessage("Please enter a Robot ID");
      return;
    }
    try {
      console.log('Attempting to create robot with ID:', newRobotId);
      await addRobot({ robot_id: newRobotId, status: 'inactive' });
      navigation.navigate('AddRobotLoading', { robotId: newRobotId, action: 'create' });
    } catch (error) {
      console.error('Error creating robot:', error);
      setCreateErrorMessage(error.message || 'Failed to create robot. ID might be taken.');
    }
  };

  const handleJoinRobot = async () => {
    setJoinErrorMessage('');
    let errors = [];
    if (!joinRobotId.trim()) errors.push("Robot ID required.");
    if (!ownerEmail.trim()) errors.push("Owner's Email required.");
    else if (!/\S+@\S+\.\S+/.test(ownerEmail)) errors.push("Invalid email format.");

    if (errors.length > 0) {
      setJoinErrorMessage(errors.join(' '));
      return;
    }
    try {
      console.log('Attempting to join robot:', joinRobotId, 'owned by:', ownerEmail);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      navigation.navigate('AddRobotLoading', { robotId: joinRobotId, ownerEmail: ownerEmail, action: 'join' });
    } catch (error) {
      console.error('Error joining robot:', error);
      setJoinErrorMessage(error.message || 'Failed to join robot. Check details.');
    }
  };

  const handleCancel = () => {
    // Navigate back or to the main home screen as per original logic
    navigation.navigate('MainHome', { screen: 'HomeMain' });
  };

  // --- Loading Indicator Component (Dots) ---
  const LoadingDots = () => (
      <View style={styles.loadingIndicatorContainer}>
          <ActivityIndicator size="small" color="#0077FF" />
      </View>
  );


  if (!fontsLoaded) {
    return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#57C3EA" barStyle="dark-content" />
          <Header
                        selectedLanguage={selectedLanguage}
                        onLanguageChange={handleLanguageChange}
                        notificationsEnabled={notificationsEnabled}
                        onNotificationChange={handleNotificationChange}
          />
            <View style={styles.searchTitleContainer}>
                    <Text style={styles.searchTitle}>Add Robot</Text>
            </View>
            {/* Main Content Area - Centered */}
            <View style={styles.contentContainer}>
                <View style={styles.formCard}>

                    {/* Tabs Inside Card */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, mode === 'create' ? styles.activeTabButton : styles.inactiveTabButton]}
                            onPress={() => setMode('create')}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabText, mode === 'create' ? styles.activeTabText : styles.inactiveTabText]}>NEW</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, mode === 'join' ? styles.activeTabButton : styles.inactiveTabButton]}
                            onPress={() => setMode('join')}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabText, mode === 'join' ? styles.activeTabText : styles.inactiveTabText]}>JOIN</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Content Changes Based on Mode */}
                    {mode === 'create' && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>ROBOT ID</Text>
                                <View style={[styles.inputBox, createErrorMessage ? styles.inputBoxError : {}]}>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder="Enter robot identifier"
                                        placeholderTextColor="#888" // From original style
                                        value={newRobotId}
                                        onChangeText={setNewRobotId}
                                        onFocus={() => setCreateErrorMessage('')}
                                        autoCapitalize="none"
                                    />
                                </View>
                                {createErrorMessage ? (
                                    <View style={styles.errorContainer}>
                                        <ErrorIcon />
                                        <Text style={styles.errorText}>{createErrorMessage}</Text>
                                    </View>
                                ) : <View style={styles.errorPlaceholder} />}
                            </View>
                            <Text style={styles.infoText}>You will become the owner of this robot</Text>
                        </>
                    )}

                    {mode === 'join' && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>ROBOT ID</Text>
                                <View style={[styles.inputBox, joinErrorMessage && (joinErrorMessage.includes("ID") || joinErrorMessage.includes("details")) ? styles.inputBoxError : {}]}>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder="Enter robot identifier"
                                        placeholderTextColor="#888"
                                        value={joinRobotId}
                                        onChangeText={setJoinRobotId}
                                        onFocus={() => setJoinErrorMessage('')}
                                         autoCapitalize="none"
                                    />
                                </View>
                                {/* Minimal space before next input */}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>OWNER'S EMAIL</Text>
                                <View style={[styles.inputBox, joinErrorMessage && (joinErrorMessage.includes("Email") || joinErrorMessage.includes("email") || joinErrorMessage.includes("details")) ? styles.inputBoxError : {}]}>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder="Enter owner's email address"
                                        placeholderTextColor="#888"
                                        value={ownerEmail}
                                        onChangeText={setOwnerEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        onFocus={() => setJoinErrorMessage('')}
                                    />
                                </View>
                                {joinErrorMessage ? (
                                     <View style={styles.errorContainer}>
                                        <ErrorIcon />
                                        <Text style={styles.errorText}>{joinErrorMessage}</Text>
                                    </View>
                                ) : <View style={styles.errorPlaceholder} />}
                            </View>
                            <Text style={styles.infoText}>Enter details of the robot you want to join.</Text>
                        </>
                    )}


                    {/* Loading Indicator (like image) */}
                    {apiLoading && <LoadingDots />}

                    {/* Action Button (like image, but using original blue) */}
                    <TouchableOpacity
                        style={[styles.actionButton, apiLoading ? styles.buttonDisabled : {}]}
                        onPress={mode === 'create' ? handleCreateRobot : handleJoinRobot}
                        disabled={apiLoading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionButtonText}>
                            {mode === 'create' ? 'CREATE' : 'JOIN'}
                        </Text>
                    </TouchableOpacity>

                    {/* Cancel Link (like image) */}
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                </View>
            </View>

        {/* Original Bottom Nav Bar */}
        <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} navigation={navigation}/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#57C3EA', // Original background color
  },
  searchTitleContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 0,
  },
  searchTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#57C3EA',
  },
  container: {
    flex: 1,
    // No specific background needed here as SafeAreaView has it
  },
  // --- Screen Header Styles (Inspired by Image) ---
  screenHeaderContainer: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20, // Adjust for status bar
    paddingBottom: 15,
    backgroundColor: '#57C3EA', // Match safe area
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF', // White circle background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_bold', // Original bold font
    color: '#FFFFFF', // White title text
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // --- Content & Form Styles ---
  contentContainer: {
    flex: 1, // Takes remaining space
    justifyContent: 'center', // Center the card vertically
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 0,
    marginTop: 0,
    paddingBottom: 100, // Space above bottom nav
  },
  formCard: {
    width: '100%',
    maxWidth: 360, // Limit width on larger screens
    backgroundColor: 'white',
    borderRadius: 20, // Original border radius
    padding: 20,
    paddingTop: 15,
    alignItems: 'center',
    elevation: 5, // Keep original elevation feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  // --- Tabs Inside Card (Inspired by Image) ---
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0', // Light grey background for the tab area
    borderRadius: 30, // Pill shape
    padding: 4, // Padding around buttons
    marginBottom: 15,
    width: '80%', // Make tabs slightly narrower than card
    alignSelf: 'center',
  },
  tabButton: {
    flex: 1, // Equal width
    paddingVertical: 8,
    borderRadius: 26, // Rounded corners for buttons inside
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF', // White background for active
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  inactiveTabButton: {
    backgroundColor: 'transparent', // No background for inactive
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins_semibold', // Original semibold font
  },
  activeTabText: {
    color: '#333333', // Dark text for active tab
  },
  inactiveTabText: {
    color: '#888888', // Grey text for inactive tab
  },
  cardSubtitle: {
      fontSize: 12,
      fontFamily: 'Poppins_regular', // Regular font for subtitle
      color: '#666666', // Grey color
      marginBottom: 20,
      textAlign: 'center',
  },
  inputGroup: {
      width: '100%',
      marginBottom: 10, // Space between input groups or info text
  },
  inputLabel: {
      fontSize: 14,
      fontFamily: 'Poppins_semibold', // Original semibold font
      color: '#444444',
      marginBottom: 5,
      marginLeft: 5, // Slight indent
  },
  inputBox: {
    backgroundColor: '#E8F4EA', // Original light green/blue background
    borderRadius: 40, // Original very rounded style
    flexDirection: 'row',
    alignItems: 'center',
    height: 45, // Original height
    borderWidth: 0.5, // Original border
    borderColor: "#e0e0e0", // Original border color
    paddingHorizontal: 20, // Original padding
    marginBottom: 5, // Space before error message
  },
  inputBoxError: {
      borderColor: '#FF3830',
      borderWidth: 1, // Make error border slightly more prominent
  },
  inputField: {
    flex: 1,
    fontSize: 13, // Original font size
    fontFamily: 'Poppins_semibold', // Original font
    color: '#333', // Ensure text is dark enough
  },
  infoText: {
      fontSize: 12,
      fontFamily: 'Poppins_regular',
      color: '#777777',
      textAlign: 'center',
      marginTop: 5, // Space above info text
      marginBottom: 15, // Space below info text before loading/button
  },
  // --- Error Styles (Keep Original) ---
 errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingLeft: 15, // Indent error message slightly
    marginTop: 3,
    height: 20, // Reserve space
 },
 errorPlaceholder:{
     height: 20, // Match height of error container
     marginTop: 3,
 },
 errorText: {
    color:'#FF3830',
    fontFamily:'Poppins_semibold',
    fontSize: 12, // Slightly smaller error text
    marginLeft: 5,
    textAlign:'left',
  },
  // --- Loading Indicator ---
  loadingIndicatorContainer: {
      height: 30, // Reserve space for indicator
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 10, // Space around loading dots
  },
//   loadingDot: { // Example for custom dots (if not using ActivityIndicator)
//       width: 8,
//       height: 8,
//       borderRadius: 4,
//       backgroundColor: '#0077FF',
//       opacity: 0.6,
//   },
  // --- Button Styles ---
  actionButton: {
    backgroundColor: '#0077FF', // Original button blue
    borderRadius: 40, // Make it very rounded like image
    alignItems: 'center',
    justifyContent: 'center',
    width: 207, // Match image width relative to card
    height: 45, // Taller button like image
    alignSelf: 'center',
    marginTop: 10, // Space above button
    marginBottom: 10, // Space below button
    elevation: 3,
     shadowColor: '#005A8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#A0CFFF', // Lighter blue when disabled/loading
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18, // Slightly larger button text
    fontFamily: 'Poppins_bold', // Bold text on button
  },
  // --- Cancel Link Style (Inspired by Image) ---
  cancelButton: {
    // No background or border, just text
    marginTop: 5, // Space above cancel link
    padding: 5, // Make it easier to tap
  },
  cancelButtonText: {
    color: '#888888', // Grey color for cancel link
    fontSize: 14,
    fontFamily: 'Poppins_regular',
  },
   bottomNavContainer: {
     // Positioned at the bottom by flex layout
   }
});

export default AddRobotScreen;

