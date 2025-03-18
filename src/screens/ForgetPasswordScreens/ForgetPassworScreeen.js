import React, {useState, useEffect} from "react";
import { Dimensions, StyleSheet, View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, StatusBar } from "react-native";
import * as Font from 'expo-font';
import { useNavigation } from "@react-navigation/native";

const screenWidth = Dimensions.get('window').width;
const ForgetPasswordScreen = () =>{
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [nextButtonPressed, setNextButtonPressed] = useState(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    
    const handleNextPress = () =>{
        if(!email || !email.includes('@')){
            alert('Please enter valid email address');
            return;
        }

        setTimeout(() => {
            navigation.navigate('Verification')
        },150);
    };

    const handleBackToLogin = () => {
        setTimeout(() => {
            navigation.navigate('Login');
        }, 150)
    }
    
    const handleBackToSignup = () => {
        setTimeout(() => {
            navigation.navigate('CreateAccount');
        }, 150)
    }
    
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
      
        return () => {
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
                    <Image
                        source={require('../../../assets/imges/logo.png')}
                        style={styles.logoImage}
                    />
                </View>
            </View>

            <View style={styles.titleContainer}>
                <Text style={styles.ForgetPasswordTitle}>Forgot Password</Text>
            </View>

            <View style={[styles.formContainer, {width: screenWidth}]}>
                <View style={styles.resetContainer}>
                    <Text style={styles.ressetText}>Reset Password?</Text>
                </View>

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
                        />
                    </View>
                </View>

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

                <View style = {styles.backToLoginContainer}>
                    <TouchableOpacity >
                        <Text style={styles.backToLoginText}>
                            Remember your password?{' '}
                            <Text style={styles.loginLink} onPress={handleBackToLogin}>Log In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.backToSignupContainer}>
                    <TouchableOpacity>
                        <Text style={styles.backToSignupText}>
                            Don't have an account?{' '}
                            <Text style={styles.signupLink} onPress={handleBackToSignup}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* Bottom left back button as shown in the reference image */}
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
            >
                <Image
                    source={require('../../../assets/imges/left-chevron.png')} 
                    style={styles.backButtonIcon}
                />
            </TouchableOpacity>
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
    resetContainer:{
        marginTop: 46,
        marginBottom: 30,
        alignItems: 'center',
    },
    ressetText:{
        fontSize: 20,
        fontWeight: '600',
        color: "#333",
        fontFamily: 'Poppins_semibold',
    },
    inputWrapper:{
        marginBottom: -8,
        marginTop: 30,
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
    nextButton:{
        backgroundColor:'#098BEA',
        borderRadius:40,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:'Poppins_semibold',
        width:207,
        height:45,
        alignSelf: 'center',
        marginTop: 60,
        marginBottom: 40,
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
    backToLoginContainer:{
        alignItems:'center',
        marginTop:20,
    },
    backToLoginText:{
        fontSize:14,
        color: '#666',
        fontFamily: 'Poppins_semibold',
    },
    loginLink:{
        color: '#098BEA',
        fontWeight: '500',
        fontFamily: 'Poppins_semibold',
    },
    backButton: {
        position: 'absolute',
        bottom: 20,
        left: 15,
        padding: 10,
        zIndex: 10,
    },
    backToSignupContainer:{
        alignItems:'center',
        marginTop:8,
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
    backButtonIcon: {
        width: 30,
        height: 30,
        tintColor: '#098BEA',
    },
});

export default ForgetPasswordScreen;