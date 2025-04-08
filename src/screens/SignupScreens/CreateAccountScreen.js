import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native'; 
import { Svg, Path } from 'react-native-svg';
import { Dimensions, StyleSheet, View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, StatusBar, Alert, ScrollView } from 'react-native';
import * as Font from 'expo-font';
import { useAuth } from '../../api/authContext';

const screenWidth = Dimensions.get('window').width;             
const CreateAccountScreen = () => {
  const navigation = useNavigation(); 
  const{registrationData,updateRegistrationData} = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');;
  const [signUpButtonPressed, setSignUpButtonPressed] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);


  const validateInputs = () =>{
    if(!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)){
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(mobileNumber)){
      Alert.alert('Error', 'Please enter a valid mobile number');
      return false;
    }
    return true;
  };

  const handleSigninPress = () => {
    setTimeout(() => {
        navigation.navigate('Login');
      }, 150);
  };
  const handleSignupPress = () => {
    if (validateInputs()) {
      updateRegistrationData({
        full_name: fullName,
        email: email,
        mobile_number: mobileNumber
      });
    }
    setTimeout(() => {
        navigation.navigate('PasswordSetting');
      }, 150);
  };
  const handleBackHome = () => {
    setTimeout(() => {
        navigation.navigate('Welcome');
    }, 150)
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
      subscription.remove(); 
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#57C3EA" barStyle="light-content" />
      
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <TouchableOpacity onPress={handleBackHome}>
            <Image 
              source={require('../../../assets/images/logo.png')} 
              style={styles.logoImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Account Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.createAccountTitle}>Create Account</Text>
      </View>

      {/* Form Container */}
      <ScrollView style={styles.formContainer}>
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
            Next
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
    fontFamily: 'Poppins_semibold',
  },
  createAccountTitle: {
    marginTop:0,
    fontSize: 30,
    fontWeight: '700',
    color: '#000000FF',
    fontFamily:'Poppins_semibold',
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
    marginTop: 40,
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
  signUpButton: {
    backgroundColor: '#098BEA',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Poppins_semibold',
    width: 207,
    height: 45,
    marginTop:50,
    alignSelf: 'center',
    marginBottom: 90,
  },
  signUpButtonPressed: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#098BEA',
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins_semibold',
  },
  signUpButtonTextPressed: {
    color: '#098BEA',
    fontFamily: 'Poppins_semibold',
  },
  accountLinkContainer: {
    alignItems: 'center',
  },
  accountText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Poppins_semibold',
  },
  loginLink: {
    color: '#098BEA',
    fontWeight: '500',
    fontFamily: 'Poppins_semibold',
  },
});

export default CreateAccountScreen;