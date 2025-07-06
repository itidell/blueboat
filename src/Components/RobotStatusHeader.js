import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import * as Font from "expo-font";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';

const RobotStatusHeader = ({ robotId, batteryLevel, onLogout }) => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const navigation = useNavigation();
    const { t } = useTranslation();
    
    const handlenavigateTohomePress = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainHome', screen: 'HomeMain' }]
        });
    };
    
    useEffect(() => {
        const loadFonts = async () => {
            await Font.loadAsync({
                'Poppins_semibold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
                'Poppins_bold': require('../../assets/fonts/Poppins-Bold.ttf'),
            });
            setFontsLoaded(true);
        };
        loadFonts();
    }, []);
    
    // Get battery color based on level
    const getBatteryColor = () => {
        if (batteryLevel <= 20) {
            return "#E53935"; // Brighter red for low battery
        } else if (batteryLevel <= 40) {
            return "#FB8C00"; // Brighter orange for medium-low battery
        }else {
            return "#43A047"; // Brighter green for healthy battery
        }
    };
    
    const batteryColor = getBatteryColor();
    
    return(
        <View style={styles.container}>
            <View style={styles.robotInfo}>
                <Text style={styles.robotIdLabel}>{t('robotStatus.robotIdLabel')}</Text>
                <Text style={styles.robotIdText}>{robotId}</Text>
            </View>
            <View style={styles.batteryContainer}>
                <TouchableOpacity onPress={handlenavigateTohomePress}>
                    <Image
                        style={styles.icon}
                        source={require("../../assets/images/logout.png")}
                    />
                </TouchableOpacity>
                
                {/* Vertical battery indicator */}
                <View style={styles.batteryWrapper}>
                    <View style={styles.batteryTip} />
                    <View style={styles.batteryBody}>
                        <View 
                            style={[
                                styles.batteryFill, 
                                { 
                                    height: `${batteryLevel}%`,
                                    backgroundColor: batteryColor,
                                    bottom: 0 // Position from bottom
                                }
                            ]} 
                        />
                    </View>
                </View>
                
                <Text style={[styles.batteryText]}>
                    {batteryLevel}%
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 25,
        paddingVertical: 0,
    },
    robotInfo:{
        flex: 1,
        marginRight: 10,
    },
    robotIdLabel: {
        fontSize: 12,
        marginBottom: 2,
        fontFamily: "Poppins_semibold",
    },
    robotIdText: {
        fontSize: 18,
        letterSpacing: 0.5,
        fontFamily: "Poppins_bold",
    },
    batteryContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        width: 30,
        height: 30,
        resizeMode: "contain",
        marginRight: 8,
    },
    batteryWrapper: {
        flexDirection: 'column',
        alignItems: 'center',
        width: 18,
        height: 30,
        marginRight: 5,
    },
    batteryBody: {
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 3,
        width: '100%',
        height: 26,
        overflow: 'hidden',
        backgroundColor: '#333', // Darker background to make colors pop
        position: 'relative',
    },
    batteryFill: {
        width: '100%',
        position: 'absolute',
    },
    batteryTip: {
        width: 8,
        height: 2,
        backgroundColor: '#000',
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        marginBottom: 1,
    },
    batteryText: {
        fontSize: 15,
        color: '#000',
        marginLeft: 2,
        fontFamily: "Poppins_semibold",
    },
}); 

export default RobotStatusHeader;