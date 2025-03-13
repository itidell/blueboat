import React, { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import * as Font from 'expo-font';
import {useNavigation} from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
const Login = ({ navigation }) => {
  // After a delay, navigate to your main app screen
  useEffect(() => {
    const timer = setTimeout(() => {
      // Replace 'MainScreen' with your actual main screen name
      navigation.replace('createaccount');
    }, 3000); // 3 second delay

    return () => clearTimeout(timer);
  }, [navigation]);


};
// Eye Icon Component (for password visibility)
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginButtonPressed, setLoginButtonPressed] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  const handleSignupPress = () => {
    setTimeout(() => {
        navigation.navigate('createaccountscreen');
      }, 150); // Navigate to the login screen // Navigate to the create account screen
  };
  
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins_semibold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
        'NotoSerif_Condensed_Bold' :require('../../assets/fonts/NotoSerif_Condensed-Bold.ttf'),
        'SecularOne-Regular': require('../../assets/fonts/SecularOne-Regular.ttf'),

      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);
  if (!fontsLoaded) return <View style={styles.container}><Text>Loading...</Text></View>;
  
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#57C3EA" barStyle="light-content" />
      
      {/* Header with Logo and title */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {/* Using Image from assets instead of SVG component */}
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logoImage}
          />
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
              value={username}
              onChangeText={setUsername}
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
        <TouchableOpacity style={styles.forgotPasswordContainer}>
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
        <View style={styles.googleContainer}>
          <Image
            source={require('../../assets/Google.png')}
            style={styles.googleIcon}
          />
          <Text style={styles.googleText}>Google</Text>
        </View>

        {/* Account Link */}
        <View style={styles.accountLinkContainer}>
  
  <TouchableOpacity onPress={() => navigation.navigate('createaccount')}>
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
    justifyContent: 'flex-start', // Changed from 'center' to 'flex-start' to align left

  },
  logoContainer: {
    flexDirection: 'row', // Changed to row layout
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
    fontFamily: 'SecularOne-Regular',
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
    fontSize: 16,
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
    width: 207, // Match login button width
    alignSelf: 'center',
  },
  googleIcon: {
    width: 40,
    height: 40,
    marginBottom: 0, // Space between icon and text
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