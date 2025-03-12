import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from "./src/screens/splashscreen.js";
import LoginScreen from './src/screens/login.js';
import CreateAccountScreen from './src/screens/createaccountscreen.js';


const Stack = createStackNavigator();
export default function App(){
  return(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="login"  component={LoginScreen}/>
        <Stack.Screen name="createaccountscreen"  component={CreateAccountScreen}/>
        </Stack.Navigator>
    </NavigationContainer>
  )
  r
}


