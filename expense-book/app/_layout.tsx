import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { ThemeProvider } from '../app/ThemeContext';
import { store } from './store'; // Adjust the import path as necessary

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token); // Set login status based on token presence
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    console.log('Login status:', isLoggedIn); // Log the login status
  }, [isLoggedIn]);

  return (
    <Provider store={store}>
      {isLoggedIn === null ? (
        <LinearGradient
          colors={['#4CAF50', '#2196F3']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        </LinearGradient>
      ) : (
        <ThemeProvider>
          <LinearGradient
            colors={['#4CAF50', '#2196F3']}
            style={styles.gradient}
          >
            <Slot />
          </LinearGradient>
        </ThemeProvider>
      )}
    </Provider>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
