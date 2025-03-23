// SplashScreen.js
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { SharedElement } from 'react-navigation-shared-element';

const SplashScreen = ({ navigation }) => {
  const logoScale = useRef(new Animated.Value(1)).current;
  const backgroundColorAnimation = useRef(new Animated.Value(0)).current;
  const logoPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 0.75,
        speed: 10,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      }),
      // Begin background transition
      Animated.timing(backgroundColorAnimation, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false
      }),
      Animated.timing(logoPosition, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      }),
    ]).start(() => navigation.replace('Welcome'));
  }, []);

  const backgroundColor = backgroundColorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#57C3EA', '#FFFFFF']
  });
  const logoTransform = [
    { scale: logoScale },
    { 
      translateY: logoPosition.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -120]
      }) 
    }
  ];
  return (
    <Animated.View style={[styles.container,{backgroundColor}]}>      
      <SharedElement id="logo">
        <Animated.Image
          source={require('../../assets/imges/logo.png')}
          style={[
            styles.logo,
            {
              transform: logoTransform
            }
          ]}
        />
      </SharedElement>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 270,
    height: 270,
    marginTop:5,
    resizeMode: 'contain'
  }
});

SplashScreen.sharedElements = () => [
  { id: 'logo', animation: 'move' },
];

export default SplashScreen;