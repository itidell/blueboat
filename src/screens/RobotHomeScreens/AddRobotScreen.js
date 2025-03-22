import React, { useState, useEffect, act } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar, TextInput } from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import LanguageSelector from '../../Componets/LanguageSelector';
import NotificationController from '../../Componets/NotificationController';
import BottomNavBar from '../../Componets/BottomNavBar';

const AddRobotScreen = () => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [robotId, setRobotId] = useState('');
  const [activeTab, setActiveTab] = useState('add');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins_semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
        'Poppins_bold': require('../../../assets/fonts/Poppins-Bold.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);


  const handleSave = () => {
    navigation.navigate('AddRobotLoading',{robotId});
  };
  const handleCancel = () => {
    navigation.goBack();
  };
  const handleHomePress = () =>{
    navigation.navigate('MainHome');
  };
  const handleLanguageChange = (language) =>{
    setSelectedLanguage(language);
    console.log('Language selected', language);
  };
  const handleNotificationChange = (isEnabled) =>{
    setNotificationsEnabled(isEnabled);
  }

  if (!fontsLoaded) return <View style={styles.container}><Text>Loading...</Text></View>;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#57C3EA" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <TouchableOpacity onPress={handleHomePress} >
            <Image
              source={require('../../../assets/imges/Logoo.png')} 
              style={styles.logoImage}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.welcomeText}>Hi, Welcome</Text>
            <Text style={styles.usernameText}>user name</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <LanguageSelector
            onLanguageChange={handleLanguageChange}
            initialLanguage={selectedLanguage}
          />
          <NotificationController
            onNotificationChange={handleNotificationChange}
            initialState={notificationsEnabled}
          />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>ROBOT ID</Text>
          
          <View style={styles.inputBox}>
            <TextInput
              style={styles.inputField}
              placeholder="ID........"
              placeholderTextColor="#888"
              value={robotId}
              onChangeText={setRobotId}
            />
          </View>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} navigation={navigation}/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#57C3EA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 8,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Poppins_semibold',
  },
  usernameText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Poppins_semibold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSmall: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    },
  formCard: {
    width: 339,
    height: 335,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    position: "absolute",
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: 20,
    fontFamily: 'Poppins_bold',
  },
  inputBox: {
    backgroundColor: '#E8F4EA',
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    height:45,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
    fontFamily:"Poppins_semibold",
  },
  inputField: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 12,
    paddingHorizontal:20,
    textAlign: 'left',
    fontFamily: 'Poppins_semibold',
  },
  saveButton: {
    backgroundColor: '#0077FF',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily:'Poppins_semibold',
    width:207,
    height:45,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins_semibold',
  },
  cancelButton: {
    backgroundColor: '#E8F4EA',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily:'Poppins_semibold',
    width:207,
    height:45,
    alignSelf: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
      color: '#0077FF',
      fontSize: 20,
      fontWeight: '600',
      fontFamily:'Poppins_semibold',
  },
});

export default AddRobotScreen;