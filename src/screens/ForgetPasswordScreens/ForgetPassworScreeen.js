import React, {useState, useEffect} from "react";
import { Dimensions, StyleSheet, View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, StatusBar, Keyboard } from "react-native";
import * as Font from 'expo-font';
import { useNavigation } from "@react-navigation/native";
import Svg, {Path, G} from 'react-native-svg';
import { ScrollView } from "react-native-gesture-handler";
import { authService } from "../../api/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
const screenWidth = Dimensions.get('window').width;

const ErrorIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <G id="SVGRepo_iconCarrier">
      <Path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#FF3830" strokeWidth="2" />
      <Path d="M12 8L12 13" stroke="#FF3830" strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 16V15.9888" stroke="#FF3830" strokeWidth="2" strokeLinecap="round" />
    </G>
  </Svg>
)

const ForgetPasswordScreen = () =>{
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [nextButtonPressed, setNextButtonPressed] = useState(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [errorMessage, setErrorMessage] = useState('');
    const [isKeyboardVisible, setKeyboardVisible] = useState(false)
    const [isLoading, setIsLoading]= useState(false)
    const handleNextPress = async () =>{
        setErrorMessage('');
        if(!email || !email.includes('@')){
            setErrorMessage('Please enter valid email address');
            return;
        }
        try {
            setIsLoading(true)
            await authService.forgetPassword(email);
            await AsyncStorage.setItem('temp_reset_email', email);
            setTimeout(() => {
                navigation.navigate('VerificationPassword')
            },150);
        }catch(error){
            setErrorMessage(error?.message || 'Failed to process request. Please try again');
        }finally{
            setIsLoading(false);
        }
    };
    const handleBackToSignup = () => {
        setTimeout(() => {
            navigation.navigate('CreateAccount');
        }, 150)
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

        const updateDimensions = ({window}) =>{setScreenWidth(window.width);};
        const subscription = Dimensions.addEventListener("change", updateDimensions);

        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () =>{
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
            subscription.remove(); // Proper cleanup
        };
    },[]);
    
    if (!fontsLoaded) {
        return (
          <View style={styles.container}>
            <Text>Loading...</Text>
          </View>
        );
    }

    return(
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#57C3EA" barStyle="light-content"/>
            
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

            <View style={styles.titleContainer}>
                <Text style={styles.ForgetPasswordTitle}>Set Password</Text>
            </View>

            <ScrollView style={[styles.formContainer, {width: screenWidth}]}>
                <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.inputField}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="example@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                    </View>
                </View>

                {errorMessage ?(
                    <View style={styles.errorContainer}>
                        <View style= {styles.errorIconTextContainer}>
                            <ErrorIcon style= {styles.errorIcon}/>
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    </View>
                ) : null}

                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        nextButtonPressed && styles.nextButtonPressed
                    ]}
                    onPressIn={() => setNextButtonPressed(true)}
                    onPressOut={() => setNextButtonPressed(false)}
                    onPress={handleNextPress}
                    activeOpacity={0.8}
                >
                    <Text 
                        style={[
                            styles.nextButtonText,
                            nextButtonPressed && styles.nextButtonTextPressed
                        ]}
                    >
                        Next
                    </Text>
                </TouchableOpacity>

                <View style={styles.backToSignupContainer}>
                    <TouchableOpacity>
                        <Text style={styles.backToSignupText}>
                            Don't have an account?{' '}
                            <Text style={styles.signupLink} onPress={handleBackToSignup}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
        
            </ScrollView>

            {!isKeyboardVisible &&(
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Image
                        source={require('../../../assets/images/left-chevron.png')} 
                        style={styles.backButtonIcon}
                    />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor:'#57C3EA',
    },
    header:{
        backgroundColor:'#57C3EA',
        paddingVertical: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    logoContainer:{
        flexDirection:'row',
        alignItems:'center',
    },
    logoImage:{
        width:80,
        height:80,
        resizeMode: 'contain',
        margin: 0,
    },
    titleContainer:{
        alignItems: 'center',
        paddingVertical:15,
        backgroundColor: '#57C3EA',
    },
    ForgetPasswordTitle:{
        marginTop:0,
        fontSize: 30,
        fontWeight: '700',
        color: '#000000FF',
        fontFamily: 'Poppins_semibold',
    },
    formContainer:{
        flex: 1,
        backgroundColor:'white',
        padding: 20,
        borderTopLeftRadius: 60,
        borderTopRightRadius:60,
        width: screenWidth,
        position: "absolute",
        top: 200,
        bottom: 0,
        fontFamily: 'Poppins_semibold',
    },
    inputWrapper:{
        marginBottom: -46,
        marginTop: 120,
        fontFamily:'Poppins_semibold',
    },
    inputLabel:{
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        fontWeight: '500',
        paddingLeft: 15,
        marginLeft: 6,
        fontFamily: 'Poppins_semibold',
    },
    inputBox:{
        backgroundColor: '#f5f5f5',
        borderRadius: 40,
        flexDirection: 'row',
        alignItems: 'center',
        height:45,
        borderWidth: 0.5,
        borderColor: "#e0e0e0",
        fontFamily:"Poppins_semibold",
    },
    inputField:{
        flex: 1,
        fontSize: 13,
        paddingVertical: 12,
        paddingHorizontal:20,
        textAlign: 'left',
        fontFamily: 'Poppins_semibold',
    },
    errorContainer:{
        marginTop: 0,
        marginBottom: 25,
        paddingHorizontal: 10,
        alignItems:'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
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
        fontSize: 12,
        marginLeft: 8,
        textAlign:'left', 
      },
      errorIcon:{
        marginTop: 2,
        height:20,
        width:20,
      },
    nextButton:{
        backgroundColor:'#098BEA',
        borderRadius:40,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:'Poppins_semibold',
        width:207,
        height:45,
        alignSelf: 'center',
        marginTop: 100,
        marginBottom: 150,
    },
    nextButtonPressed:{
        backgroundColor:"rgba(9, 139, 234, 0.8)",
    },
    nextButtonText:{
        color:'white',
        fontSize: 20,
        fontWeight: '600',
        fontFamily: 'Poppins_semibold',
    },
    nextButtonTextPressed:{
        color:'white',
        fontFamily:'Poppins_semibold',
    },
    backToSignupContainer:{
        alignItems:'center',
        marginTop:35,
    },
    backToSignupText:{
        fontSize:14,
        color: '#666',
        fontFamily: 'Poppins_semibold',
    },
    signupLink:{
        color: '#098BEA',
        fontWeight: '500',
        fontFamily: 'Poppins_semibold',
    },
    backButton: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        padding: 10,
        zIndex: 10,
    },
    backButtonIcon: {
        width: 50,
        height: 50,
    },
});

export default ForgetPasswordScreen;