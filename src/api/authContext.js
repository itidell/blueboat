import React, {createContext, useState, useContext, useEffect} from "react";
import { authService } from "./authService";
import apiClient from "./api";
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) =>{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false); // Add loading state
    const [registrationData, setRegistrationData] =useState({
        full_name: '',
        email: '',
        mobile_number: '',
        password: '',
        confirm_password: ''
    });
    // Handler for auth errors
    const handleAuthError = () => {
      console.log("Auth error detected, clearing user session");
      setUser(null);
      // You don't need navigation here, the components will handle it
  };

  // Set up the error interceptor
  useEffect(() => {
      const interceptor = apiClient.interceptors.response.use(
          (response) => response,
          async (error) => {
              // Check for our custom auth error flag
              if (error?.isAuthError) {
                  handleAuthError();
              }
              return Promise.reject(error);
          }
      );

      // Clean up interceptor when component unmounts
      return () => {
          apiClient.interceptors.response.eject(interceptor);
      };
  }, []);

    useEffect(() => {
      const loadUser = async () => {
        try{
          const isLoggedIn = await authService.isLoggedIn();
          if (isLoggedIn) {
            const userData = await authService.getUserData();
            setUser(userData);
          }
        } catch (error) {
           console.error("Error loading user:", error);
        }
      };
      loadUser();
    }, []);

    const login = async (creadentials) => {
      try{
        const userData = await authService.login(creadentials);
        setUser(userData);
        return userData;
      }catch(error){
        throw error;
      }
    };

    const googleLogin = async (tokens) => {
      try{
        console.log("Google login called with tokens", 
          tokens ? "✓" : "✗");
        setLoading(true);
        const userData = await authService.processOAuthLogin(tokens);
        console.log("OAuth login successful, user data:", 
          userData ? JSON.stringify({
            id: userData.id,
            email: userData.email,
            name: userData.full_name,
            has_picture: !!userData.profile_picture,
          }) : "No user data returned");
        setUser(userData);
        setLoading(false);
        return userData;
      } catch(error){
        setLoading(false);
        console.error("Error during Google login:", error?.response?.data || error);
        throw error;
      }
    };
    
    const logout = async () =>{
      try {
        await authService.logout();
        setUser(null);
      }catch (error){
        console.error("Error during logout:", error);
        throw error;
      }
    };
    const updateRegistrationData = (data) => {
        setRegistrationData(prev => ({...prev, ...data}));

    };

    const updateProfile = async (profileData) => {
      try{
        setLoading(true);
        const updatedUserData = await authService.updateProfile(profileData)
        setUser(prev =>({...prev, ...updatedUserData}))
        setLoading(false);
        return updatedUserData
      }catch(error){
        setLoading(false);
        console.error("Error updating profile:",error )
        throw error;
      }
    };

    return(
        <AuthContext.Provider value={{ 
            user,
            login,
            isAuthenticated: !!user,
            logout,
            googleLogin,
            loading,
            registrationData, 
            updateRegistrationData,
            updateProfile
          }}>
            {children}
          </AuthContext.Provider>
        );
}