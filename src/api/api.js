import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = "https://9572-2c0f-f3a0-124-ac6b-cd49-4e10-b90e-3165.ngrok-free.app";
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers:{
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});


apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh if it's a 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark request as retried

            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');

                // FIX: Only proceed with refresh if a refresh token exists
                if (refreshToken) {
                    console.log("Attempting token refresh with Refresh Token:", refreshToken);

                    // FIX: Send refresh_token in a custom header named 'refresh_token'
                    const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`,
                        null, // No request body
                        {
                            timeout: 15000,
                            headers: {
                                'refresh_token': refreshToken // CRITICAL: Send in header, matching backend's Header()
                            }
                        }
                    );

                    const { access_token, refresh_token: new_refresh_token } = refreshResponse.data;

                    // Store new tokens
                    await AsyncStorage.setItem('access_token', access_token);
                    await AsyncStorage.setItem('refresh_token', new_refresh_token);

                    // Update the default Authorization header for apiClient
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

                    // Retry the original request with the new access token
                    originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                    console.log("Token refresh successful. Retrying original request.");
                    return apiClient(originalRequest); // Recursively call apiClient with original config
                } else {
                    // FIX: If no refresh token, don't try to refresh. Just reject the original error.
                    // The calling code (e.g., authService) should handle "authentication required" if no refresh token is present.
                    console.log("No refresh token available. Cannot perform token refresh.");
                    // Clear local storage to ensure clean state for re-login
                    await AsyncStorage.removeItem('access_token');
                    await AsyncStorage.removeItem('refresh_token');
                    await AsyncStorage.removeItem('user_data');
                    delete apiClient.defaults.headers.common['Authorization']; // Clear default header
                    return Promise.reject(new Error("Authentication required: No refresh token to reauthenticate.")); // Inform caller to log in.
                }
            } catch (refreshError) {
                // This catch block handles errors during the refresh token call itself
                console.error("Token refresh failed:", refreshError);
                // Clear all auth data if refresh fails (token invalid, expired, etc.)
                await AsyncStorage.removeItem('access_token');
                await AsyncStorage.removeItem('refresh_token');
                await AsyncStorage.removeItem('user_data');
                delete apiClient.defaults.headers.common['Authorization'];
                // Reject the original error, indicating that authentication has failed.
                return Promise.reject(new Error("Authentication failed: Could not refresh token. Please log in again."));
            }
        }
        // For non-401 errors, or 401s that have already been retried, or 401s with no refresh token (handled above)
        return Promise.reject(error); // Re-throw the original error for the calling function to handle
    }
);

export default apiClient;