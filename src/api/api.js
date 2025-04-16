import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = "https://d052-2c0f-f3a0-12a-75fe-9e5-8205-5d17-dcc.ngrok-free.app";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers:{
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});



apiClient.interceptors.request.use(
    async(config) =>{
        const token = await AsyncStorage.getItem('access_token');
        if(token){
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) =>{
        return Promise.reject(error);
    }
);

// In api.js - Update the refresh token request:
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                console.log("Refresh Token:", refreshToken);
                
                if (!refreshToken) {
                    console.log("No refresh token available - user likely needs to log in");
                    await AsyncStorage.removeItem('access_token');
                    await AsyncStorage.removeItem('user_data');
                    
                    return Promise.reject(new Error("Authentication required"));
                }

                // Change this part - send the token in the request body instead of headers
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, 
                    {},
                    {
                        headers: {
                            'refresh_token': refreshToken  // Send in header
                          }
                    }
                );
                
                const { access_token, refresh_token } = response.data;
                await AsyncStorage.setItem('access_token', access_token);
                await AsyncStorage.setItem('refresh_token', refresh_token);

                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                return apiClient(originalRequest);
            } catch (error) {
                // Clear authentication data on failure
                await AsyncStorage.removeItem('access_token');
                await AsyncStorage.removeItem('refresh_token');
                await AsyncStorage.removeItem('user_data');
                
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;