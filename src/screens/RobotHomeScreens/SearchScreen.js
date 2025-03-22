import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar, TextInput} from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import LanguageSelector from '../../Componets/LanguageSelector';
import NotificationController from '../../Componets/NotificationController';
import BottomNavBar from '../../Componets/BottomNavBar';


const SearchScreen = () => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins_semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  const handleSearch = () => {
    // Implement search functionality here
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
            <Text style={styles.usernameText}>User Name</Text>
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
      {/* Search Title */}
      <View style={styles.searchTitleContainer}>
        <Text style={styles.searchTitle}>Find Robot</Text>
      </View>

      {/* Search Input Container */}
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="ROBOT ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchIconButton}>
            <Image 
              source={require('../../../assets/imges/search1.png')}
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
  },
  usernameText: {
    fontSize: 12,
    color: '#333',
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
});

export default SearchScreen;
