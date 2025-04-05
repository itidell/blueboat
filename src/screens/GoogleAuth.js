import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { useAuth } from '../api/authContext';
import apiClient from '../api/api';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = (onSuccess, onError) => {
  const { googleLogin } = useAuth();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '690944237774-jngbbuihhga681nvtlf2n8993viul2ju.apps.googleusercontent.com',
    // Important: Force a mobile browser
    redirectUri: "http://localhost:8000/auth/google/callback",
    webOptions: { preferEphemeralSession: true },
    selectAccount: true,
    useProxy: true,
  });
  
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleToken(id_token);
    } else if (response?.type === 'error') {
      console.error('Google auth error:', response.error);
      if (onError) onError(response.error);
    }
  }, [response]);
  
  const handleGoogleToken = async (idToken) => {
    try {
      // Send the ID token to your backend
      const response = await apiClient.post('/auth/google/token', {
        id_token: idToken
      });
      
      // Process the response from your backend
      const tokens = response.data;
      const userData = await googleLogin(tokens);
      if (onSuccess) onSuccess(userData);
    } catch (error) {
      console.error('Token exchange error:', error);
      if (onError) onError(error);
    }
  };
  
  const signInWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Failed to prompt for authentication:', error);
      if (onError) onError(error);
    }
  };
  
  return { signInWithGoogle };
};