import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from "./src/screens/SplashScreen.js";
import LoginScreen from './src/screens/login.js';
import CreateAccountScreen from './src/screens/createaccountscreen.js';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WelcomeScreen from './src/screens/WelcomeScreen.js';

const Stack = createStackNavigator();
const customTransition = {
  animation: 'timing',
  config: {
    duration: 400, // Adjust duration as needed
  }
};
export default function App(){
  return(
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          cardStyleInterpolator: ({ current: { progress } }) => {
            return {
              cardStyle: {
                opacity: progress
              }
            };
          }
        }}
        >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
        />
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={() => ({
            gestureEnabled: false,
            transitionSpec: {
              open: {
                animation: 'timing',
                config: { duration: 500 }
              },
              close: {
                animation: 'timing',
                config: { duration: 500 }
              }
            },
            cardStyleInterpolator: ({ current: { progress } }) => {
              return {
                cardStyle: {
                  opacity: progress
                }
              };
            }
          })}
        />
      <Stack.Screen 
            name="login" 
            component={LoginScreen}
            options={{
              gestureEnabled: true,
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: { duration: 600 }  // Smoother, slightly longer duration
                },
                close: {
                  animation: 'timing',
                  config: { duration: 500 }
                }
              },
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateY: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.height, 0], // Slide up from bottom
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.7, 1], // Fade in while sliding
                    }),
                  },
                  overlayStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5], // Slight overlay for depth effect
                    }),
                  }
                };
              },
            }}
          />
      <Stack.Screen 
            name="createaccountscreen" 
            component={CreateAccountScreen}
            options={{
              gestureEnabled: true,
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: { duration: 600 }  // Smoother, slightly longer duration
                },
                close: {
                  animation: 'timing',
                  config: { duration: 500 }
                }
              },
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateY: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.height, 0], // Slide up from bottom
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.7, 1], // Fade in while sliding
                    }),
                  },
                  overlayStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5], // Slight overlay for depth effect
                    }),
                  }
                };
              },
            }}
          />
      </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}


