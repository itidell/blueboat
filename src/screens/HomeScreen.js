import React, {useState, useEffect, useCallback} from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Alert, StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar, ActivityIndicator } from "react-native";
import * as Font from 'expo-font';

import Header from "../Components/Header";
import { useRobot } from "../api/robotContext";

const HomeScreen = () => {
    const navigation = useNavigation();
    const {robots, loading, error: robotError, loadRobots, clearError} = useRobot();
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('EN');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    
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

    // Load fonts when component mounts
    useEffect(() => {
        const loadFonts = async () => {
            await Font.loadAsync({
              'Poppins_semibold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
            });
            setFontsLoaded(true);
        };
        loadFonts();
    }, []);

    // Load robots when component mounts
    useEffect(() => {
        loadRobots();
    }, []);

    // Refresh robots when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            console.log("HomeScreen in focus - refreshing robots");
            loadRobots();
            return () => {};
        }, [])
    );

    if (!fontsLoaded) return <View style={styles.container}><Text>Loading...</Text></View>;
    
    const renderRobotGrid = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#57C3EA" />
                    <Text style={styles.loadingText}>Loading robots...</Text>
                </View>
            );
        }
        
        if (robots.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No robots added yet</Text>
                    <Text style={styles.emptySubText}>Tap the + button below to add your first robot</Text>
                </View>
            );
        }
        
        // Create rows of robots (2 per row)
        const rows = [];
        for (let i = 0; i < Math.ceil(robots.length / 2); i++) {
            const rowRobots = robots.slice(i * 2, i * 2 + 2);
            rows.push(
                <View key={`row-${i}`} style={styles.robotRow}>
                    {rowRobots.map((robot, index) => (
                        <TouchableOpacity 
                            key={robot.robot_id}
                            style={styles.robotItem}
                            onPress={() => navigateToRobotHome(robot.robot_id)}
                        >
                            <View style={styles.robotIconContainer}>
                                <Image 
                                    source={require('../../assets/images/yacht.png')}
                                    style={styles.robotIcon}
                                />
                            </View>
                            <Text style={styles.robotIdText}>{robot.robot_id}</Text>
                            <View style={styles.statusContainer}>
                                <View style={[
                                    styles.statusIndicator, 
                                    (robot.status === 'ON' || robot.status === 'active') ? styles.statusOn : styles.statusOff
                                ]} />
                                <Text style={styles.statusText}>
                                    {(robot.status === 'ON' || robot.status === 'active') ? 'ON' : 'OFF'}
                                </Text>   
                            </View>                           
                        </TouchableOpacity>
                    ))}
                    
                    {/* If we have an odd number of robots, add an empty placeholder */}
                    {rowRobots.length === 1 && <View style={styles.robotItem} />}
                </View>
            );
        }
        
        return rows;
    };

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
                    {renderRobotGrid()}
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
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Poppins_semibold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        fontFamily: 'Poppins_semibold',
    },
    emptySubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
        fontFamily: 'Poppins_semibold',
    },
});

export default HomeScreen;