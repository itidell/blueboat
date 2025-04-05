import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authService } from '../api/authService';
import { useAuth } from '../api/authContext';

const OAuthCallbackScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { setUser } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Get tokens from route params
        const { access_token, refresh_token } = route.params || {};
        
        if (!access_token || !refresh_token) {
          setError('Missing authentication tokens');
          return;
        }

        // Process the OAuth login
        const userData = await authService.processOAuthLogin({
          access_token,
          refresh_token
        });
        
        // Update auth context
        setUser(userData);
        
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        setError(error.message || 'Authentication failed');
      }
    };

    processOAuthCallback();
  }, [route.params]);

  return (
    <View style={styles.container}>
      {error ? (
        <View>
          <Text style={styles.errorText}>Authentication Error</Text>
          <Text>{error}</Text>
        </View>
      ) : (
        <>
          <ActivityIndicator size="large" color="#098BEA" />
          <Text style={styles.loadingText}>Completing login...</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins_semibold',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
    fontFamily: 'Poppins_semibold',
  },
});

export default OAuthCallbackScreen;