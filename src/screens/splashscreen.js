import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const SplashScreen = ({ navigation }) => {
  // After a delay, navigate to your main app screen
  useEffect(() => {
    const timer = setTimeout(() => {
      // Replace 'MainScreen' with your actual main screen name
      navigation.replace('login');
    }, 3000); // 3 second delay

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>BlueBoat</Text>
    </View>
  );
};

// Define the styles only once at the top
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4FC6E8',
  },
  logo: {
    width: 150,
    height: 150,
  },
  text: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default SplashScreen;
