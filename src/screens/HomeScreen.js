import React, {useState, useEffect} from "react";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from "react-native";
import * as Font from 'expo-font';

import Header from "../Components/Header";

const HomeScreen = () => {
    const navigation = useNavigation();
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('EN');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [robots, setRobots] = useState([
        { id: 'ROBOT_1', status: 'OFF' },
        { id: 'ROBOT_2', status: 'ON' },
        { id: 'ROBOT_3', status: 'ON' },
        { id: 'ROBOT_5', status: 'OFF' },
    ])
    
    const navigateToRobotHome = (robotId) =>{
        navigation.navigate('RobotHome', {robotId});
    };
    const handleAddNewRobotPress = () =>{
        navigation.navigate('MainAddRobot', { screen: 'AddRobotMain' });
    };
    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
        console.log('Language selected:', language);
    };
    const handleNotificationChange = (isEnabled) =>{
        setNotificationsEnabled(isEnabled);
    }

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
    
    return(
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#57C3EA" barStyle="dark-content" />

            <Header
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
                notificationsEnabled={notificationsEnabled}
                onNotificationChange={handleNotificationChange}
            />

            <View style={styles.robotGridContainer}>
                <View style={styles.robotGrid}>
                    <View style={styles.robotRow}>
                        <TouchableOpacity 
                            style = {styles.robotItem}
                            onPress={() => navigateToRobotHome('ROBOT_1')}
                        >
                            <View style={styles.robotIconContainer}>
                                <Image 
                                    source={require('../../assets/images/yacht.png')}
                                    style={styles.robotIcon}
                                />
                            </View>
                            <Text style={styles.robotIdText}>ROBOT_1</Text>
                            <View style={styles.statusContainer}>
                                <View style={[styles.statusIndicator, robots[0].status === 'ON' ? styles.statusOn : styles.statusOff]} />
                                <Text style={styles.statusText}>{robots[0].status}</Text>   
                            </View>                           
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style = {styles.robotItem}
                            onPress={() => navigateToRobotHome('ROBOT_3')}
                        >
                            <View style={styles.robotIconContainer}>
                                <Image 
                                    source={require('../../assets/images/yacht.png')}
                                    style={styles.robotIcon}
                                />
                            </View>
                            <Text style={styles.robotIdText}>ROBOT_3</Text>
                            <View style={styles.statusContainer}>
                                <View style={[styles.statusIndicator, robots[2].status === 'ON' ? styles.statusOn : styles.statusOff]} />
                                <Text style={styles.statusText}>{robots[2].status}</Text>    
                            </View>                       
                        </TouchableOpacity>
                    </View>
                    <View style={styles.robotRow}>
                        <TouchableOpacity 
                            style = {styles.robotItem}
                            onPress={() => navigateToRobotHome('ROBOT_2')}
                        >
                            <View style={styles.robotIconContainer}>
                                <Image 
                                    source={require('../../assets/images/yacht.png')}
                                    style={styles.robotIcon}
                                />
                            </View>
                            <Text style={styles.robotIdText}>ROBOT_2</Text>
                            <View style={styles.statusContainer}>
                                <View style={[styles.statusIndicator, robots[1].status === 'ON' ? styles.statusOn : styles.statusOff]} />
                                <Text style={styles.statusText}>{robots[1].status}</Text>    
                            </View>                        
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style = {styles.robotItem}
                            onPress={() => navigateToRobotHome('ROBOT_5')}
                        >
                            <View style={styles.robotIconContainer}>
                                <Image 
                                    source={require('../../assets/images/yacht.png')}
                                    style={styles.robotIcon}
                                />
                            </View>
                            <Text style={styles.robotIdText}>ROBOT_5</Text>
                            <View style={styles.statusContainer}>
                                <View style={[styles.statusIndicator, robots[3].status === 'ON' ? styles.statusOn : styles.statusOff]} />
                                <Text style={styles.statusText}>{robots[3].status}</Text>    
                            </View>                       
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity 
                    style = {styles.addRobotButton}
                    onPress={handleAddNewRobotPress}
                >
                    <Image 
                        source={require('../../assets/images/plus.png')}
                        style={styles.addRobot}
                    />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#57C3EA',
    },
    robotGridContainer:{
        flex: 1,
        backgroundColor: '#F1FFF3',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        top: 100,
        bottom: 0,
    },
    robotGrid:{
        width:'100%',
    },
    robotRow:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    robotItem:{
        width: '48%',
        alignItems: 'center',
        borderRadius: 20,
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    robotIconContainer:{
        width: 115,
        height: 108,
        borderRadius: 15,
        backgroundColor: '#6DB6FE',
        justifyContent: 'center',
        alignItems:'center',
        marginBottom: 5,
    },
    robotIcon:{
        width: 86,
        height: 86,
        resizeMode: 'contain',
        tintColor: 'white'
    },
    robotIdText:{
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginBottom: 5,
        fontFamily: 'Poppins_semibold',
    },
    statusContainer:{
        flexDirection:'row',
        alignItems:'center',
    },
    statusIndicator:{
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 5,
    },
    statusOn:{
        backgroundColor: '#4CD964',
    },
    statusOff:{
        backgroundColor:'#FF3830',
    },
    statusText:{
        fontSize: 12,
        fontWeight: '500',
        color: '#000',
        fontFamily: 'Poppins_semibold',
    },
    addRobotButton:{
        width: 80,
        height: 80,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        backgroundColor: '#DFF7E2',
        justifyContent:'center',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 30,
    },
    addRobot:{
        width: 40,
        height: 40,
    },
});

export default HomeScreen