import React, { useState, useEffect, useRef } from "react";
import { View, Text, Easing, StyleSheet, Image, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import Svg, {Circle, Path} from "react-native-svg";
import * as Font from 'expo-font';
import { useTranslation } from 'react-i18next'

import Header from "../../Components/Header";

const AddRobotLoadingScreen = ({route}) => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('EN');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [activeTab, setActiveTab] = useState('add');
    const [isLoading, setIsLoading] = useState(true);
    const { robotId } = route.params;


    const checkmarkScale = useRef(new Animated.Value(0)).current;
    const checkmarkOpacity = useRef(new Animated.Value(0)).current;
    const checkmarkRotation = useRef(new Animated.Value(-0.5)).current;
    const circleScale = useRef(new Animated.Value(0)).current;
    const circleOpacity = useRef(new Animated.Value(0)).current;
    const circleFill = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const textPosition = useRef(new Animated.Value(20)).current;
    const pulseAnimation = useRef(new Animated.Value(1)).current;
      
      
    const loadingRotation = useRef(new Animated.Value(0)).current;
    const loadingOpacity = useRef(new Animated.Value(1)).current;
    const loadingScale = useRef(new Animated.Value(1)).current;
    const loadingTextOpacity = useRef(new Animated.Value(1)).current;
    
      
    const circleBackgroundColor = circleFill.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(223, 247, 226, 0)', 'rgba(223, 247, 226, 0.2)']
    });
      
    const checkmarkRotateValue = checkmarkRotation.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-30deg', '0deg', '30deg']
    });
      
    const spin = loadingRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

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

    useEffect(() => {
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
            navigation.navigate('MainHome', { 
              screen: 'RobotHome',
              params: { robotId } 
            });
            setActiveTab('home');
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

    const handleLanguageChange =(language) =>{
        setSelectedLanguage(language);
    };
    const handleNotificationChange = (isEnabled) =>{
        setNotificationsEnabled(isEnabled);
    };

  return (
    <SafeAreaView style ={styles.container}>
        <StatusBar backgroundColor="#57C3EA" barStyle="dark-content"/>

        {/* Header */}
        <Header
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
          notificationsEnabled={notificationsEnabled}
          onNotificationChange={handleNotificationChange}
        />
        
        <View style={styles.contentContainer}>
            <View style={styles.formCard}>
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
                                    strokeDasharray="141.37 141.37"
                                />
                            </Svg>
                        </Animated.View>
                        <Animated.Text 
                            style={[
                                styles.loadingText,
                                { opacity: loadingTextOpacity }
                            ]}
                        >
                            {t('addRobot.loadingConnect')} 
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
                            <Text style={styles.confirmationText}>{t('common.success')}</Text> 
                            <Text style={styles.successText}>
                                {t('verification.successMessage')} 
                            </Text>
                        </Animated.View>
                        </>
                )}
            </View>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#57C3EA",
  },
  contentContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  formCard:{
    width: 339,
    height: 335,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
  },
  loadingCard: {
    width: "80%",
    height: 200,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  connectedText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "600",
  },
  animationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    top: 80,
    zIndex: 1
  },
  circleContainer: {
    position: 'absolute',
  },
  checkmarkContainer: {
    position: 'absolute',
  },
  confirmationContainer: {
    marginTop: 200,
    position: 'relative'
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

export default AddRobotLoadingScreen;
