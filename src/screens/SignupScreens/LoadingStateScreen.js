import React, { useEffect, useRef, useState } from 'react';
import { Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Svg, Path, Circle } from 'react-native-svg';
import {StyleSheet, View, Text,  SafeAreaView, StatusBar, Animated, Dimensions} from 'react-native';

import * as Font from 'expo-font';


const LoadingStateScreen = () => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  
  const updateDimensions = ({ window }) => {
    setScreenWidth(window.width);
  };
  
  // Animation values
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkRotation = useRef(new Animated.Value(-0.5)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;
  const circleFill = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textPosition = useRef(new Animated.Value(20)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  // Loading animation values
  const loadingRotation = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(1)).current;
  const loadingScale = useRef(new Animated.Value(1)).current;
  const loadingTextOpacity = useRef(new Animated.Value(1)).current;

  // Convert the Animated Value to a string color
  const circleBackgroundColor = circleFill.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(223, 247, 226, 0)', 'rgba(223, 247, 226, 0.2)']
  });
  
  const checkmarkRotateValue = checkmarkRotation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-30deg', '0deg', '30deg']
  });
  
  // Create an interpolated value for the rotation
  const spin = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Poppins_semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts', error);
      }
    };
    
    loadFonts();
  }, []);
  
  useEffect(() => {
    // Start loading animation immediately
    if (fontsLoaded) {
      startLoadingAnimation();
      
      // Simulate a loading process
      const timer = setTimeout(() => {
        endLoadingAnimation();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);
  
  const startLoadingAnimation = () => {
    // Create a continuous rotation animation
    Animated.loop(
      Animated.timing(loadingRotation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };
  
  const endLoadingAnimation = () => {
    // Fade out the loading animation
    Animated.parallel([
      Animated.timing(loadingOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(loadingScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(loadingTextOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsLoading(false);
      startAnimations();
      const pulseAnim = startPulseAnimation();
      
      const timer = setTimeout(() => {
        navigation.replace('MainApp');
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        pulseAnim.stop(); 
      };
    });
  };
  
  const startPulseAnimation = () => {
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 800,
          easing: Easing.sin,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          easing: Easing.sin,
          useNativeDriver: true,
        })
      ])
    );
    
    pulseAnim.start();
    return pulseAnim;
  };
  
  const startAnimations = () => {
    // Reset animation values
    checkmarkScale.setValue(0);
    checkmarkOpacity.setValue(0);
    checkmarkRotation.setValue(-0.5);
    circleScale.setValue(0);
    circleOpacity.setValue(0);
    circleFill.setValue(0);
    textOpacity.setValue(0);
    textPosition.setValue(20);
    
    // Circle animation
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(circleScale, {
          toValue: 1,
          duration: 700,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    // Checkmark animation 
    Animated.sequence([
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(checkmarkScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkRotation, {
          toValue: 0,
          duration: 600,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(circleFill, {
          toValue: 0.2,
          duration: 600,
          easing: Easing.quad,  
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    // Text animation 
    Animated.sequence([
      Animated.delay(1300),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textPosition, {
          toValue: 0,
          duration: 500,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };
  
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header with Logo */}
      <View style={styles.header}>
      </View>

      {/* Loading Animation */}
      {isLoading && (
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.loadingCircleContainer,
              {
                opacity: loadingOpacity,
                transform: [
                  { rotate: spin },
                  { scale: loadingScale }
                ]
              }
            ]}
          >
            <Svg height="80" width="80" viewBox="0 0 100 100">
              <Circle
                cx="50"
                cy="50"
                r="45"
                stroke="#57C3EA"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="70 180"
              />
            </Svg>
          </Animated.View>
          <Animated.Text 
            style={[
              styles.loadingText,
              { opacity: loadingTextOpacity }
            ]}
          >
            Confirming your email...
          </Animated.Text>
        </View>
      )}

      {/* Success Animation */}
      {!isLoading && (
        <>
          <View style={styles.animationContainer}>
            {/* Animated Circle */}
            <Animated.View 
              style={[
                styles.circleContainer,
                {
                  opacity: circleOpacity,
                  backgroundColor: circleBackgroundColor,
                  transform: [{ scale: circleScale }, { scale: pulseAnimation }]
                }
              ]}
            >
              <Svg height="120" width="120" viewBox="0 0 100 100">
                <Circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  stroke="#57C3EA" 
                  strokeWidth="5" 
                  fill="transparent" 
                />
              </Svg>
            </Animated.View>
            
            {/* Animated Checkmark */}
            <Animated.View 
              style={[
                styles.checkmarkContainer,
                {
                  opacity: checkmarkOpacity,
                  transform: [{ scale: checkmarkScale }, { rotate: checkmarkRotateValue }]
                }
              ]}
            >
              <Svg height="60" width="60" viewBox="0 0 100 100">
                <Path 
                  d="M20,50 L40,70 L80,30" 
                  stroke="#57C3EA" 
                  strokeWidth="10" 
                  fill="transparent" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </Svg>
            </Animated.View>
          </View>

          {/* Confirmation Text */}
          <Animated.View style={[styles.confirmationContainer, { opacity: textOpacity, transform: [{ translateY: textPosition }] }]}>
            <Text style={styles.confirmationText}>Email Confirmed</Text>
            <Text style={styles.successText}>
              Your account is ready to use
            </Text>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleContainer: {
    position: 'absolute',
  },
  checkmarkContainer: {
    position: 'absolute',
  },
  confirmationContainer: {
    marginBottom: 350,
  },
  confirmationText: {
    fontSize: 26,
    color: '#57C3EA',
    fontWeight: '600',
    fontFamily: 'Poppins_semibold',
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#57C3EA',
    fontFamily: 'Poppins_semibold',
    textAlign: 'center',
  },
  loadingCircleContainer: {
    width: 80,
    height: 80,
    marginBottom: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#57C3EA',
    fontFamily: 'Poppins_semibold',
    textAlign: 'center',
    marginTop: 8,
  }
});

export default LoadingStateScreen;