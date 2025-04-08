import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../api/authContext';

export default function OAuthCallbackScreen() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const { googleLogin } = useAuth();

  useEffect(() => {
    const processAuth = async () => {
      try {
        if (token) {
          // Store the token
          await AsyncStorage.setItem('access_token', token);
          
          // Process login with auth context
          await googleLogin({ access_token: token });
          
          // Navigate to main app screen
          router.replace('/MainApp');
        } else {
          // Handle error case
          console.error('No token received');
          router.replace('/Login');
        }
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        router.replace('/Login');
      }
    };
    
    processAuth();
  }, [token]);

  return (
    <View style={styles.container}>
      <Text>Completing login...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});