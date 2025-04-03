import apiClient from "./api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

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
};