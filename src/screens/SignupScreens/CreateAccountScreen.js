import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native'; // Correct import
import { Svg, Path } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;                                       
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

const CreateAccountScreen = () => {
  const navigation = useNavigation(); // Correctly placed here
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [signUpButtonPressed, setSignUpButtonPressed] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  const handleSigninPress = () => {
    setTimeout(() => {
        navigation.navigate('Login');
      }, 150);
  };
  const handleSignupPress = () => {
    setTimeout(() => {
        navigation.navigate('Verification');
      }, 150);
  };
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Poppins_semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts', error);
      }
    };
    loadFonts();

    const updateDimensions = ({ window }) => {
      setScreenWidth(window.width);
    };

    const subscription = Dimensions.addEventListener("change", updateDimensions);

    return () => {
      subscription.remove(); // Proper cleanup
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // Proceed with sign-up logic
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#57C3EA" barStyle="light-content" />
      
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/imges/logo.png')} 
            style={styles.logoImage}
          />
        </View>
      </View>

      {/* Create Account Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.createAccountTitle}>Create Account</Text>
      </View>

      {/* Form Container */}
      <ScrollView style={[styles.formContainer, { width: screenWidth }]} showsVerticalScrollIndicator={false}>
        {/* Full Name Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.inputField}
              value={fullName}
              onChangeText={setFullName}
              placeholder="User name"
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.inputField}
              value={email}
              onChangeText={setEmail}
              placeholder="example@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Mobile Number Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.inputField}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="+123 456 789"
              keyboardType="phone-pad"
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
              placeholder="••••••••"
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

        {/* Confirm Password Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={[styles.inputField, styles.passwordInput]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry={!confirmPasswordVisible}
            />
            <TouchableOpacity 
              style={styles.eyeIconContainer}
              onPress={toggleConfirmPasswordVisibility}
            >
              <EyeIcon visible={confirmPasswordVisible} />
            </TouchableOpacity>
          </View>
        </View>
       

        {/* Sign Up Button */}
        <TouchableOpacity 
          style={[
            styles.signUpButton, 
            signUpButtonPressed && styles.signUpButtonPressed
          ]}
          onPressIn={() => setSignUpButtonPressed(true)}
          onPressOut={() => setSignUpButtonPressed(false)}
          onPress={handleSignupPress}
        >
          <Text 
            style={[
              styles.signUpButtonText, 
              signUpButtonPressed && styles.signUpButtonTextPressed
            ]} onPress={handleSignupPress}
          >
            Sign Up
          </Text>
        </TouchableOpacity>

        {/* Account Link */}
        <View style={styles.accountLinkContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          
            <Text style={styles.accountText}>
              Already have an account?{' '}
              <Text style={styles.loginLink} onPress={handleSigninPress}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingVertical: 15,
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
    fontFamily: 'SecularOne-Regular',
  },
  createAccountTitle: {
    marginTop:0,
    fontSize: 30,
    fontWeight: '700',
    color: '#000000FF',
    fontFamily:'SecularOne-Regular',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingLeft: 20,
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
  passwordInput:{
    paddingRight: 50,
    fontFamily: 'Poppins_semibold',
  },
  eyeIconContainer:{
    position:'absolute',
    right: 12,
    padding: 4,
  },
  signUpButton: {
    backgroundColor: '#098BEA',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Poppins_semibold',
    width: 207,
    height: 45,
    marginTop:20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  signUpButtonPressed: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#098BEA',
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_semibold',
  },
  signUpButtonTextPressed: {
    color: '#098BEA',
    fontFamily: 'Poppins_semibold',
  },
  accountLinkContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  accountText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins_semibold',
  },
  loginLink: {
    color: '#098BEA',
    fontWeight: '500',
    fontFamily: 'Poppins_semibold',
  },
  termsContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 17,
    paddingHorizontal: 20,
  },

  termsText: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'Poppins_semibold',
  },
  termsLink: {
    color: '#333',
    fontWeight: '600',
    fontFamily: 'Poppins_semibold',
  }
});

export default CreateAccountScreen;