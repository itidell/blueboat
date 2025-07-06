// --- START OF FILE GoogleAuth.js ---

import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../api/authContext'; // Adjust path if necessary

// Register the redirect handler
WebBrowser.maybeCompleteAuthSession();

// Your backend URL
const API_URL = "https://9572-2c0f-f3a0-124-ac6b-cd49-4e10-b90e-3165.ngrok-free.app"
export const useGoogleAuth = (onSuccess, onError) => {
  const [loading, setLoading] = useState(false);
  const { googleLogin } = useAuth(); // Get the context function

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const authUrl = `${API_URL}/auth/google/login`;
      // Ensure this EXACT redirect URI is configured in your Google Cloud Console
      // AND is used by your backend when calling oauth.google.authorize_redirect
      const redirectUri = 'exp://192.168.20.224:8081/--/oauth-callback';

      console.log("Starting Google Auth. Opening URL:", authUrl, "Expecting redirect to:", redirectUri);

      // Start the auth flow
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      console.log("WebBrowser result:", result);

      if (result.type === 'success' && result.url) {
        const { url } = result;
        console.log("OAuth Success URL received:", url);

        // --- MODIFIED: Extract BOTH tokens using simple regex ---
        const backendTokenMatch = url.match(/[?&]token=([^&]+)/);
        const firebaseTokenMatch = url.match(/[?&]firebase_token=([^&]+)/); // Look for firebase_token
        const refreshTokenMatch = url.match(/[?&]refresh_token=([^&]+)/);

        const backendAccessToken = backendTokenMatch ? decodeURIComponent(backendTokenMatch[1]) : null;
        const firebaseToken = firebaseTokenMatch ? decodeURIComponent(firebaseTokenMatch[1]) : null; // Extract it
        const extractedRefreshToken = refreshTokenMatch ? decodeURIComponent(refreshTokenMatch[1]) : null;

        console.log("Extracted backend access token:", backendAccessToken ? 'OK' : 'MISSING');
        console.log("Extracted firebase token:", firebaseToken ? 'OK' : 'MISSING');
        console.log("Extracted refresh token:", extractedRefreshToken ? 'OK' : 'MISSING');

        // --- MODIFIED: Check if BOTH tokens are present ---
        if (backendAccessToken && firebaseToken) {

          // Store the backend access token (needed for API calls)
          await AsyncStorage.setItem('access_token', backendAccessToken);
          console.log("Backend access token stored.");

          // Call the context login function, passing BOTH tokens
          // The authService will handle storing refresh token (if any) and signing into Firebase
          console.log("Calling context googleLogin with extracted tokens...");
          const userData = await googleLogin({
            access_token: backendAccessToken,
            firebase_token: firebaseToken,
             // If your backend also includes refresh_token in the redirect, extract and pass it too:
             refresh_token: extractedRefreshToken,
          });

          console.log("Context googleLogin completed successfully.");
          if (onSuccess) onSuccess(userData);

        } else {
          // Throw error if tokens are missing
          console.error("CRITICAL: Missing backend or firebase token in OAuth callback URL:", url);
          throw new Error('Authentication failed: Required tokens not found in response URL.');
        }
      } else if (result.type === 'cancel') {
         console.log("Google Auth cancelled by user.");
        if (onError) onError(new Error('Authentication was canceled by user.'));
      } else {
         console.error("Google Auth failed or was dismissed, result:", result);
        throw new Error(`Authentication failed or was dismissed. Type: ${result.type}`);
      }
    } catch (error) {
      // Catch errors from WebBrowser or token extraction/processing
      console.error("Google sign-in hook error:", error);
      if (onError) onError(error); // Pass the error to the component
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading };
};

// --- END OF FILE GoogleAuth.js ---