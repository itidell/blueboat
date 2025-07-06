import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StatusBar, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, RefreshControl } from 'react-native';
// Import the components from the original code
import Header from '../../Components/Header';
import BottomNavBar from '../../Components/BottomNavBar';
import RobotStatusHeader from '../../Components/RobotStatusHeader';
import { useRobot } from '../../api/robotContext';
// Import useFocusEffect from react-navigation instead of expo-router
import { useFocusEffect } from '@react-navigation/native';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { FlatList } from 'react-native';
import * as Font from 'expo-font';
import { useTranslation } from 'react-i18next'

const HistoricScreen = ({ route }) => {
  const navigation = useNavigation();
  // Use optional chaining and provide a fallback empty object
  const { robotId } = route?.params || {};
  
  // Safely extract values from useRobot with default values
  const robotContext = useRobot();
  const currentRobot = robotContext?.currentRobot;
  const controlHistory = robotContext?.controlHistory || [];
  const historyLoading = robotContext?.historyLoading || false;
  const historyError = robotContext?.historyError;
  const loadControlHistory = robotContext?.loadControlHistory;
  const hasMoreHistory = robotContext?.hasMoreHistory || false;
  
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { t } = useTranslation();
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

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    console.log('Language selected:', language);
  };

  const handleNotificationChange = (isEnabled) => {
    setNotificationsEnabled(isEnabled);
  };

  // Safely handle loading initial history
  const loadInitialHistory = useCallback(() => {
    if (robotId && loadControlHistory && typeof loadControlHistory === 'function') {
      console.log(`HistoricScreen focused, loading initial history for ${robotId}`);
      try {
        loadControlHistory(robotId, false);
      } catch (error) {
        console.error('Error loading control history:', error);
      }
    } else if (!robotId) {
      console.error("HistoricScreen: robotId is missing!");
    } else if (!loadControlHistory) {
      console.error("HistoricScreen: loadControlHistory function is missing!");
    }
  }, [robotId, loadControlHistory]);

  // Use useFocusEffect from react-navigation
  useFocusEffect(
    useCallback(() => {
      loadInitialHistory();
      
      // Return cleanup function
      return () => {
        // Cleanup if necessary
      };
    }, [loadInitialHistory])
  );

  const handleRefresh = useCallback(async () => {
    if (!robotId || !loadControlHistory || typeof loadControlHistory !== 'function') return;
    
    setIsRefreshing(true);
    try {
      await loadControlHistory(robotId, false);
    } catch (error) {
      console.error('Error refreshing history:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [robotId, loadControlHistory]);

  const handleLoadMore = useCallback(() => {
    if (!historyLoading && hasMoreHistory && robotId && 
        loadControlHistory && typeof loadControlHistory === 'function') {
      console.log("Loading more history...");
      try {
        loadControlHistory(robotId, true);
      } catch (error) {
        console.error('Error loading more history:', error);
      }
    } else {
      console.log("Load more skipped:", { historyLoading, hasMoreHistory, robotId });
    }
  }, [historyLoading, hasMoreHistory, robotId, loadControlHistory]);

  const renderHistoryItem = useCallback(({item}) => {
    if (!item) return null;
    
    try {
      const startTime = item.start_time ? format(new Date(item.start_time), 'MMM d, HH:mm') : t('history.unknownTime');
      const endTime = item.end_time ? format(new Date(item.end_time), 'HH:mm') : t('history.ongoing');
      const duration = item.start_time && item.end_time
        ? formatDistanceToNowStrict(new Date(item.start_time), { unit: 'minute', addSuffix: false }).replace(' minutes', 'min')
        : '-';

      const controllerName = item.user?.full_name || item.user?.email || (item.user_id ? `User ID: ${item.user_id}` : t('history.unknownUser'));
      const formatLocation = (lat, lon) => {
        if (lat == null || lon == null) return t('history.locationNA');
        try {
          return `Lat: ${lat.toFixed(3)}, Lon: ${lon.toFixed(3)}`;
        } catch (e) {
          return 'N/A';
        }
      };
      
      const startLoc = formatLocation(item.start_latitude, item.start_longitude);
      const endLoc = formatLocation(item.end_latitude, item.end_longitude);

      return (
        <View style={styles.historyItem}>
          <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <Text style={styles.userName} numberOfLines={1}>{controllerName}</Text>
                <Text style={styles.durationText}>{duration}</Text>
              </View>
              <Text style={styles.timeText}>
                 {item.start_time ? startTime : t('history.unknownTime')} - {item.end_time ? endTime : t('history.ongoing')} 
              </Text>
              <View style={styles.locationContainer}>
                  <Image source={require('../../../assets/images/location.png')} style={styles.locationIconSmall} />
                  <Text style={styles.locationText} numberOfLines={1}>
                     {t('history.start')}: {startLoc} | {t('history.end')}: {endLoc}
                  </Text>
              </View>
          </View>
        </View>
      );
    } catch (error) {
      console.error('Error rendering history item:', error);
      return (
        <View style={styles.historyItem}>
          <Text>{t('common.error')}</Text>
        </View>
      );
    }
  }, []);
  
  const renderListFooter = () => {
    if (historyLoading && !isRefreshing) {
      return <ActivityIndicator style={{ marginVertical: 20 }} size="small" color="#57C3EA" />;
    }
    if (!hasMoreHistory && controlHistory.length > 0) {
      return <Text style={styles.endOfListText}>{t('history.endOfList')}</Text>;
    }
    return null;
  };
  
  const renderEmptyList = () => {
    if (historyLoading && !isRefreshing && controlHistory.length === 0) {
      return (
        <View style={styles.emptyListContainer}>
            <ActivityIndicator size="large" color="#57C3EA" />
        </View>
      );
    }
    
    if (historyError){
      return (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>{t('history.errorLoading')}</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (!historyLoading && controlHistory.length === 0){
      return (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>{t('history.noHistory')}</Text>
        </View>
      );
    }
    
    return null;
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
      </SafeAreaView>
    );
  }
  
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
        batteryLevel={currentRobot?.realtime?.battery?.level_percentage ?? t('common.na')}
      />
      
      {/* History Container */}
      <View style={styles.historyContainer}>
        <Text style={styles.screenTitle}>{t('history.title')}</Text>
        <FlatList
          data={controlHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={renderEmptyList}
          ListFooterComponent={renderListFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
              <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={["#57C3EA"]} // Spinner color
                  tintColor={"#57C3EA"}
              />
          }/>
      </View>

      {/* Bottom Navigation */}
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
    backgroundColor: '#57C3EA',
  },
  loadingContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#57C3EA',
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    top: 70,
    bottom: 0,
  },
  screenTitle:{
    fontSize: 20,
    fontFamily: 'Poppins_semibold',
    color:'#333',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  listContentContainer:{
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  historyItem:{
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemContent:{
    flex: 1,
  },
  itemHeader:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align items top
    marginBottom: 4,
  },
  userName:{
    fontSize: 15,
    fontFamily: 'Poppins_semibold',
    color: '#333',
    flexShrink: 1, // Allow username to shrink if needed
    marginRight: 8, // Space between username and duration
  },
  durationText: {
    fontSize: 12,
    fontFamily: 'Poppins_semibold',
    color: '#098BEA', // Use accent color for duration
    marginLeft: 'auto', // Push duration to the right
  },
  timeText: { // Time range text
    fontSize: 13,
    color: '#666',
    fontFamily: 'Poppins_semibold',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationIconSmall: { // Specific small icon for location line
    width: 14,
    height: 14,
    tintColor: '#888', // Grey tint for location icon
    marginRight: 5,
  },
  locationText: {
    fontSize: 12,
    color: '#888',
    flexShrink: 1,
  },
  emptyListContainer: {
    flexGrow: 1, // Allow container to grow
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50, // Add padding
    minHeight: 200, // Ensure it takes some space
  },
  emptyListText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    fontFamily: 'Poppins_semibold',
  },
  endOfListText: {
    textAlign: 'center',
    color: '#aaa',
    paddingVertical: 15,
    fontSize: 13,
    fontFamily: 'Poppins_semibold',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#098BEA',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_semibold',
    fontSize: 14,
  },
});

export default HistoricScreen;