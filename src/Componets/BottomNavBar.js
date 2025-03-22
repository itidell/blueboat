import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import { useRoute } from "@react-navigation/native";

const BottomNavBar =({activeTab, setActiveTab, navigation}) =>{

    const route = useRoute();
    const handleHomePress = () => {
        setActiveTab('home');
        navigation.navigate('MainHome');;
    };
    const handleSearchPress = () => {
        setActiveTab('search');
        navigation.navigate('MainSearch');
    };
    const handleAddNewRobotPress = () => {
        setActiveTab('add');    
        navigation.navigate('MainAddRobot');
    };

    const handleProfilePress = () => {
        setActiveTab('profile');
        navigation.navigate('MainProfile');

    };

    return (
        <View style={styles.bottomNavbar}>
            <TouchableOpacity
                style = {[styles.navbarItem, activeTab === 'home' ? styles.activeNavItem : null]}
                onPress={handleHomePress}
            >
                <View style={styles.navbarCenterButton}>
                    <Image
                        source={require('../../assets/imges/home.png')}
                        style={styles.navbarIcon}
                    />
                </View>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.navbarItem, activeTab === 'search' ? styles.activeNavItem : null]}
                onPress={handleSearchPress}
            >
                <Image 
                    source={require('../../assets/imges/search.png')}
                    style={styles.navbarIcon}
                />
            </TouchableOpacity>
      
            <TouchableOpacity
                style={[styles.navbarItem, activeTab === 'add' ? styles.activeNavItem : null]}
                onPress={handleAddNewRobotPress}
            >
                <Image
                    source={require('../../assets/imges/add.png')}
                    style={styles.navbarCenterIcon}
                />
            </TouchableOpacity>
      
            <TouchableOpacity 
                style={[styles.navbarItem, activeTab === 'profile' ? styles.activeNavItem : null]}
                onPress={handleProfilePress}
            >
                <Image
                    source={require('../../assets/imges/profile.png')}
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