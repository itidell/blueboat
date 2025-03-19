import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar, TextInput } from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  if (!fontsLoaded) return <View style={styles.container}><Text>Loading...</Text></View>;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#57C3EA" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Image 
            source={require('../../../assets/imges/Logoo.png')} 
            style={styles.logoImage}
          />
          <View>
            <Text style={styles.welcomeText}>Hi, Welcome</Text>
            <Text style={styles.usernameText}>User Name</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.languageButton}>
            <Image 
              source={require('../../../assets/imges/language.png')}
              style={styles.iconSmall}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <Image 
              source={require('../../../assets/imges/bell.png')}
              style={styles.iconSmall}
            />
          </TouchableOpacity>
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
          <Text style={styles.searchButtonText}> Search</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavbar}>
        <TouchableOpacity onPress={() => navigation.navigate('RobotHome')} style={styles.navbarItem}>
          <Image 
            source={require('../../../assets/imges/home.png')}
            style={styles.navbarIcon}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navbarItem}>
          <View style={styles.navbarIconContainer}>
            <Image 
              source={require('../../../assets/imges/search.png')}
              style={styles.navbarIcon}
            />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navbarItem}>
          <Image 
            source={require('../../../assets/imges/add.png')}
            style={styles.navbarCenterIcon}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navbarItem}>
          <Image 
            source={require('../../../assets/imges/profile.png')}
            style={styles.navbarIcon}
          />
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
  languageButton: {
    marginRight: 15,
  },
  notificationButton: {
    marginRight: 8,
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
    backgroundColor: '#FFFFFFFF',
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
  bottomNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#E8F4EA',
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
  navbarIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#57C3EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navbarCenterIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  }
});

export default SearchScreen;