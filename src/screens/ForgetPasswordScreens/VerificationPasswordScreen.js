import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  StatusBar,
  Keyboard
} from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';

const ForgetPasswordVerificationScreen = () => {
  const navigation = useNavigation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifyButtonPressed, setVerifyButtonPressed] = useState(false);
  const [sendAgainButtonPressed, setSendAgainButtonPressed] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const inputRefs = useRef([]);

  const handleVerificationPress = () => {
    setTimeout(() => {
        navigation.navigate('LoadingState');
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
  }, []);

  const handleCodeChange = (text, index) => {
    // Create a new array to avoid direct state mutation
    const newCode = [...code];
    
    // Only accept numbers
    const cleanedText = text.replace(/[^0-9]/g, '');
    newCode[index] = cleanedText;
    
    // Update the state
    setCode(newCode);
    
    // Auto advance to next input if this one is filled
    if (cleanedText && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (event, index) => {
    // If backspace is pressed and current field is empty, go to previous field
    if (event.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    // Check if all fields are filled
    if (code.every(digit => digit !== '')) {
      // Process verification logic here
      console.log('Verifying code:', code.join(''));
      
      // Navigate to next screen or show success state
      // navigation.navigate('NextScreen');
    } else {
      alert('Please enter all digits of the verification code');
    }
  };

  const handleSendAgain = () => {
    // Logic to resend verification code
    console.log('Resending verification code');
    
    // You might want to add a cooldown period here
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#57C3EA" barStyle="dark-content" />
      
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/imges/logo.png')} 
            style={styles.logoImage}
          />
        </View>
      </View>

      {/* Message Text */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          We have sent you a verification code by email
        </Text>
      </View>

      {/* Enter Code Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.codeTitle}>Enter Code</Text>
      </View>

      {/* Verification Code Input */}
      <View style={styles.codeContainer}>
        {[0, 1, 2, 3,4].map((index) => (
          <View key={index} style={styles.codeInputWrapper}>
            <TextInput
              ref={ref => inputRefs.current[index] = ref}
              style={styles.codeInput}
              value={code[index]}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(event) => handleKeyPress(event, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          </View>
        ))}
      </View>

      {/* Verify Button */}
      <TouchableOpacity 
        style={[
          styles.verifyButton, 
          verifyButtonPressed && styles.verifyButtonPressed
        ]}
        onPressIn={() => setVerifyButtonPressed(true)}
        onPressOut={() => setVerifyButtonPressed(false)}
        onPress={handleVerificationPress}
      >
        <Text style={styles.verifyButtonText} >Verify</Text>
      </TouchableOpacity>

      {/* Send Again Button */}
      <TouchableOpacity 
        style={[
          styles.sendAgainButton, 
          sendAgainButtonPressed && styles.sendAgainButtonPressed
        ]}
        onPressIn={() => setSendAgainButtonPressed(true)}
        onPressOut={() => setSendAgainButtonPressed(false)}
        onPress={handleSendAgain}
      >
        <Text style={styles.sendAgainButtonText}>Send Again</Text>
      </TouchableOpacity>
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
  messageContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
    top: 50,
  },
  messageText: {
    fontSize: 16,
    color: '#003366',
    textAlign: 'center',
    fontFamily: 'Poppins_semibold',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 40,
    top: 50,
  },
  codeTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#003366',
    fontFamily: 'Poppins_semibold',
  },
  codeContainer: {
    top: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  codeInputWrapper: {
    margin: 8,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeInput: {
    width: 40,
    height: 40,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  verifyButton: {
    top: 50,
    backgroundColor: '#098BEA',
    borderRadius: 40,
    width: 207,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    fontFamily: 'Poppins_semibold',
    margin: 50,
    marginBottom: 20,
  },
  verifyButtonPressed: {
    opacity: 0.8,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Poppins_semibold',
    width: '100%',
    textAlign: 'center',
  },
  sendAgainButton: {
    top: 50,
    backgroundColor: "#cce1f5",
    width: 207,
    height:45,
    paddingVertical: 6,
    paddingHorizontal: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  sendAgainButtonPressed: {
    opacity: 0.8,
  },
  sendAgainButtonText: {
    color: '#098BEA',
    fontSize: 20,
    fontFamily: 'Poppins_semibold',
    flexDirection: 'row', 
    width: '100%',
    textAlign: 'center',
  },
});

export default ForgetPasswordVerificationScreen;