import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, StatusBar, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import Header from '../../Components/Header';
import BottomNavBar from '../../Components/BottomNavBar';
import RobotStatusHeader from '../../Components/RobotStatusHeader';
import { useRobot } from '../../api/robotContext';
import { useFocusEffect } from '@react-navigation/native';
import * as Font from 'expo-font';
import { useTranslation } from 'react-i18next';

const StorageScreen = ({ route }) => {
  const navigation = useNavigation();
  const { robotId } = route?.params || {};
  const { currentRobot, getRobot, loading: contextLoading, realtimeLoading, error: contextError} = useRobot();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
      const loadFonts = async () => {
        await Font.loadAsync({
          'Poppins_semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
          'SecularOne-Regular': require('../../../assets/fonts/SecularOne-Regular.ttf'),
        });
        setFontsLoaded(true);
      };
      loadFonts();
  }, []);

  useFocusEffect(
    useCallback(() =>{
      if(robotId){
        console.log(`StorageScreen focused fetching data for robot: ${robotId}`);
        getRobot(robotId);
      } else{
        console.error("StorageScreen: robotId is missing!");
      }
    }, [robotId, getRobot])
  )

  const storageData = currentRobot?.realtime?.storage;
  const overallPercentage = storageData?.overall_fill_percentage ?? 0;
  const typePercentages = storageData?.type_percentages ?? {};
  const lastEmptied = storageData?.last_emptied_timestamp ? new Date(storageData.last_emptied_timestamp).toLocaleString() : t('common.na');
  const typesCount = Object.keys(typePercentages).length;
  const batteryLevel = currentRobot?.realtime?.battery?.level_percentage ?? t('common.na');
  const typeColors = { 
    plastic: '#1E90FF', 
    metal: '#6A5ACD', 
    organic: '#57C3EA', 
    default: '#A9A9A9'
  };
  
  // Fixed this part - changed typeColors to type
  const legendData = Object.entries(typePercentages).map(([type, percentage]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    percentage: percentage,
    color: typeColors[type.toLowerCase()] || typeColors.default,
  }));

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
    const clampedPercentage = Math.max(0,Math.min(100, percentage));
    const strokeDashoffset = circumference * (1 - clampedPercentage / 100);

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
          <Text style={styles.percentageText}>
            {`${clampedPercentage}%`}
          </Text>
          <Text style={styles.percentageLabel}>{t('storage.percentageFull')}</Text>
        </View>
      </View>
    );
  };

  const PieChartDisplay = ({data}) => {
    const totalPercentage = data.reduce((sum, item) => sum + item.percentage, 0);
    if (totalPercentage === 0){
      return <View style={styles.pieChartContainer}>
        <Text style={styles.noDataText}>
          {t('storage.noTypeData')}
        </Text>
      </View>
    }
    let accumulateWidth = 0;
    return (
      <View style={styles.pieChartContainer}>
        {data.map((item, index) => {
          const widthPercent =
           `${(item.percentage / totalPercentage) * 100}%`;
           return (
            <View 
              key={index}
              style={[
                styles.piePiece,
                { backgroundColor: item.color, width: widthPercent}
              ]}
            />
           );
        })}
      </View>
    );
  };
  
  if (!fontsLoaded) return <View style={styles.container}><ActivityIndicator size="large" color="#57C3EA" /></View>;

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
        batteryLevel={batteryLevel} 
      />
      
      {/* Storage Card */}
      <View style={styles.contentContainer}>
        <View style={styles.storageCard}>
          {/* Circular Robot Icon with Progress */}
          <View style={styles.robotIconContainer}>
            <ProgressCircle percentage={overallPercentage} />
          </View>
          
          <View style={styles.statsContainer}>
           
            <View style={styles.statItem}>
              <Image 
                source={require('../../../assets/images/types.png')} 
                style={styles.statIcon} 
              />
              <View>
                <Text style={styles.statLabel}>{t('storage.wasteTypes')}</Text>
                <Text style={styles.statValue}>{typesCount}</Text>
              </View>
            </View>
          </View>

          {/* Last Emptied Info */}
          <View style={styles.lastEmptiedContainer}>
              <Image source={require('../../../assets/images/historic.png')} style={styles.lastEmptiedIcon} />
              <Text style={styles.lastEmptiedText}>{t('storage.lastEmptied', { timestamp: lastEmptied })}</Text>
          </View>

          {/* Pie Chart and Legend */}
          <Text style={styles.chartTitle}>{t('storage.wasteDistribution')}</Text>
          <PieChartDisplay data={legendData}/>
          <View style = {styles.legendContainer}>
            {legendData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]}/>
                <Text style={styles.legendText}>{`${item.name}: ${item.percentage}%`}</Text>
              </View>
            ))}
            {legendData.length === 0 && <Text style={styles.legendText}>No specific type data</Text>}
          </View>
          {realtimeLoading && <ActivityIndicator style={styles.realtimeLoader} size="small" color="#57C3EA"/>}
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
  robotIconContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 25,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,

  },
  robotIcon: {
    width: 55,
    height: 55,
    marginBottom: 5,

  },
  percentageText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#57C3EA',
    marginTop: 5,
    fontFamily: 'Poppins_semibold',
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
  percentageLabel:{
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins_semibold',
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
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 60,
    height: 60,
    marginRight: 8,
    resizeMode: 'contain',
  },
  statLabel: {
    color: 'gray',
    fontSize: 13,
    fontFamily: 'Poppins_semibold'
  },
  statValue: {
    fontSize: 18, // Larger value
    fontWeight: 'bold',
    fontFamily: 'Poppins_semibold',
    color: '#333',
  },
  lastEmptiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 20, // Space below timestamp
    backgroundColor: '#f8f8f8',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  lastEmptiedIcon: {
    width: 16,
    height: 16,
    tintColor: '#666',
    marginRight: 8,
  },
  lastEmptiedText: {
    fontSize: 13,
    color: '#555',
    fontFamily: 'Poppins_semibold',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_semibold',
    marginBottom: 10, // Space below title
    color: '#444',
    alignSelf: 'flex-start', // Align title left
    marginLeft: 5,
  },
  pieChartContainer: {
    width: '100%',
    height: 20,
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  piePiece: {
    height: '100%',
  },
  noDataText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#999',
    fontSize: 13,
    fontFamily: 'Poppins_semibold',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow legend items to wrap
    justifyContent: 'center', // Center items horizontally
    width: '100%',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    fontFamily: 'Poppins_semibold',
    color: '#555',
  },
  realtimeLoader: {
    marginTop: 10
  }
});

export default StorageScreen;