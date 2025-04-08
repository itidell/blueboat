import React,{useState, useEffect} from "react";
import { useNavigation} from "@react-navigation/native";
import Svg, {Path} from 'react-native-svg';
import { Dimensions, StyleSheet, View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, Keyboard, StatusBar } from "react-native";
import * as Font from 'expo-font';
import { ScrollView } from "react-native-gesture-handler";

const screenWidth = Dimensions.get('window').width;
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

const NewPasswordScreen = () =>{
    const navigation = useNavigation();
    const [password, setPassword] = useState('');
    const [confirmPassword,setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [changePaswwordButtonPressed, setChangePasswordButtonPressed] = useState(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
    const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

    const handleChangePasswordPress = () => {
        setTimeout(() => {
            navigation.navigate('SuccessOperation');
        }, 150);
    };
    
    useEffect(() => {
        const loadFonts = async() =>{
            try{
                await Font.loadAsync({
                    'Poppins_semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
                });
                setFontsLoaded(true);
            }catch(error){
                console.error('Error Loading fonts', error);
            }
        };
        loadFonts();

        const updateDimensions = ({window}) => {setScreenWidth(window.width);};
        const subscription = Dimensions.addEventListener("change",updateDimensions);
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );
        
        return() =>{
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
            subscription.remove();
        };
    },[]);

    if (!fontsLoaded){
        return(
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>   
        );
    }

    return(
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#57C3EA" barStyle="dark-content" />

            <View style={styles.header}>
                <View style={styles.logocontainer}>
                    <Image
                        source={require('../../../assets/images/logo.png')}
                        style={styles.logoImage}
                    />
                </View>
            </View>

            <View style={styles.titleContainer}>
                <Text style={styles.newPasswordTitle}>New Password</Text>
            </View>

            <ScrollView style = {[styles.formContainer, {width: screenWidth}]} showsVshowsVerticalScrollIndicator={false}>
                <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>New Password</Text>
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
                <TouchableOpacity
                    style={[
                        styles.changePasswordButton,
                        changePaswwordButtonPressed && styles.changePasswordButtonPressed
                    ]}
                    onPressIn={() => setConfirmPassword(true)}
                    onPressOut={() => setChangePasswordButtonPressed(false)}
                    onPress={handleChangePasswordPress}
                    activeOpacity={0.8}
                >
                    <Text 
                        style={[
                            styles.changePasswordText,
                            changePaswwordButtonPressed && styles.changePasswordTextPressed
                        ]}
                    >
                        Change
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )

}
const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#57C3EA',
    },
    header: {
        backgroundColor:'#57C3EA',
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'flex-start',
    },
    logoContainer:{
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoImage:{
        width: 80,
        height: 80,
        resizeMode: 'contain',
        margin: 0,
    },
    titleContainer:{
        alignItems: 'center',
        paddingVertical:15,
        backgroundColor:'#57C3EA',
        fontFamily:'Poppins_semibold',
    },
    newPasswordTitle :{
        marginTop: 0,
        fontSize: 30,
        fontWeight: '700',
        color: '#000000FF',
        fontfamily:'Poppins_semibold',
    },
    formContainer:{
        flex: 1,
        backgroundColor:'white',
        paddingTop: 120,
        padding: 20,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        width: screenWidth,
        position:'absolute',
        top: 200,
        bottom: 0,
        fontFamily: 'Poppins_semibold',
    },
    inputWrapper:{
        marginBottom: -8,
        marginTop: 30,
        fontfamily: 'Poppins_semibold',
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
    inputBox: {
        backgroundColor: '#f5f5f5',
        borderRadius: 40,
        flexDirection: 'row',
        alignItems: 'center',
        height: 45,
        borderWidth: 0.5,
        borderColor: "#e0e0e0",
        fontFamily: 'Poppins_semibold',
    },
    inputField:{
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
        position: 'absolute',
        right: 13,
        padding: 4,
    },
    changePasswordButton:{
        backgroundColor:'#0988EA',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:'Poppins_semibold',
        width:207,
        height:45,
        alignSelf: 'center',
        marginTop: 60,
        marginBottom: 40,
    },
    changePasswordButtonPressed:{
        backgroundColor:"rgba(9, 139, 234, 0.8)",
    },
    changePasswordText:{
        color:'white',
        fontSize: 20,
        fontWeight: '600',
        fontFamily: 'Poppins_semibold',
    },
    changePasswordTextPressed:{
        color: 'white',
        fontFamily: 'Poppins_semibold',
    },
});

export default NewPasswordScreen;