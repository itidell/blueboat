import React, { useState, useEffect} from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, {Path, G} from 'react-native-svg';
import * as Font from 'expo-font';

import BottomNavBar from '../../Components/BottomNavBar';
import Header from '../../Components/Header';

const ErrorIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <G id="SVGRepo_iconCarrier">
      <Path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#FF3830" strokeWidth="2" />
      <Path d="M12 8L12 13" stroke="#FF3830" strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 16V15.9888" stroke="#FF3830" strokeWidth="2" strokeLinecap="round" />
    </G>
  </Svg>
);

const AddRobotScreen = () => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [robotId, setRobotId] = useState('');
  const [activeTab, setActiveTab] = useState('add');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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
    if (robotId.trim()) {
      navigation.navigate('AddRobotLoading', {robotId});
    } else {
      
      setErrorMessage("Please enter a robot ID");
    }
  };
  const handleCancel = () => {
    navigation.navigate('MainHome', { screen: 'HomeMain' });
  };
  const handleHomePress = () =>{
    navigation.navigate('MainHome', { screen: 'HomeMain' });
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
      <Header
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        notificationsEnabled={notificationsEnabled}
        onNotificationChange={handleNotificationChange}
      />

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
            {errorMessage ?(
              <View style={styles.errorContainer}>
                <View style ={styles.errorIconTextContainer}>
                  <ErrorIcon style={styles.errorIcon}/> 
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              </View>
            ) : null}
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
    marginTop: 60,
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
  errorContainer:{
    marginTop: 5,
    paddingLeft: 5,
    paddingVertical: 12,
    position:'absolute',
    top: 40,
  },
  errorIconTextContainer:{
    flexDirection : 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width:'auto',
  },
  errorText:{
    color:'#FF3830',
    fontFamily:'Poppins_semibold',
    fontSize: 14,
    marginLeft: 8,
    textAlign:'left', 
  },
  errorIcon:{
    marginTop: 2,
  },
});

export default AddRobotScreen;