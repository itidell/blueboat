import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar, TextInput, Modal } from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  const toggleLanguageModal = () => {
    setLanguageModalVisible(!languageModalVisible);
  };

  const toggleNotificationModal = () => {
    setNotificationModalVisible(!notificationModalVisible);
  };

  const selectLanguage = (language) => {
    setSelectedLanguage(language);
    setLanguageModalVisible(false);
    // Here you would implement the actual language change in your app
    console.log('Language selected:', language);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    console.log('Notifications:', notificationsEnabled ? 'Enabled' : 'Disabled');
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
          <TouchableOpacity style={styles.languageButton} onPress={toggleLanguageModal}>
            <Image 
              source={require('../../../assets/imges/language.png')}
              style={styles.iconSmall}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton} onPress={toggleNotificationModal}>
            <Image 
              source={require('../../../assets/imges/bell.png')}
              style={styles.iconSmall}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={toggleLanguageModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={toggleLanguageModal}
        >
          <View style={styles.languageModalContainer}>
            <View style={styles.languageModal}>
              <View style={styles.languageModalHeader}>
                <Text style={styles.languageModalTitle}>Select Language</Text>
                <TouchableOpacity onPress={toggleLanguageModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Language Options */}
              <TouchableOpacity 
                style={[styles.languageOption, selectedLanguage === 'EN' && styles.selectedLanguage]}
                onPress={() => selectLanguage('EN')}
              >
                <Text style={[styles.languageOptionText, selectedLanguage === 'EN' && styles.selectedLanguageText]}>English (EN)</Text>
                {selectedLanguage === 'EN' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.languageOption, selectedLanguage === 'AR' && styles.selectedLanguage]}
                onPress={() => selectLanguage('AR')}
              >
                <Text style={[styles.languageOptionText, selectedLanguage === 'AR' && styles.selectedLanguageText]}>العربية (AR)</Text>
                {selectedLanguage === 'AR' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.languageOption, selectedLanguage === 'FR' && styles.selectedLanguage]}
                onPress={() => selectLanguage('FR')}
              >
                <Text style={[styles.languageOptionText, selectedLanguage === 'FR' && styles.selectedLanguageText]}>Français (FR)</Text>
                {selectedLanguage === 'FR' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.applyButton} onPress={toggleLanguageModal}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Notification Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={notificationModalVisible}
        onRequestClose={toggleNotificationModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={toggleNotificationModal}
        >
          <View style={styles.notificationModalContainer}>
            <View style={styles.notificationModal}>
              <View style={styles.notificationModalHeader}>
                <Text style={styles.notificationModalTitle}>Notification Settings</Text>
                <TouchableOpacity onPress={toggleNotificationModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Notification Option */}
              <TouchableOpacity 
                style={styles.notificationOption}
                onPress={toggleNotifications}
              >
                <Text style={styles.notificationOptionText}>
                  {notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
                </Text>
                <Text style={styles.checkmark}>{notificationsEnabled ? '✓' : ''}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.applyButton} onPress={toggleNotificationModal}>
                <Text style={styles.applyButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

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

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavbar}>
        <TouchableOpacity onPress={() => navigation.navigate('RobotHome')} style={styles.navbarItem}>
          <Image 
            source={require('../../../assets/imges/home.png')}
            style={styles.navbarIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navbarItem}>
          <Image 
            source={require('../../../assets/imges/search.png')}
            style={styles.navbarIcon}
          />
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
  navbarCenterIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },

  // Language Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageModalContainer: {
    width: '80%',
    alignItems: 'center',
  },
  languageModal: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  languageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingBottom: 10,
    marginBottom: 15,
  },
  languageModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#098BEA',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    lineHeight: 22,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    justifyContent: 'space-between',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguage: {
    backgroundColor: '#E0F7FA',
  },
  selectedLanguageText: {
    fontWeight: 'bold',
  },
  checkmark: {
    fontSize: 18,
    color: '#098BEA',
  },
  applyButton: {
    backgroundColor: '#098BEA',
    borderRadius: 25,
    paddingVertical: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },

  // Notification Modal Styles
  notificationModalContainer: {
    width: '80%',
    alignItems: 'center',
  },
  notificationModal: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  notificationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingBottom: 10,
    marginBottom: 15,
  },
  notificationModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#098BEA',
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  notificationOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default SearchScreen;
