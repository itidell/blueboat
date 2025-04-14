import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../api/authContext';

// Register the redirect handler
WebBrowser.maybeCompleteAuthSession();

// Your backend URL
const API_URL = "https://a4c4-2c0f-f3a0-129-afb8-980c-e72d-28ff-2cba.ngrok-free.app";


export const useGoogleAuth = (onSuccess, onError) => {
  const [loading, setLoading] = useState(false);
  const { googleLogin } = useAuth();

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Step 1: Open the web browser to your backend's Google login endpoint
      const authUrl = `${API_URL}/auth/google/login`;
      
      // Start the auth flow - this will redirect to Google login page
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'exp://192.168.37.93:8081/--/oauth-callback'
      );
      
      // Check the result
      if (result.type === 'success') {
        // Extract the token from the URL
        const { url } = result;
        const tokenParam = url.match(/[?&]token=([^&]+)/);
        
        if (tokenParam && tokenParam[1]) {
          const accessToken = decodeURIComponent(tokenParam[1]);
          
          // Store the token
          await AsyncStorage.setItem('access_token', accessToken);
          
          // Process login with your auth context
          const userData = await googleLogin({ 
            access_token: accessToken,
            refresh_token: accessToken, // Your backend likely handles refresh tokens internally
          });
          
          if (onSuccess) onSuccess(userData);
        } else {
          throw new Error('No token found in response');
        }
      } else if (result.type === 'cancel') {
        if (onError) onError(new Error('Authentication was canceled'));
      } else {
        if (onError) onError(new Error('Authentication failed'));
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading };
};