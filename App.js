import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from "./src/screens/SplashScreen.js";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from './src/screens/LoginScreen.js';
import CreateAccountScreen from './src/screens/SignupScreens/CreateAccountScreen.js';
import WelcomeScreen from './src/screens/WelcomeScreen.js';
import VerificationScreen from './src/screens//SignupScreens/VerficationScreen.js';
import LoadingStateScreen from './src/screens//SignupScreens/LoadingStateScreen.js';
import RobotHomeScreen from './src/screens/RobotHomeScreens/RobotHomeScreen.js';
import ForgetPasswordScreen from './src/screens/ForgetPasswordScreens/ForgetPassworScreeen.js';
import LiveStreamingScreen from './src/screens/RobotHomeScreens/LiveStreamingScreen.js';
import SearchScreen from './src/screens/RobotHomeScreens/SearchScreen.js';
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
            name="Login" 
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
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0], // Slide up from bottom
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
            name="CreateAccount" 
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
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0], // Slide up from bottom
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
            name="Verification" 
            component={VerificationScreen}
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
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0], // Slide up from bottom
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
            name="LoadingState" 
            component={LoadingStateScreen}
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
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0], // Slide up from bottom
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1, 1],
                      outputRange: [0, 1, 1], // Fade in while sliding
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
            name="ForgetPassword" 
            component={ForgetPasswordScreen}
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
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0], // Slide up from bottom
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1, 1],
                      outputRange: [0, 1, 1], // Fade in while sliding
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
          name="RobotHome" 
          component={RobotHomeScreen}
          options={{
            gestureEnabled: true,
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 600 } },
              close: { animation: 'timing', config: { duration: 500 } }
            },
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [{
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0], // Slide in from right
                  }),
                }],
                opacity: current.progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.7, 1], // Smooth fade in
                }),
              },
              overlayStyle: {
                opacity: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5], // Subtle background overlay
                }),
              }
            }),
          }}
        />
        
  <Stack.Screen 
          name="LiveStreaming" 
          component={LiveStreamingScreen}
          options={{
            gestureEnabled: true,
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 600 } },
              close: { animation: 'timing', config: { duration: 500 } }
            },
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [{
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0], // Slide in from right
                  }),
                }],
                opacity: current.progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.7, 1], // Smooth fade in
                }),
              },
              overlayStyle: {
                opacity: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5], // Subtle background overlay
                }),
              }
            }),
          }}
        />
  <Stack.Screen 
          name="SearchScreen" 
          component={SearchScreen}
          options={{
            gestureEnabled: true,
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 600 } },
              close: { animation: 'timing', config: { duration: 500 } }
            },
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [{
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0], // Slide in from right
                  }),
                }],
                opacity: current.progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.7, 1], // Smooth fade in
                }),
              },
              overlayStyle: {
                opacity: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5], // Subtle background overlay
                }),
              }
            }),
          }}
        />
    
      </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}



