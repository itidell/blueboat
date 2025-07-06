import apiClient from "./api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { Profiler } from "react";
import md5 from 'crypto-js/md5';
import { getAuth, signInWithCustomToken, signOut} from "firebase/auth";
import { app } from "../utils/firebaseConfig"; // Adjust the import based on your project structure
const getGravatarUrl = (email) => {
    const hash = md5(email.trim().toLowerCase()).toString();
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
};
const auth = getAuth(app);

export const authService = {
    register: async (userData) => {
        try {
            console.log("Sending request to:", apiClient.defaults.baseURL + '/users');
            console.log("Headers:", apiClient.defaults.headers);
            const response = await apiClient.post('/users', userData);
            console.log("Registration Success:", response.data);
            if (response.data && response.data.email) {
                const gravatarUrl = getGravatarUrl(response.data.email);
                // Store this URL for later use after verification
                await AsyncStorage.setItem('pending_profile_picture', gravatarUrl);
            }
            return response.data;
        } catch (error) {
            console.error("Registration Error Full:", error);
            console.error("Response Status:", error.response?.status);
            console.error("Response Data:", error.response?.data);
            console.error("Request Config:", error.config);
            throw error.response?.data || error;
        }
    },

    login: async (credentials) => {
        try{
            console.log("Sending login request with:", JSON.stringify(credentials));
            const response = await apiClient.post('/auth/login', credentials);
            const {access_token, refresh_token, firebase_token, id, full_name, email, mobile_number, is_active, loggedin_at, profile_picture} = response.data;
            
            if (!firebase_token) {
                console.error("CRITICAL: Firebase token missing from backend login response!");
                throw new Error("Authentication failed: Missing required token.");
            }

            await AsyncStorage.setItem('access_token', access_token);
            await AsyncStorage.setItem('refresh_token', refresh_token);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            const userData = { id, full_name, email, mobile_number, is_active, loggedin_at, profile_picture};
            // If no profile picture, set Gravatar
            try{
                console.log("Attempting Firebase sign-in with custom token...");
                const userCredential = await signInWithCustomToken(auth, firebase_token);
                const firebaseUser = userCredential.user;
                console.log("Firebase sign-in successful. User UID:", firebaseUser.uid);
            }catch (firebaseError) {
                console.error("Firebase sign-in failed:", firebaseError);
                await AsyncStorage.removeItem('access_token'); 
                await AsyncStorage.removeItem('refresh_token');
                delete apiClient.defaults.headers.common['Authorization'];
                throw new Error(`Firebase authentication failed: ${firebaseError.message}`);
            }
            if (!profile_picture) {
                const gravatarUrl = getGravatarUrl(email);
                userData.profile_picture = gravatarUrl;
            
                // Update the profile with the Gravatar
                try {
                    await apiClient.put('/users/profile', {
                        profile_picture: gravatarUrl
                    });
                } catch (profileError) {
                    console.error("Failed to update profile with Gravatar:", profileError);
                }
            }
            
            
            await AsyncStorage.setItem('user_data', JSON.stringify(userData));
            return userData;
        } catch(error) {
            console.error("Login Error:", error.response?.data || error);
            delete apiClient.defaults.headers.common['Authorization'];
            let errorMessage = "An unexpected error occurred. Please try again."; // Default fallback message
            let errorCode = "login_error_unknown"; // Custom code for frontend to map to translations

            if (error.response?.data?.detail) {
                const backendDetail = error.response.data.detail;

                // Map specific backend messages to our custom error codes/messages
                if (backendDetail === "Email not found") {
                    errorMessage = "The email address you entered is not registered.";
                    errorCode = "login_error_email_not_found";
                } else if (backendDetail === "Incorrect email or password.") {
                    errorMessage = "Incorrect email or password. Please double-check your credentials and try again.";
                    errorCode = "login_error_incorrect_credentials";
                } else if (backendDetail.includes("Your account is not verified.")) {
                    errorMessage = "Your account is not verified. Please check your email inbox for a verification link.";
                    errorCode = "login_error_unverified";
                } else if (backendDetail.includes("Your account has been deactivated.")) {
                    errorMessage = "Your account has been deactivated. For assistance, please contact our support team.";
                    errorCode = "login_error_deactivated";
                } else {
                    // If it's a backend error we haven't specifically mapped, use its detail
                    errorMessage = backendDetail;
                    errorCode = "login_error_backend_generic";
                }
            } else if (error.message) {
                // This catches network errors (e.g., server unreachable) or unexpected JS errors
                errorMessage = "Could not connect to the server. Please check your internet connection and try again.";
                errorCode = "login_error_network";
            }

            // Throw a custom error object that the LoginScreen can easily consume
            throw {
                message: errorMessage, // User-friendly message
                code: errorCode,     // A code for potential i18n mapping
                originalError: error // Keep original error for debugging purposes if needed
            };
        }
    },

    processOAuthLogin: async (tokens) => {
        try{
            const { access_token, refresh_token, firebase_token} = tokens;
            if (!access_token) {
                throw new Error("Authentication failed: Backend access token is missing.");
            }

            await AsyncStorage.setItem('access_token', access_token);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`; 
            if (refresh_token !== undefined && refresh_token !== null) {
                console.log("Storing refresh token received via OAuth:", refresh_token); // Log if you get one
                await AsyncStorage.setItem('refresh_token', refresh_token);
            } else {
                console.log("No refresh token received via OAuth, skipping storage.");
            }
            const response = await apiClient.get('/users/me');
                // --- SIGN IN TO FIREBASE ---
            try {
                console.log("Attempting Firebase sign-in with custom token after OAuth...");
                const userCredential = await signInWithCustomToken(auth, firebase_token);
                console.log("Firebase sign-in successful after OAuth. User UID:", userCredential.user.uid);
            } catch (firebaseError) {
                console.error("Firebase sign-in failed after OAuth:", firebaseError);
                // Clean up partial login
                await AsyncStorage.removeItem('access_token');
                await AsyncStorage.removeItem('refresh_token');
                delete apiClient.defaults.headers.common['Authorization'];
                throw new Error(`Firebase authentication failed after OAuth: ${firebaseError.message}`);
            }
                // --- END SIGN IN TO FIREBASE ---
            const userData = await authService.getCurrentUser()
            if(!userData.profile_picture && id_token){
                try{
                    const [,payload] = id_token.split('.');
                    const decodedPayload = JSON.parse(atob(payload));

                    if(decodedPayload.picture){
                        userData.profile_picture = decodedPayload.picture;
                        await apiClient.put('/users/profile', {
                            profile_picture: decodedPayload.picture
                        });    
                    }
                } catch (decodeError){
                    console.error("Error decoding Google id_token", decodeError)
                }
            }
            await AsyncStorage.setItem('user_data', JSON.stringify(userData));
            return userData;
            
        }catch(error){
            console.error("OAuth Login Error:", error);
            // Ensure full cleanup on any failure during OAuth processing
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('refresh_token');
            await AsyncStorage.removeItem('user_data');
            delete apiClient.defaults.headers.common['Authorization'];
            throw error.response?.data || error;
        }
    },
    
    verifyAccount: async(verificationData) => {
        try{
            const response = await apiClient.post('/users/verify', verificationData);
            const pendingPicture = await AsyncStorage.getItem('pending_profile_picture');
            if (pendingPicture) {
                try {
                    await apiClient.put('/users/profile', {
                        profile_picture: pendingPicture
                    });
                    // Clean up storage
                    await AsyncStorage.removeItem('pending_profile_picture');
                } catch (profileError) {
                    console.error("Failed to update profile with Gravatar after verification:", profileError);
                }
            }
            return response.data;
        } catch (error){
            throw error.response?.data || error;
        }
    },

     // Logout user
    logout: async () => {
        try {
            try {
                await signOut(auth);
                console.log("Firebase sign-out successful.");
           } catch (firebaseError) {
                console.error("Firebase sign-out failed:", firebaseError);
                // Log error but proceed with clearing local data anyway
           }
            // Clear stored tokens and user data
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('refresh_token');
            await AsyncStorage.removeItem('user_data');
            delete apiClient.defaults.headers.common['Authorization'];
            return true;
        } catch (error) {
            throw error;
        }
    },
    forgetPassword: async(email) => {
        try{
            const response = await apiClient.post('/auth/forget-password', { email });
            return response.data;
        }catch(error){
            throw error.response?.data || error;
        }
    },

    resetPassword: async(resetData) => {
        try{
            const response = await apiClient.put('/auth/reset-password', resetData);
            return response.data;
        }catch (error) {
            throw error.response?.data || error;
        }
    },

    getCurrentUser: async() =>{
        try{
            const response = await apiClient.get('/users/me');
            const userData = response.data;
            // If we have user data but no profile picture, set Gravatar
            if (userData && userData.email && !userData.profile_picture) {
                const gravatarUrl = getGravatarUrl(userData.email);
                userData.profile_picture = gravatarUrl;
            
                // Also update the backend
                try {
                    await apiClient.put('/users/profile', {
                        profile_picture: gravatarUrl
                    });
                } catch (profileError) {
                    console.error("Failed to update profile with Gravatar:", profileError);
                }
            }
        
            // Update local storage
            await AsyncStorage.setItem('user_data', JSON.stringify(userData));
            return response.data;
        } catch(error){
            throw error.response?.data || error;
        }
    },

    // Check if user is logged in
    isLoggedIn: async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            return !!token;
        } catch (error) {
            return false;
        }
    },
  
    // Get user data from storage
    getUserData: async () => {
        try {
            const userData = await AsyncStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    },
    resendVerification: async (emailData) => {
        try {
          const response = await apiClient.post('/users/resend-verification',
            typeof emailData === 'string' 
            ? { email: emailData } 
            : emailData
        );
          return response.data;
        } catch (error) {
          throw error.response?.data || error;
        }
    },
    verifyPassword: async (passwordData) => {
        try {
          // Make sure we're sending the correct format - a string, not an object
          const response = await apiClient.post('/users/verify-password', 
            typeof passwordData === 'string' 
              ? { password: passwordData } 
              : passwordData
          );
          return response.data.verified;
        } catch (error) {
          console.error("Password verification error:", error.response?.data || error);
          throw error.response?.data || error;
        }
    },
    updateProfile: async (profileData) => {
        try {
            const response = await apiClient.put('/users/profile', profileData);
            const userData = await AsyncStorage.getItem('user_data')
            if (userData) {
                const parseData = JSON.parse(userData)
                const updateData = {...parseData}
                for (const key in response.data){
                    if (response.data[key] !== null && response.data[key] !== undefined){
                        updateData[key] = response.data[key]
                    }
                }
                await AsyncStorage.setItem('user_data', JSON.stringify(updateData));
                return updateData;
            }
            return response.data;
        } catch (error) {
            console.error("Profile Update Error:", error.response?.data || error)
            throw error.response?.data || error;
        }
    },
    resendResetPasswordCode: async (email) =>{
        try{
            const response = await apiClient.post('/auth/resend-reset-code', {email});
            return response.data;
        }
        catch (error){
            console.error("Resend password reset code error", error.response?.data || error);
            throw error.response?.data || error;
        }
    },
};