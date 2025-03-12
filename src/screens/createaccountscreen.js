import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native'; // Correct import
import { Svg, Path } from 'react-native-svg';

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

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Poppins_semibold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
          'NotoSerif_Condensed_Bold': require('../../assets/fonts/NotoSerif_Condensed-Bold.ttf'),
          'SecularOne-Regular': require('../../assets/fonts/SecularOne-Regular.ttf'),
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

    Dimensions.addEventListener('change', updateDimensions);

    return () => {
      Dimensions.removeEventListener('change', updateDimensions);
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
            source={require('../../assets/logo.png')} 
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

        {/* Terms of Use */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By registering, you agree to the{' '}
            <Text style={styles.termsLink}>Terms of Use</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity 
          style={[
            styles.signUpButton, 
            signUpButtonPressed && styles.signUpButtonPressed
          ]}
          onPressIn={() => setSignUpButtonPressed(true)}
          onPressOut={() => setSignUpButtonPressed(false)}
          onPress={handleSignUp}
        >
          <Text 
            style={[
              styles.signUpButtonText, 
              signUpButtonPressed && styles.signUpButtonTextPressed
            ]}
          >
            Sign Up
          </Text>
        </TouchableOpacity>

        {/* Account Link */}
        <View style={styles.accountLinkContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.accountText}>
              Already have an account?{' '}
              <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Your styles here...
});

export default CreateAccountScreen;