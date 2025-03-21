// src/components/layouts/MainLayout.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomNavBar from './BottomNavBar';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/RobotHomeScreens/SearchScreen';
import AddRobotScreen from '../screens/RobotHomeScreens/AddRobotScreen';
import ProfileScreen from '../screens/RobotHomeScreens/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('home');

  // Custom tab bar that stays fixed in place
  const renderTabBar = ({navigation}) => (
    <View style={styles.tabBarContainer}>
      <BottomNavBar 
        navigation={navigation}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Tab.Navigator
        tabBar={renderTabBar}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="MainHome" 
          component={HomeScreen} 
        />
        <Tab.Screen 
          name="Search" 
          component={SearchScreen} 
        />
        <Tab.Screen 
          name="MainAddRobot" 
          component={AddRobotScreen} 
        />
        <Tab.Screen 
          name="MainProfile" 
          component={ProfileScreen} 
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});

export default MainLayout;