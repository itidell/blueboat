import React, {useState, useEffect} from "react";
import { Dimensions, StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from "react-native";
import * as Font from 'expo-font';
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
    const navigation = useNavigation();
    const [fontsLoaded, setFontsLoaded] = useState(false);

    const [robots, setRobots] = useState([
        { id: 'ROBOT_1', status: 'OFF' },
        { id: 'ROBOT_2', status: 'ON' },
        { id: 'ROBOT_3', status: 'ON' },
        { id: 'ROBOT_5', status: 'OFF' },
    ])
    useEffect(() => {
        const loadFonts = async () => {
            await Font.loadAsync({
              'Poppins_semibold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
            });
            setFontsLoaded(true);
        };
        loadFonts();
    }, []);

    const navigateToRobotHome = (robotId) =>{
        navigation.navigate('RobotHomeScreen', {robotId});
    };

    const addNewRobot = () =>{
        //navigation.navigate('')
    };

    if (!fontsLoaded) return <View style={styles.container}><Text>Loading...</Text></View>;

    return(
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#57C3EA" barStyle="dark-content" />

            <View style ={styles.header}>
                <View style={styles.welcomeContainer}>
                    <Image 
                        source={require('../../assets/imges/Logoo.png')}
                        style={styles.logoImage}
                    />
                    <View>
                        <Text style={styles.welcomeText}>Hi, Welcome</Text>
                        <Text style={styles.userNameText}>user name</Text>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.languageButton}>
                        <Image
                            source={require('../../assets/imges/language.png')}
                            style={styles.iconSmall}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Image 
                            source={require('../../assets/imges/bell.png')}
                            style={styles.iconSmall}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.robotGridContainer}>
                <View style={styles.robotGrid}>
                    <View style={styles.robotRow}>
                        <TouchableOpacity 
                            style = {styles.robotItem}
                            onPress={() => navigateToRobotHome('ROBOT_1')}
                        >
                            <View style={styles.robotIconContainer}>
                                <Image 
                                    source={require('../../assets/imges/yacht.png')}
                                    style={styles.robotIcon}
                                />
                            </View>
                            <Text style={styles.robotIdText}>ROBOT_1</Text>
                            <View style={styles.statusContainer}>
                                {robots[0].status === 'ON' ? (
                                    <Image 
                                        source={require('../../assets/imges/switch-on.png')}
                                        style={styles.iconSmall}
                                    />
                                ) : (
                                    <Image 
                                        source={require('../../assets/imges/switch-off.png')}
                                        style={styles.iconSmall}
                                    />
                                )}
                                <Text style={styles.statusText}>{robots[0].status}</Text>    
                            </View>                           
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style = {styles.robotItem}
                            onPress={() => navigateToRobotHome('ROBOT_3')}
                        >
                            <View style={styles.robotIconContainer}>
                                <Image 
                                    source={require('../../assets/imges/yacht.png')}
                                    style={styles.robotIcon}
                                />
                            </View>
                            <Text style={styles.robotIdText}>ROBOT_3</Text>
                            <View style={styles.statusContainer}>
                                {robots[2].status === 'ON' ? (
                                    <Image 
                                        source={require('../../assets/imges/switch-on.png')}
                                        style={styles.iconSmall}
                                    />
                                ) : (
                                    <Image 
                                        source={require('../../assets/imges/switch-off.png')}
                                        style={styles.iconSmall}
                                    />
                                )}
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
                                    source={require('../../assets/imges/yacht.png')}
                                    style={styles.robotIcon}
                                />
                            </View>
                            <Text style={styles.robotIdText}>ROBOT_2</Text>
                            <View style={styles.statusContainer}>
                                {robots[1].status === 'ON' ? (
                                    <Image 
                                        source={require('../../assets/imges/switch-on.png')}
                                        style={styles.iconSmall}
                                    />
                                ) : (
                                    <Image 
                                        source={require('../../assets/imges/switch-off.png')}
                                        style={styles.iconSmall}
                                    />
                                )}
                                <Text style={styles.statusText}>{robots[1].status}</Text>    
                            </View>                        
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style = {styles.robotItem}
                            onPress={() => navigateToRobotHome('ROBOT_5')}
                        >
                            <View style={styles.robotIconContainer}>
                                <Image 
                                    source={require('../../assets/imges/yacht.png')}
                                    style={styles.robotIcon}
                                />
                            </View>
                            <Text style={styles.robotIdText}>ROBOT_5</Text>
                            <View style={styles.statusContainer}>
                                {robots[3].status === 'ON' ? (
                                    <Image 
                                        source={require('../../assets/imges/switch-on.png')}
                                        style={styles.iconSmall}
                                    />
                                ) : (
                                    <Image 
                                        source={require('../../assets/imges/switch-off.png')}
                                        style={styles.iconSmall}
                                    />
                                )}
                                <Text style={styles.statusText}>{robots[3].status}</Text>    
                            </View>                       
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity 
                    style = {styles.addRobotButton}
                    onPress={addNewRobot}
                >
                    <Image 
                        source={require('../../assets/imges/plus.png')}
                        style={styles.addRobot}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.bottonNavbar}>
                <TouchableOpacity style={styles.navbarItem}>
                    <View style={styles.navbarCenterButton}>
                        <Image
                            source={require('../../assets/imges/home.png')}
                            style={styles.navbarIcon}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')} style={styles.navbarItem } >
                    <Image 
                        source={require('../../assets/imges/search.png')}
                        style={styles.navbarIcon}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navbarCenterItem} onPress={addNewRobot}>
                    <Image
                        source={require('../../assets/imges/add.png')}
                        style={styles.navbarCenterIcon}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navbarItem} onPress={() => navigation.navigate('ProfileScreen')}>
                    <Image
                        source={require('../../assets/imges/profile.png')}
                        style={styles.navbarIcon}
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
        fontFamily: 'Poppins_semibold',
    },
    header:{
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 5,
        fontFamily: 'Poppins_semibold',
    },
    welcomeContainer:{
        flexDirection:'row',
        alignItems: 'center',
        fontFamily: 'Poppins_semibold',
    },
    logoImage:{
        width: 80,
        height: 80,
        resizeMode: 'contain',
        marginRight: 8,
    },
    welcomeText:{
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        fontFamily: 'Poppins_semibold',
    },
    userNameText:{
        fontSize: 12,
        color: '#333',
        fontFamily: 'Poppins_semibold',
    },
    headerRight:{
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageButton:{
        marginRight: 15,
    },
    notificationButton:{
        marginRight: 8,
    },
    iconSmall:{
        width: 30,
        height: 30,
        resizeMode: 'contain',
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
        width: '40%',
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
        //borderWidth: 1,
        //borderColor:'#57C3EA',
    },
    addRobot:{
        width: 40,
        height: 40,
    },
    bottonNavbar:{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#DFF7E2',
        borderTopLeftRadius: 65,
        borderTopRightRadius: 65,
        paddingVertical: 10,
        paddingHorizontal: 25,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navbarItem:{
        padding: 0,
    },
    navbarIcon:{
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    navbarCenterItem:{
        alignItems:'center',
        justifyContent:'center',
    },
    navbarCenterButton:{
        width: 42,
        height: 42,
        borderRadius: 15,
        backgroundColor: '#57C3EA',
        justifyContent: 'center',
        alignItems:'center',
        elevation:2,
    },
    navbarCenterIcon:{
        width:24,
        height: 24,
        resizeMode: 'contain',
    }
});

export default HomeScreen