import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Image } from 'react-native';

const LanguageSelector = ({ onLanguageChange, initialLanguage = 'EN' }) => {
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);

  const toggleLanguageModal = () => {
    setLanguageModalVisible(!languageModalVisible);
  };

  const selectLanguage = (language) => {
    setSelectedLanguage(language);
    setLanguageModalVisible(false);
    
    // Call the callback to inform parent component
    if (onLanguageChange) {
      onLanguageChange(language);
    }
    
    console.log('Language selected:', language);
  };

  return (
    <>
      {/* Language Button */}
      <TouchableOpacity style={styles.languageButton} onPress={toggleLanguageModal}>
        <Image 
          source={require('../../assets/imges/language.png')}
          style={styles.iconSmall}
        />
      </TouchableOpacity>

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
    </>
  );
};

const styles = StyleSheet.create({
  languageButton: {
    marginRight: 15,
  },
  iconSmall: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
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
});

export default LanguageSelector;