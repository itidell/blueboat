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
                <Image
                    style={styles.icon}
                    source={require("../../assets/images/battery.png")}
                />
                <Text style={styles.batteryText}>{batteryLevel}%</Text>
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
        marginRight: 5,
    },
    batteryText: {
        fontSize: 12,
        marginLeft: 2,
        fontFamily: "Poppins_semibold",
    },
}); 

export default RobotStatusHeader;