import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import app from './src/utils/firebaseConfig.js';
import LoginScreen from './src/screens/LoginScreen.js';
import WelcomeScreen from './src/screens/WelcomeScreen.js';
import CreateAccountScreen from './src/screens/SignupScreens/CreateAccountScreen.js';
import VerificationScreen from './src/screens/SignupScreens/VerificationScreen.js';
import LoadingStateScreen from './src/screens/SignupScreens/LoadingStateScreen.js';
import ForgetPasswordScreen from './src/screens/ForgetPasswordScreens/ForgetPassworScreeen.js';
import VerificationPasswordScreen from './src/screens/ForgetPasswordScreens/VerificationPasswordScreen.js';
import LoadingStatePasswordScreen from './src/screens/ForgetPasswordScreens/LoadingStatePasswordScreen.js';
import NewPasswordScreen from './src/screens/ForgetPasswordScreens/NewPasswordScreen.js';
import SuccessOperationScreen from './src/screens/ForgetPasswordScreens/SuccessOperationScreen.js'; 
import StorageScreen from './src/screens/RobotHomeScreens/StorageScreen.js';
import RobotHomeScreen from './src/screens/RobotHomeScreens/RobotHomeScreen.js';
import RobotsMapScreen from './src/screens/RobotHomeScreens/RobotsMapScreen.js';
import AddRobotScreen from './src/screens/RobotHomeScreens/AddRobotScreen.js';
import AddRobotLoadingScreen from './src/screens/RobotHomeScreens/AddRobotLoadingScreen.js';
import MainLayout from './src/Components/MainLayout.js';
import ProfileScreen from './src/screens/RobotHomeScreens/ProfileScreen.js';
import LocationAndControllerScreen from './src/screens/RobotHomeScreens/LocationAndControllerScreen.js';
import PasswordSettingScreen from './src/screens/SignupScreens/PasswordSettingScreen.js';
import SplashScreen from './src/screens/splashscreen.js';
import HistoricScreen from './src/screens/RobotHomeScreens/HistoricScreen.js';
import HomeScreen from './src/screens/HomeScreen.js';
import { AuthProvider } from './src/api/authContext.js';
import { Linking } from 'react-native';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RobotProvider } from './src/api/robotContext.js';
import { NotificationProvider } from './src/api/notificationContext.js';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n/i18n.config.js';

const Stack = createStackNavigator();
const customTransition = {
  animation: 'timing',
  config: {
    duration: 400,
  }
};

export default function App(){
  // Dans le composant racine
  return(
    
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
      <AuthProvider>
      <NotificationProvider>
      <RobotProvider>
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
          name="RobotHome" 
          component={RobotHomeScreen} 
        />
              
         <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
        />
      <Stack.Screen name="LocationAndController" component={LocationAndControllerScreen} />
      <Stack.Screen name="Storage" component={StorageScreen} />
      <Stack.Screen name="Historic" component={HistoricScreen} />

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
                  config: { duration: 600 }  
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
                          outputRange: [layouts.screen.width, 0], 
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.7, 1], 
                    }),
                  },
                  overlayStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5],
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
                  config: { duration: 600 }  
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
                          outputRange: [layouts.screen.width, 0], 
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.7, 1], 
                    }),
                  },
                  overlayStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5], 
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
                  config: { duration: 600 }  
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
                          outputRange: [layouts.screen.width, 0], 
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0.7, 1], 
                    }),
                  },
                  overlayStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5], 
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
                  config: { duration: 600 }  
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
                          outputRange: [layouts.screen.width, 0], 
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1, 1],
                      outputRange: [0, 1, 1], 
                    }),
                  },
                  overlayStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5], 
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
                  config: { duration: 600 }  
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
                          outputRange: [layouts.screen.width, 0], 
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1, 1],
                      outputRange: [0, 1, 1], 
                    }),
                  },
                  overlayStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5], 
                    }),
                  }
                };
              },
            }}
          />
      <Stack.Screen 
            name="LoadingStatePassword" 
            component={LoadingStatePasswordScreen}
            options={{
              gestureEnabled: true,
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: { duration: 600 }  
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
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1, 1],
                      outputRange: [0, 1, 1], 
                    }),
                  },
                  overlayStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5], 
                    }),
                  }
                };
              },
            }}
          />
            <Stack.Screen
                    name="NewPassword"
                    component={NewPasswordScreen}
                    options={{
                      gestureEnabled: true,
                      transitionSpec: {
                        open: {
                          animation: 'timing',
                          config: { duration: 600 } 
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
                                  outputRange: [layouts.screen.width, 0], 
                                }),
                              },
                            ],
                            opacity: current.progress.interpolate({
                              inputRange: [0, 1, 1],
                              outputRange: [0, 1, 1], 
                            }),
                          },
                          overlayStyle: {
                            opacity: current.progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 0.5], 
                            }),
                          }
                        };
                      },
                    }} />
                  <Stack.Screen
                      name="SuccessOperation"
                      component={SuccessOperationScreen}
                      options={{
                        gestureEnabled: true,
                        transitionSpec: {
                          open: {
                            animation: 'timing',
                            config: { duration: 600 } 
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
                                    outputRange: [layouts.screen.width, 0], 
                                  }),
                                },
                              ],
                              opacity: current.progress.interpolate({
                                inputRange: [0, 1, 1],
                                outputRange: [0, 1, 1], 
                              }),
                            },
                            overlayStyle: {
                              opacity: current.progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 0.5], 
                              }),
                            }
                          };
                        },
                      }} />
      <Stack.Screen 
            name="VerificationPassword" 
            component={VerificationPasswordScreen}
            options={{
              gestureEnabled: true,
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: { duration: 600 } 
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
                          outputRange: [layouts.screen.width, 0], 
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1, 1],
                      outputRange: [0, 1, 1], 
                    }),
                  },
                  overlayStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5], 
                    }),
                  }
                };
              },
            }}
          />
        <Stack.Screen 
          name='MainApp'
          component={MainLayout}
          options={{
            gestureEnabled: false,
          }}
        />
  <Stack.Screen 
          name="AddRobotLoading" 
          component={AddRobotLoadingScreen}
          options={{
            gestureEnabled: true,
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 600 } },
              close: { animation: 'timing', config: { duration: 500 } }
            },
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0], 
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1, 1],
                      outputRange: [0, 1, 1],
                    }),
                  },
                  overlayStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5], 
                    }),
                  }
                };
              },
            }}
          />
  <Stack.Screen 
          name="PasswordSetting" 
          component={PasswordSettingScreen}
          options={{
            gestureEnabled: true,
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 600 } },
              close: { animation: 'timing', config: { duration: 500 } }
            },
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0], 
                        }),
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1, 1],
                      outputRange: [0, 1, 1],
                    }),
                  },
                  overlayStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5], 
                    }),
                  }
                };
              },
            }}
          />
      </Stack.Navigator>
      </NavigationContainer>
      </RobotProvider>
      </NotificationProvider>
      </AuthProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  )
}



