import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StatusBar, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import Header from '../../Components/Header';
import BottomNavBar from '../../Components/BottomNavBar';
import RobotStatusHeader from '../../Components/RobotStatusHeader';

const StorageScreen = ({ route }) => {
  const navigation = useNavigation();
  const { robotId = 'robotId', robotBatteryLevel } = route?.params || {};
  const [activeTab, setActiveTab] = useState('home');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    console.log('Language selected:', language);
  };

  const handleNotificationChange = (isEnabled) => {
    setNotificationsEnabled(isEnabled);
  };

  // Progress Circle Component
  const ProgressCircle = ({ percentage, size = 160, strokeWidth = 15 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference * (1 - percentage / 100);

    return (
      <View style={styles.progressCircleContainer}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#57C3EA" />
              <Stop offset="100%" stopColor="#1E90FF" />
            </LinearGradient>
          </Defs>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#E0E0E0"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
          {/* Progress Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="url(#grad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.robotIconOverlay}>
          <Image 
            source={require('../../../assets/images/yacht.png')} 
            style={styles.robotIcon} 
            resizeMode="contain"
          />
          <Text style={styles.percentageText}>50%</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#57C3EA" barStyle="dark-content" />
      
      {/* Header Component */}
      <Header
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        notificationsEnabled={notificationsEnabled}
        onNotificationChange={handleNotificationChange}
      />

      {/* Robot Status Header */}
      <RobotStatusHeader 
        robotId={robotId} 
        batteryLevel={robotBatteryLevel} 
      />
      
      {/* Storage Card */}
      <View style={styles.contentContainer}>
        <View style={styles.storageCard}>
          {/* Circular Robot Icon with Progress */}
          <View style={styles.robotIconContainer}>
            <ProgressCircle percentage={50} />
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Image 
                source={require('../../../assets/images/percentage.png')} 
                style={styles.statIcon} 
              />
              <View>
                <Text style={styles.statLabel}>Percentage</Text>
                <Text style={styles.statValue}>50%</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <Image 
                source={require('../../../assets/images/types.png')} 
                style={styles.statIcon} 
              />
              <View>
                <Text style={styles.statLabel}>Types</Text>
                <Text style={styles.statValue}>3</Text>
              </View>
            </View>
          </View>

          {/* Pie Chart */}
          <View style={styles.pieChartContainer}>
            <View style={[styles.piePiece, styles.plasticPie, { width: '79%' }]} />
            <View style={[styles.piePiece, styles.metalPie, { width: '11%' }]} />
            <View style={[styles.piePiece, styles.organicPie, { width: '10%' }]} />
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.plasticColor]} />
              <Text style={styles.legendText}>Plastic</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.metalColor]} />
              <Text style={styles.legendText}>Metal</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.organicColor]} />
              <Text style={styles.legendText}>Organic</Text>
            </View>
          </View>
        </View>
      </View>

      <BottomNavBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... previous styles remain the same
  robotIconContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircleContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotIconOverlay: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotIcon: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#57C3EA',
  },
  container: {
    flex: 1,
    backgroundColor: '#57C3EA',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    
  },
  storageCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginTop:-80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  robotIconContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  robotIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#57C3EA',
  },
  robotIcon: {
    width: 70,
    height: 70,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  statLabel: {
    color: 'gray',
    fontSize: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pieChartContainer: {
    width: '100%',
    height: 150,
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  piePiece: {
    height: '100%',
  },
  organicPie: {
    backgroundColor: '#57C3EA',
  },
  metalPie: {
    backgroundColor: '#6A5ACD',
  },
  plasticPie: {
    backgroundColor: '#1E90FF',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 5,
  },
  organicColor: {
    backgroundColor: '#57C3EA',
  },
  metalColor: {
    backgroundColor: '#6A5ACD',
  },
  plasticColor: {
    backgroundColor: '#1E90FF',
  },
  legendText: {
    fontSize: 12,
  },
});

export default StorageScreen;