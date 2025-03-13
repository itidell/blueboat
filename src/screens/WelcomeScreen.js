import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Font from 'expo-font';
import {SharedElement} from 'react-navigation-shared-element';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const button1Scale = useRef(new Animated.Value(0)).current;
  const button2Scale = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins_semibold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
        'ZenDots': require('../../assets/fonts/ZenDots-Regular.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      setTimeout(() => {
        Animated.parallel([
          // Subtitle fade-in
          Animated.timing(subtitleOpacity, {
            toValue: 1,
            duration: 900,
            delay: 400,
            useNativeDriver: true,
          }),
          // Button animations
          Animated.stagger(150, [
            Animated.spring(button1Scale, {
              toValue: 1,
              friction: 8,
              delay: 1200,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.spring(button2Scale, {
              toValue: 1,
              friction: 8,
              tension: 40,
              delay: 1200,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, 800);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return <View style={styles.container}><Text>Loading...</Text></View>;
  // Handle login button press
  const handleLoginPress = () => {
    setTimeout(() => {
        navigation.navigate('login');
      }, 150); // Navigate to the login screen
  };

  // Handle signup button press
  const handleSignupPress = () => {
    setTimeout(() => {
        navigation.navigate('createaccountscreen');
      }, 150); // Navigate to the login screen // Navigate to the create account screen
  };
  return (
    <View style={styles.container}>
      <SharedElement id="logo" style={styles.logoContainer}>
        <Animated.Image
          source={require('../../assets/logo.png')}
          style={[
            styles.logo
          ]}
        />
      </SharedElement>


      <Animated.Text 
        style={[
          styles.subtitle, 
          { 
            opacity: subtitleOpacity,
            transform: [{
              translateY: subtitleOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0], // Slide up while fading in
              }),
            }]
          }
        ]}
      >
        Wave goodbye to trash
      </Animated.Text>

      <Animated.View style={{ transform: [{ scale: button1Scale }] }}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: button2Scale }] }}>
        <TouchableOpacity style={styles.signupButton} onPress={handleSignupPress}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Poppins_semibold',
  },
  logo: {
    width: 203,
    height: 269,
    resizeMode: 'contain',
    marginBottom: 1.5,
    marginTop: 23
  },
  subtitle: {
    fontSize: 16,
    color: '#156FB6',
    marginBottom: 80,
    fontFamily: 'ZenDots',
  },
  loginButton: {
    backgroundColor: '#098BEA',
    width: 207,
    height:45,
    paddingVertical: 6,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 10.5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loginText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Poppins_semibold',
    width: '100%',
    textAlign: 'center',
  },
  signupButton: {
    backgroundColor: "#cce1f5",
    width: 207,
    height:45,
    paddingVertical: 6,
    paddingHorizontal: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  signupText: {
    color: '#098BEA',
    fontSize: 20,
    fontFamily: 'Poppins_semibold',
    flexDirection: 'row', 
    width: '100%',
    textAlign: 'center',
  },
});

WelcomeScreen.sharedElements = () => [
  { id: 'logo', animation: 'move', resize: 'auto' },
];
export default WelcomeScreen;