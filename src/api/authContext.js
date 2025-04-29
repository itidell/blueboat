import React, {createContext, useState, useContext, useEffect} from "react";
import { authService } from "./authService";
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
        await authService.logout();
        setUser(null);
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