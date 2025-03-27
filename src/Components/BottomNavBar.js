import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

const BottomNavBar =({activeTab, setActiveTab, navigation}) =>{

    const handleHomePress = () => {
        // Screens directly related to a specific robot
        const robotScreens = [
            'LiveStreaming', 
            'Historic', 
            'Storage', 
            'LocationAndController'
        ];
    
        // Get the current route
        const state = navigation.getState();
        
        // Try to find the last route with a robotId
        const routeWithRobotId = state.routes.findLast(route => 
            route.params?.robotId || 
            (route.state?.routes && route.state.routes.some(nestedRoute => nestedRoute.params?.robotId))
        );
    
        let robotId;
        if (routeWithRobotId) {
            robotId = routeWithRobotId.params?.robotId || 
                      routeWithRobotId.state?.routes.find(r => r.params?.robotId)?.params?.robotId;
        }
    
        // Check if the last route is a robot-related screen
        const lastRobotScreen = state.routes.findLast(route => 
            robotScreens.includes(route.name) || 
            (route.state?.routes && route.state.routes.some(nestedRoute => robotScreens.includes(nestedRoute.name)))
        );
    
        // If we have a robotId or were in a robot-related screen
        if (robotId || (lastRobotScreen && robotId)) {
            setActiveTab('home');
            navigation.navigate('MainHome', { 
                screen: 'RobotHome', 
                params: { robotId } 
            });
        } else {
            // For other screens, navigate to HomeMain
            setActiveTab('home');
            navigation.navigate('MainHome', { screen: 'HomeMain' });
        }
    };
    const handleSearchPress = () => {
        setActiveTab('search');
        navigation.navigate('MainSearch', { screen: 'SearchMain' });
    };
    
    const handleAddNewRobotPress = () => {
        setActiveTab('add');    
        navigation.navigate('MainAddRobot', { screen: 'AddRobotMain' });
    };

    const handleProfilePress = () => {
        setActiveTab('profile');
        navigation.navigate('MainProfile', { screen: 'ProfileMain' });
    };

    return (
        <View style={styles.bottomNavbar}>
            <TouchableOpacity
                style = {[styles.navbarItem, activeTab === 'home' ? styles.activeNavItem : null]}
                onPress={handleHomePress}
            >
                <View style={styles.navbarCenterButton}>
                    <Image
                        source={require('../../assets/images/home.png')}
                        style={styles.navbarIcon}
                    />
                </View>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.navbarItem, activeTab === 'search' ? styles.activeNavItem : null]}
                onPress={handleSearchPress}
            >
                <Image 
                    source={require('../../assets/images/search.png')}
                    style={styles.navbarIcon}
                />
            </TouchableOpacity>
      
            <TouchableOpacity
                style={[styles.navbarItem, activeTab === 'add' ? styles.activeNavItem : null]}
                onPress={handleAddNewRobotPress}
            >
                <Image
                    source={require('../../assets/images/add.png')}
                    style={styles.navbarCenterIcon}
                />
            </TouchableOpacity>
      
            <TouchableOpacity 
                style={[styles.navbarItem, activeTab === 'profile' ? styles.activeNavItem : null]}
                onPress={handleProfilePress}
            >
                <Image
                    source={require('../../assets/images/profile.png')}
                    style={styles.navbarIcon}
                />
            </TouchableOpacity>
        </View>
    );
};
const styles = StyleSheet.create({
    bottomNavbar: {
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
    navbarItem: {
      padding: 8,
    },
    navbarIcon: {
      width: 30,
      height: 30,
      resizeMode: 'contain',
    },
    navbarCenterButton: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    navbarCenterItem:{
        alignItems: 'center',
        justifyContent:'center',
    },
    activeNavItem: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 42,
      height: 42,
      backgroundColor: '#57C3EA',
      borderRadius: 15,
      padding: 10,
      elevation: 2,
    },
    navbarCenterIcon: {
      width: 24,
      height: 24,
      resizeMode: 'contain',
    }
  });

  export default BottomNavBar;