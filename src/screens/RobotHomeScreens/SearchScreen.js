import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar, TextInput, Keyboard} from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import Header from '../../Components/Header';
import { useRobot } from '../../api/robotContext';


const SearchScreen = () => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [validationError, setValidationError] = useState('');
  const { getRobot, currentRobot, loading, error, setCurrentRobot} = useRobot();
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins_semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);
  useEffect(() => {
    if(searchQuery){
      setValidationError('');
      setSearchError(null);
    }
  }, [searchQuery]);

  const validateRobotId = (id) =>{
    if (!id || id.trim() === ''){
      return 'Robot ID cannot be empty';
    }
    return ''
  }
  const handleSearch = async() => {
    Keyboard.dismiss();
    
    const validationMessage = validateRobotId(searchQuery);
    if (validationMessage){
      setValidationError(validationMessage);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try{
      const robotId = searchQuery.trim();
      const robot = await getRobot(robotId);
      if (robot){
        navigation.navigate('MainHome', { 
            screen: 'RobotHome',
            params: { robotId } 
          });
        setActiveTab('home');
      }
    }catch(err){
      setSearchError(err.message || 'Robot not found. Please check the ID and try again');
    }finally{
      setIsSearching(false)
    }
    console.log('Searching for:', searchQuery);
  };
  const handleHomePress = () =>{
    navigation.navigate('MainHome');
  };
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    console.log('Language selected:', language);
  };

  const handleNotificationChange = (isEnabled) => {
    setNotificationsEnabled(isEnabled);
  }
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchError(null);
    setValidationError('');
  };
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
      {/* Search Title */}
      <View style={styles.searchTitleContainer}>
        <Text style={styles.searchTitle}>Find Robot</Text>
      </View>

      {/* Search Input Container */}
      <View style={styles.searchContainer}>
        <View style={[styles.inputContainer,
              validationError ? styles.inputContainerError: null]}>
          <TextInput
            style={styles.searchInput}
            placeholder="ROBOT ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize='none'
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.searchIconButton} onPress={handleSearch}>
            <Image 
              source={require('../../../assets/images/search1.png')}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#57C3EA',
  },
  searchTitleContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 80,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    width: '100%',
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingVertical: 8,
    fontSize: 14,
  },
  searchIconButton: {
    padding: 8,
  },
  searchIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  searchButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  searchButtonText: {
    color: '#098BEA',
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainerError: {
    borderColor: '#FF4C4C',
  },
});

export default SearchScreen;
