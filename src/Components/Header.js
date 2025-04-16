import { View, Text, Image, StyleSheet } from "react-native";
import LanguageSelector from "./LanguageSelector";
import NotificationController from "./NotificationController";
import { useAuth } from "../api/authContext";
import NotificationCenter from "./NotificationCenter";


const Header = ({
    welcomeText = "Hi, Welcome",
    userName ,
    selectedLanguage,
    onLanguageChange,
    notificationsEnabled,
    onNotificationChange,
    }) => {
        const { user } = useAuth();
        const displayName = userName || user?.full_name || 'Guest';
        
        return (
            <View style={styles.header}>
                <View style={styles.welcomeContainer}>
                    <Image
                        style={styles.logoImage}
                        source={require("../../assets/images/Logoo.png")} 
                    />
                    <View>
                        <Text style={styles.welcomeText}>{welcomeText}</Text>
                        <Text style={styles.userNameText}>{displayName}</Text>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    <LanguageSelector
                        selectedLanguage={onLanguageChange}
                        initialLanguage={selectedLanguage}
                    />
                    <NotificationController
                        onNotificationChange={onNotificationChange}
                        initialState={notificationsEnabled}
                    />  
                    <NotificationCenter/>                    
                </View>
            </View>
        );
};
const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingTop:15,
        paddingBottom: 5,
    },
    welcomeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    logoImage: {
        width: 80,
        height: 80,
        resizeMode: "contain",
        marginRight: 8,
    },
    welcomeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    userNameText: {
        fontSize: 12,
        color: "#333",
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
    },
})
export default Header;