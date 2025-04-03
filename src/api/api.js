import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = "http://192.168.173.93:8000";

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

apiClient.interceptors.response.use(
    (response) => response,
    async (error) =>{
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;

            try{
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                if(!refreshToken){
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {},{
                    headers: {
                        'refresh_token' : refreshToken
                    }
                });
                
                const { access_token, refresh_token } = response.data;
                await AsyncStorage.setItem('access_token', access_token);
                await AsyncStorage.setItem('refresh_token', refresh_token);

                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                return apiClient(originalRequest);
            }catch (error) {
                await AsyncStorage.removeItem('access_token');
                await AsyncStorage.removeItem('refresh_token');
        
                // Here you would typically navigate to login
                // This depends on your navigation setup
                return Promise.reject(error);
            }
        }
        return Promise.reject(error)
    }
);

export default apiClient;