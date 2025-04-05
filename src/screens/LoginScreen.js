import React, { useState, useEffect } from 'react';
import {useNavigation} from '@react-navigation/native';
import { Svg, Path } from 'react-native-svg';
import {StyleSheet, View, Text, TextInput,  TouchableOpacity, Image,  SafeAreaView, StatusBar, Dimensions} from 'react-native';
import { useAuth } from '../api/authContext';
import * as Font from 'expo-font';
import { useGoogleAuth } from './GoogleAuth'; // Adjust the import path as necessary

const screenWidth = Dimensions.get('window').width;
// Eye Icon Component 
const EyeIcon = ({ visible }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#666">
    {visible ? (
      // Eye open icon
      <>
        <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="1.5" />
        <Path d="M12 9a3 3 0 0 1 0 6 3 3 0 0 1 0-6z" strokeWidth="1.5" />
      </>
    ) : (
      // Eye closed icon
      <>
        <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="1.5" />
        <Path d="M12 9a3 3 0 0 1 0 6 3 3 0 0 1 0-6z" strokeWidth="1.5" />
        <Path d="M4 4l16 16" strokeWidth="1.5" />
      </>
    )}
  </Svg>
);

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginButtonPressed, setLoginButtonPressed] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const handleGoogleAuthSuccess = (userData) =>{
    console.log('Google auth successful, user data:', userData);
    navigation.navigate('MainApp');
  };
  
  const handleGoogleAuthError = (error) =>{
    console.error('Google auth error:', error);
    Alert.alert('Authentication Error', error.message || 'An error occurred during authentication.');
  };
  const { signInWithGoogle } = useGoogleAuth(handleGoogleAuthSuccess, handleGoogleAuthError);

  const handleBackHome = () => {
    setTimeout(() => {
        navigation.navigate('Welcome');
    }, 150)
  };
  const handleSignupPress = () => {
    setTimeout(() => {
        navigation.navigate('CreateAccount');
      }, 150); 
  };
  const handleLoginPress = async () => {
    try{
      await login({identifier, password});
      navigation.navigate('MainApp');
    }catch (error){
      const errorMessage = error.message || 'Login Failed. Please check your credentials.';
      Alert.alert('Login Error', errorMessage);
    }finally{
      setIsLoading(false);
    }
  };
  const handleForgetPasswordPress = () => {
    setTimeout(() => {
        navigation.navigate('ForgetPassword');
      }, 150); 
  };

  const handleGooglePress = () =>{
    signInWithGoogle();
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins_semibold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);
  if (!fontsLoaded) return <View style={styles.container}><Text>Loading...</Text></View>;
  
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#57C3EA" barStyle="light-content" />
      
      {/* Header with Logo and title */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <TouchableOpacity onPress={handleBackHome}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logoImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Login Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.loginTitle}>Login</Text>
      </View>

      {/* Form Container */}
      <View style={styles.formContainer}>
        {/* Username Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Username or Email</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.inputField}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Exemple@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={[styles.inputField, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your Password"
              secureTextEntry={!passwordVisible}
            />
            <TouchableOpacity 
              style={styles.eyeIconContainer}
              onPress={togglePasswordVisibility}
            >
              <EyeIcon visible={passwordVisible} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgetPasswordPress}>
          <Text style={styles.forgotPasswordText}> Forgot Password? </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity 
          style={[
            styles.loginButton, 
            loginButtonPressed && styles.loginButtonPressed
          ]}
          onPressIn={() => setLoginButtonPressed(true)}
          onPressOut={() => setLoginButtonPressed(false)}
          onPress={handleLoginPress}
        >
          <Text 
            style={[
              styles.loginButtonText, 
              loginButtonPressed && styles.loginButtonTextPressed
            ]}
          >
           Log In
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or Login with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Login - Vertical layout */}
        <TouchableOpacity onPress={handleGooglePress}>
        <View style={styles.googleContainer}>
          <Image
            source={require('../../assets/images/Google.png')}
            style={styles.googleIcon}
          />
          <Text style={styles.googleText}>Google</Text>
        </View></TouchableOpacity>

        {/* Account Link */}
        <View style={styles.accountLinkContainer}>
  
  <TouchableOpacity>
  <Text style={styles.accountText}> Don't have an account?{' '}
    
      <Text style={styles.signUpLink} onPress={handleSignupPress}>Sign Up</Text>
      </Text>
    </TouchableOpacity>
  
</View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#57C3EA',
  },
  header: {
    backgroundColor: '#57C3EA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', 

  },
  logoContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    margin:0,
    
  },
  titleContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#57C3EA',
  },
  loginTitle: {
    marginTop:0,
    fontSize: 30,
    fontWeight: '700',
    color: '#000000FF',
    fontFamily:'SecularOne-Regular',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    width: screenWidth,
    position: 'absolute',
    top: 200,
    bottom: 0,
    fontFamily: 'Poppins_semibold',
  },
  inputWrapper: {
    marginBottom: -8,
    marginTop: 30,
    fontFamily: 'Poppins_semibold',
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
    paddingLeft: 15,
    marginLeft:6,
    fontFamily: 'Poppins_semibold',
  },
  inputBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    height:45,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    fontFamily: 'Poppins_semibold',
  },
  inputField:
   {
    flex: 1,
    fontSize: 13,
    paddingVertical: 12,
    paddingHorizontal: 20,
    textAlign: 'left',
    fontFamily: 'Poppins_semibold',
  },
  passwordInput: {
    paddingRight: 50,
    fontFamily: 'Poppins_semibold',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 15,
    marginBottom: 30,
    fontFamily: 'Poppins_semibold',
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Poppins_semibold',
  },
  loginButton: {
    backgroundColor: '#098BEA',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Poppins_semibold',
    width: 207,
    height: 45,
    alignSelf: 'center',
    marginBottom: 50,
  },
  loginButtonPressed: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#098BEA',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins_semibold',
  },
  loginButtonTextPressed: {
    color: '#098BEA',
    fontFamily: 'Poppins_semibold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    color: '#999',
    fontSize: 13,
    paddingHorizontal: 10,
    fontFamily: 'Poppins_semibold',
  },
  googleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: 207,
    alignSelf: 'center',
  },
  googleIcon: {
    width: 40,
    height: 40,
    marginBottom: 0,
  },
  googleText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins_semibold',
    marginBottom:20,
  },
  accountLinkContainer: {
    alignItems: 'center',
  },
  accountText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Poppins_semibold',
  },
  signUpLink: {
    color: '#098BEA',
    fontWeight: '500',
    fontFamily: 'Poppins_semibold',
  },
});

export default LoginScreen;