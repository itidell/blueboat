import apiClient from "./api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { Profiler } from "react";

export const authService = {
    register: async (userData) => {
        try {
            console.log("Sending request to:", apiClient.defaults.baseURL + '/users');
            console.log("Headers:", apiClient.defaults.headers);
            const response = await apiClient.post('/users', userData);
            console.log("Registration Success:", response.data);
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
            const {access_token, refresh_token, expires_in, id, full_name, email, mobile_number, is_active, loggedin_at} = response.data;
            
            await AsyncStorage.setItem('access_token', access_token);
            await AsyncStorage.setItem('refresh_token', refresh_token);
            const userData = { id, full_name, email, mobile_number, is_active, loggedin_at};
            await AsyncStorage.setItem('user_data', JSON.stringify(userData));

            return userData;
        } catch(error) {
            console.error("Login Error:", error.response?.data || error);
            throw error.response?.data || error;
        }
    },

    processOAuthLogin: async (tokens) => {
        try{
            const { access_token, refresh_token, id_token} = tokens;

            await AsyncStorage.setItem('access_token', access_token);
            await AsyncStorage.setItem('refresh_token', refresh_token);

            const response = await apiClient.get('/users/me');
            const userData = response.data;
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
            throw error.response?.data || error;
        }
    },
    
    verifyAccount: async(verificationData) => {
        try{
            const response = await apiClient.post('/users/verify', verificationData);
            return response.data;
        } catch (error){
            throw error.response?.data || error;
        }
    },

     // Logout user
    logout: async () => {
        try {
            // Clear stored tokens and user data
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('refresh_token');
            await AsyncStorage.removeItem('user_data');
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
          const response = await apiClient.post('/users/resend-verification', emailData);
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
                const updateData = {...parseData, ...response.data}
                await AsyncStorage.setItem('user_data', JSON.stringify(updateData));
            }
            return response.data;
        } catch (error) {
            console.error("Profile Update Error:", error.response?.data || error)
            throw error.response?.data || error;
        }
    }
};