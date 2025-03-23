import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import * as Font from "expo-font";

const RobotStatusHeader = ({robotId, batteryLevel}) => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
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
            <Text style={styles.robotIdLabel}>ROBOT_ID:</Text>
            <Text style={styles.robotIdText}>{robotId}</Text>
            </View>
            <View style={styles.batteryContainer}>
                <Image
                    style={styles.icon}
                    source={require("../../assets/imges/battery.png")}
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
        paddingVertical: 20,
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
    },
    batteryText: {
        fontSize: 12,
        marginLeft: 2,
        fontFamily: "Poppins_semibold",
    },
});
export default RobotStatusHeader;