// src/components/layouts/MainLayout.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import BottomNavBar from './BottomNavBar';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/RobotHomeScreens/SearchScreen';
import AddRobotScreen from '../screens/RobotHomeScreens/AddRobotScreen';
import ProfileScreen from '../screens/RobotHomeScreens/ProfileScreen';
import RobotHomeScreen from '../screens/RobotHomeScreens/RobotHomeScreen';
import LiveStreamingScreen from '../screens/RobotHomeScreens/LiveStreamingScreen';
import AddRobotLoadingScreen from '../screens/RobotHomeScreens/AddRobotLoadingScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack Navigator
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="RobotHome" component={RobotHomeScreen} />
    <Stack.Screen name="LiveStreaming" component={LiveStreamingScreen} />
    <Stack.Screen name="AddRobot" component={AddRobotScreen} />
  </Stack.Navigator>
);

// Search Stack Navigator
const SearchStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SearchMain" component={SearchScreen} />
  </Stack.Navigator>
);

// Add Robot Stack Navigator
const AddRobotStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AddRobotMain" component={AddRobotScreen} />
    <Stack.Screen name="RobotHome" component={RobotHomeScreen} />
    <Stack.Screen name="AddRobotLoading" component={AddRobotLoadingScreen} />
  </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
  </Stack.Navigator>
);

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <View style={styles.container}>
      <Tab.Navigator
        tabBar={props => <BottomNavBar {...props} activeTab={activeTab} setActiveTab={setActiveTab} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="MainHome" 
          component={HomeStack}
          listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default action if already on the tab
            if (!navigation.isFocused()) {
              setActiveTab('home');
              navigation.navigate('HomeMain');
            }
          },
        })}
        />
        <Tab.Screen 
          name="MainSearch" 
          component={SearchStack}
          listeners={{
            tabPress: () => setActiveTab('search'),
          }}
        />
        <Tab.Screen 
          name="MainAddRobot" 
          component={AddRobotStack}
          listeners={{
            tabPress: () => setActiveTab('add'),
          }}
        />
        <Tab.Screen 
          name="MainProfile" 
          component={ProfileStack}
          listeners={{
            tabPress: () => setActiveTab('profile'),
          }}
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