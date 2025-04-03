import React, {createContext, useState, useContext} from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) =>{
    const [registrationData, setRegistrationData] =useState({
        full_name: '',
        email: '',
        mobile_number: '',
        password: '',
        confirm_password: ''
    });

    const updateRegistrationData = (data) => {
        setRegistrationData(prev => ({...prev, ...data}));

    };

    return(
        <AuthContext.Provider value={{ 
            registrationData, 
            updateRegistrationData
          }}>
            {children}
          </AuthContext.Provider>
        );
}