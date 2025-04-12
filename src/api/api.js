import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

<<<<<<< HEAD
const API_BASE_URL = "https://70d0-2c0f-f3a0-92-4f95-ac20-cf6d-47d0-a55d.ngrok-free.app";
=======
const API_BASE_URL = "https://e7c4-2c0f-f3a0-125-ed51-5834-af70-1416-c3b3.ngrok-free.app";
>>>>>>> 068b110c8848323146ad5f8296c45ffc2fd2f9cb

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
                            'Authorization': `Bearer ${refreshToken}`  // Send in header
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