import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar } from 'react-native';
import {SharedElement} from 'react-navigation-shared-element';
import { useNavigation } from '@react-navigation/native';
import * as Font from 'expo-font';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loginButtonPressed, setLoginButtonPressed] = useState(false);
  const [signupButtonPressed, setSignupButtonPressed] = useState(false);
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
        navigation.navigate('Login');
      }, 150); 
  };

  // Handle signup button press
  const handleSignupPress = () => {
    setTimeout(() => {
        navigation.navigate('CreateAccount');
      }, 150);
  };
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <SharedElement id="logo" style={styles.logoContainer}>
        <Animated.Image
          source={require('../../assets/images/logo.png')}
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
        <TouchableOpacity style={[
            styles.loginButton, 
            loginButtonPressed && styles.loginButtonPressed
          ]}
          onPressIn={() => setLoginButtonPressed(true)}
          onPressOut={() => setLoginButtonPressed(false)}
          onPress={handleLoginPress}
        >
          <Text style={[
              styles.loginText, 
              loginButtonPressed && styles.loginButtonTextPressed
          ]}
          >
            Log In
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: button2Scale }] }}>
        <TouchableOpacity style={[
            styles.signupButton, 
            signupButtonPressed && styles.signupButtonPressed
          ]}
          onPressIn={() => setSignupButtonPressed(true)}
          onPressOut={() => setSignupButtonPressed(false)}
          onPress={handleSignupPress}
        >
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
  loginButtonPressed: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#098BEA',
  },
  loginButtonTextPressed: {
    color: '#098BEA',
    fontFamily: 'Poppins_semibold',
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
  signupButtonPressed: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#098BEA',
  },
  signupButtonTextPressed: {
    color: '#098BEA',
    fontFamily: 'Poppins_semibold',
  },
});

WelcomeScreen.sharedElements = () => [
  { id: 'logo', animation: 'move', resize: 'auto' },
];

export default WelcomeScreen;