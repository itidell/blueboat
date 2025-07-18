import React, { useState, useEffect } from 'react';
import { Dimensions, Modal } from 'react-native';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import LanguageSelector from '../../Components/LanguageSelector';
import NotificationController from '../../Components/NotificationController';
import { useAuth } from '../../api/authContext';
import { authService } from '../../api/authService';
import { useTranslation } from 'react-i18next';

const screenWidth = Dimensions.get('window').width;

// Edit Icon Component
const EditIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#666">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Close Icon Component
const CloseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#666">
    <Path d="M18 6L6 18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 6L18 18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout, updateProfile, loading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(user?.mobile_number || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('************');
  const [editButtonPressed, setEditButtonPressed] = useState(false);
  const [logoutButtonPressed, setLogoutButtonPressed] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { t } = useTranslation();
  // State for username
  const [username, setUsername] = useState(user?.full_name || '');
  
  // Modal state and temp values for editing
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordVerificationModalVisible, setPasswordVerificationModalVisible] = useState(false);
  const [usernameEditModalVisible, setUsernameEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState('');
  const [editingValue, setEditingValue] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // Password verification state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [passwordVerificationError, setPasswordVerificationError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false)

  useEffect(() =>{
    if (user){
      setUsername(user.full_name || '');
      setEmail(user.email || '');
      setPhoneNumber(user.mobile_number || '');
    }
  }, [user]);
  const handleHomePress = () => {
    navigation.navigate('Home');
  };
  const saveChanges = async () => {
    try {
        setUpdateSuccess(false);

        let updateData = {};
        if (editingField === 'phoneNumber') {
            updateData = {mobile_number: editingValue};
        } else if (editingField === 'username') {
            updateData = {full_name: editingValue};
        }

        if (Object.keys(updateData).length > 0) {
            const result = await updateProfile(updateData);

            if (editingField === 'phoneNumber') {
                setPhoneNumber(editingValue);
            } else if (editingField === 'username') {
                setUsername(editingValue);
            }

            setUpdateSuccess(true);
            // Fix the missing callback and add timeout duration
            setTimeout(() => setUpdateSuccess(false), 3000);
        }

        setModalVisible(false);
        setUsernameEditModalVisible(false);
    } catch (error) {
        Alert.alert(
            t('errors.updateFailed'), 
            error.message || t('profile.updateFailed'),
            [{ text: t('common.ok') }] 
        );
    }
};
  const handleChangePasswordPress = () => {
    setTimeout(() => {
        navigation.navigate('ForgetPassword');
    }, 150);
  };

  const handleEditProfile = (field, value, title) => {
    // First, open password verification modal
    setEditingField(field);
    setEditingValue(value);
    setModalTitle(title);
    setCurrentPasswordInput('');
    setPasswordVerificationError('');
    setPasswordVerificationModalVisible(true);
  };

  // New method to handle username edit
  const handleUsernameEdit = () => {
    setEditingField('username');
    setEditingValue(username);
    setUsernameEditModalVisible(true);
  };

  const verifyPassword = async() => {
    try{
      const verified = await authService.verifyPassword(currentPasswordInput);

      if(verified){
        setPasswordVerificationModalVisible(false);
        setModalVisible(true);
      }else{
        setPasswordVerificationError(t('profile.incorrectPassword'));
      }
    } catch (error){
      setPasswordVerificationError(t('profile.verificationFailed'));
      console.error("Password verification error:", error);
    }
  };

  // Removed duplicate saveChanges function
  const handleLogout = async() => {
    try{
      setLogoutButtonPressed(true);
      await logout();
      setTimeout(() =>{
        navigation.navigate('Login');
        setLogoutButtonPressed(false);
      }, 150);
    } catch (error){
      setLogoutButtonPressed(false)
      Alert.alerts(t('errors.logoutFailed') || t('errors.generic'), t('profile.logoutFail')); 
      console.error("Logout error:", error)
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    console.log('Language selected', language);
  };

  const handleNotificationChange = (isEnabled) => {
    setNotificationsEnabled(isEnabled);
  };

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins_semibold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
        'SecularOne-Regular': require('../../../assets/fonts/SecularOne-Regular.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  if (!fontsLoaded) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#57C3EA" barStyle="light-content" />
      
      {updateSuccess && (
        <View style={styles.successNotification}>
          <Text style = {styles.successText}>{t('profile.updateSuccess')}</Text>
        </View>
      )}
      {/* Header with Logo, Notifications and Language */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <TouchableOpacity onPress={handleHomePress}>
            <Image 
              source={require('../../../assets/images/Logoo.png')} 
              style={styles.logoImage}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.welcomeText}>{t('header.welcome')}</Text> 
            <Text style={styles.usernameText}>{username}</Text>
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
      {/* Form Container */}
      <View style={styles.formContainer}>
        {/* Profile Image */}
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={user?.profile_picture ? { uri: user.profile_picture } : require('../../../assets/images/profiles.jpg')}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.profileName}>{username}</Text>
          <TouchableOpacity 
            style={styles.verifiedBadge}
            onPress={handleUsernameEdit}
          >
            <Text style={styles.verifiedText}>{t('profile.verified')}</Text> 
            <Image 
              source={require('../../../assets/images/edit.png')}
              style={styles.verifiedIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>{t('profile.emailLabel')}</Text> 
          <View style={styles.inputBox}>
            <TextInput
              style={styles.inputField}
              value={email}
              editable={false}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
        
        {/* Phone Number Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>{t('profile.phoneLabel')}</Text> 
          <View style={styles.inputBox}>
            <TextInput
              style={styles.inputField}
              value={phoneNumber}
              editable={false}
              keyboardType="phone-pad"
            />
            <TouchableOpacity 
              style={styles.editIconContainer}
              onPress={() => handleEditProfile('phoneNumber', phoneNumber, 'Edit Phone Number')}
            >
              <EditIcon />
            </TouchableOpacity>
          </View>
        </View>


        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>{t('profile.passwordLabel')}</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.inputField}
              value={password}
              editable={false}
              secureTextEntry={true}
            />
            <TouchableOpacity 
              style={styles.editIconContainer}
              onPress={handleChangePasswordPress}
            >
              <EditIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[
            styles.logoutButton, 
            logoutButtonPressed && styles.logoutButtonPressed
          ]}
          onPressIn={() => setLogoutButtonPressed(true)}
          onPressOut={() => setLogoutButtonPressed(false)}
          onPress={handleLogout}
          disabled={loading}
        >
          <Text 
            style={[
              styles.logoutButtonText, 
              logoutButtonPressed && styles.logoutButtonTextPressed
            ]}
          >
            {t('profile.logoutButton')} 
          </Text>
        </TouchableOpacity>

        {/* Password Verification Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={passwordVerificationModalVisible}
          onRequestClose={() => setPasswordVerificationModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setPasswordVerificationModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
           
                  <View style={styles.modalView}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>{t('profile.verifyPasswordTitle')}</Text> 
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setPasswordVerificationModalVisible(false)}
                      >
                        <CloseIcon />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalContent}>
                      <Text style={styles.passwordVerificationText}>
                        {t('profile.verifyPasswordPrompt')} 
                      </Text>
                      <TextInput
                        style={styles.modalInput}
                        value={currentPasswordInput}
                        onChangeText={setCurrentPasswordInput}
                        secureTextEntry={true}
                        placeholder={t('profile.enterCurrentPasswordPlaceholder')}
                        autoFocus={true}
                      />
                      
                      {passwordVerificationError !== '' && (
                        <Text style={styles.errorText}>{passwordVerificationError}</Text>
                      )}
                      
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={verifyPassword}
                      >
                        <Text style={styles.saveButtonText}>{t('common.verify')}</Text> 
                      </TouchableOpacity>
                    </View>
                  </View>
                
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Edit Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  style={styles.centeredView}
                >
                  <View style={styles.modalView}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>{modalTitle}</Text>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                      >
                        <CloseIcon />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalContent}>
                      <TextInput
                      style={styles.modalInput}
                      value={editingValue}
                      onChangeText={setEditingValue}
                      keyboardType={editingField === 'phoneNumber' ? 'phone-pad' : editingField === 'email' ? 'email-address' : 'default'}
                      autoCapitalize={editingField === 'email' ? 'none' : 'sentences'}
                      // Translate placeholder dynamically based on editingField
                      // This requires specific placeholder keys like profile.phoneNumberPlaceholder or using a generic one
                       placeholder={
                           editingField === 'phoneNumber' 
                           ? t('signup.mobilePlaceholder') // Reusing signup placeholder
                           : editingField === 'username'
                             ? t('signup.fullNamePlaceholder') // Reusing signup placeholder
                             : t('common.enterValue') // Fallback if no specific key (needs adding)
                       }
                      autoFocus={true}
                       disabled={loading} // Disable while auth is loading
                    />
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={saveChanges}
                      >
                        <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Username Edit Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={usernameEditModalVisible}
          onRequestClose={() => setUsernameEditModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setUsernameEditModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  style={styles.centeredView}
                >
                  <View style={styles.modalView}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Edit Username</Text>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setUsernameEditModalVisible(false)}
                      >
                        <CloseIcon />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalContent}>
                      <TextInput
                        style={styles.modalInput}
                        value={editingValue}
                        onChangeText={setEditingValue}
                        placeholder="Enter your username"
                        autoFocus={true}
                      />
                      
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={saveChanges}
                      >
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
    backgroundColor: '#57C3EA',
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
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    width: screenWidth,
    position: 'absolute',
    top: 160,
    bottom: 0,
    fontFamily: 'Poppins_semibold',
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -65,
  },
  profileImageContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#57C3EA',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins_semibold',
    marginBottom: 5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f7ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  verifiedText: {
    fontSize: 12,
    color: '#098BEA',
    fontFamily: 'Poppins_semibold',
    marginRight: 4,
  },
  verifiedIcon: {
    width: 14,
    height: 14,
  },
  inputWrapper: {
    marginBottom: 15,
    marginTop: 15,
    fontFamily: 'Poppins_semibold',
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
    paddingLeft: 15,
    marginLeft: 6,
    fontFamily: 'Poppins_semibold',
  },
  inputBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    fontFamily: 'Poppins_semibold',
  },
  inputField: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 12,
    paddingHorizontal: 20,
    textAlign: 'left',
    fontFamily: 'Poppins_semibold',
    color: '#333',
  },
  editIconContainer: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#098BEA',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Poppins_semibold',
    width: 207,
    height: 45,
    alignSelf: 'center',
    marginBottom: 30,
  },
  logoutButtonPressed: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#098BEA',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_semibold',
  },
  logoutButtonTextPressed: {
    color: '#098BEA',
    fontFamily: 'Poppins_semibold',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
  },
  modalView: {
    width: '80%',
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins_semibold',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: 20,
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontFamily: 'Poppins_semibold',
  },
  saveButton: {
    backgroundColor: '#098BEA',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_semibold',
  },
  
  // Password Verification Styles
  passwordVerificationText: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
    fontFamily: 'Poppins_semibold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Poppins_semibold',
  }
});

export default ProfileScreen;