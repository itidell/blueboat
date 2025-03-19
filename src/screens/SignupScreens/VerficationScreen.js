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
import Svg, {Path, G} from 'react-native-svg';

const ErrorIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <G id="SVGRepo_iconCarrier">
      <Path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#FF3830" strokeWidth="2" />
      <Path d="M12 8L12 13" stroke="#FF3830" strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 16V15.9888" stroke="#FF3830" strokeWidth="2" strokeLinecap="round" />
    </G>
  </Svg>
)
const VerificationScreen = () => {
  const navigation = useNavigation();
  const [code, setCode] = useState(['', '', '', '', '']);
  const [verifyButtonPressed, setVerifyButtonPressed] = useState(false);
  const [sendAgainButtonPressed, setSendAgainButtonPressed] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const inputRefs = useRef([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false)

  const handleVerificationPress = () => {
    if (code.every(digit => digit !== '')) {
      console.log('Verifying code:', code.join(''));
      setErrorMessage('');
      setTimeout(() => {
        navigation.navigate('LoadingState');
      }, 150);
    } else {
      setErrorMessage('Please enter all digits of the verification code')
    }
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

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false)
      }
    );
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    }
  }, []);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    const cleanedText = text.replace(/[^0-9]/g, '');
    newCode[index] = cleanedText;
    setCode(newCode);
    if (cleanedText && index < 4) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSendAgain = () => {
    console.log('Resending verification code');
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
      {errorMessage ?(
        <View style={styles.errorContainer}>
          <View style ={styles.errorIconTextContainer}>
            <ErrorIcon style={styles.errorIcon}/> 
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        </View>
      ) : null}

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
      {!isKeyboardVisible &&(
        <TouchableOpacity 
          style = {styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
            <Image
              source = {require('../../../assets/imges/left-chevron.png')}
              style={styles.backButtonIcon}
            />
        </TouchableOpacity>
      )}
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
    width: 60,
    height: 60,
    margin: 8,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    padding: 0,
    textAlignVertical: 'center',
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
  errorContainer:{
    marginTop: 24,
    paddingHorizontal: 20,
    alignItems:'center',
    top: 50,
  },
  errorIconTextContainer:{
    flexDirection : 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width:'auto',
  },
  errorText:{
    color:'#FF3830',
    fontFamily:'Poppins_semibold',
    fontSize: 14,
    marginLeft: 8,
    textAlign:'left', 
  },
  errorIcon:{
    marginTop: 2,
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
  backButton:{
    position: 'absolute',
    bottom:20,
    left: 15, 
    padding: 10,
    zIndex: 10,
  },
  backButtonIcon :{
    width: 30,
    height: 30,
    tintColor:'#FFF'
  }
});

export default VerificationScreen;