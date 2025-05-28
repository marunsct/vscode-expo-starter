import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import ExpenseBookIcon from '../assets/images/expense-book-icon.svg'; // adjust path as needed
import { getUser, initializeDatabase } from '../database/db';
import fetchApiData from '../features/backend/initialDataAPIFetch';
import { syncPendingActions } from '../features/backend/syncDevicetoDB';
import useDataSync from '../features/backend/useDataSync'; // <-- Add this import
import { getApiKey } from '../features/context/authContext';
import { setUserAndGetState } from '../features/context/contextThunks';
import HalfColorSpinner from '../features/UIComponents/HalfColorSpinner'; // Adjust the import path as necessary
import { store } from './store';
function AppContent() {
  const router = useRouter();
  const user = useSelector((state: any) => state.context.user); // Fix typing
  const dispatch = useDispatch();

  const setUserInRedux = async () => {
    try {
      let reduxUser = user;
      if (!user.userId && !user.user_id) {
        const dbUser = await getUser();
        if (dbUser) {
          reduxUser = await dispatch<any>(setUserAndGetState(dbUser));
        }
      }
      // Always fetch API data for the user
      if (reduxUser && (reduxUser.userId || reduxUser.user_id)) {
        await fetchApiData(dispatch, reduxUser);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {

        await initializeDatabase();
        const token = await AsyncStorage.getItem('token');
        const useBiometric = await AsyncStorage.getItem('useBiometric');
        console.log('Checking login status...');
        if (token) {
          console.log('getting API key from device storage');
          await getApiKey(token);
          console.log('API Key found in device storage');
          await setUserInRedux();
          console.log('User set in Context',);
          if (useBiometric === 'true') {
            const hasBiometricHardware = await LocalAuthentication.hasHardwareAsync();
            const isBiometricEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedBiometrics = await LocalAuthentication.supportedAuthenticationTypesAsync();
            if (hasBiometricHardware && isBiometricEnrolled) {
              const isFaceIDSupported = supportedBiometrics.includes(
                LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
              );
              const biometricAuth = await LocalAuthentication.authenticateAsync({
                promptMessage: isFaceIDSupported
                  ? 'Authenticate with Face ID'
                  : 'Authenticate with Biometrics',
              });
              if (biometricAuth.success) {
                router.replace('/friends');
                return;
              } else {
                Alert.alert('Authentication Failed', 'Please log in manually.');
                router.replace('/login');
                return;
              }
            } else {
              Alert.alert('Biometric Authentication Not Available', 'Please log in manually.');
              router.replace('/login');
              return;
            }
          } else {
            router.replace('/login');
          }
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        Alert.alert('Error', 'An error occurred while checking login status. Please try again.');
          router.replace('/login');
        }
      };

      checkLoginStatus();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncPendingActions();
      }
    });
    return () => unsubscribe();
  }, []);

  useDataSync(); // <-- Add this line

  return (
    <LinearGradient
      colors={['#4CAF50', '#2196F3']}
      style={styles.gradient}
    >
      <View style={styles.loadingContainer}>
        <View style={styles.container}>
          <ExpenseBookIcon width={96} height={96} />
          <Text style={{ marginTop: 16, fontSize: 24, fontWeight: 'bold' }}>Expense Book</Text>
          <HalfColorSpinner size={48} />
        </View>
      </View>
    </LinearGradient>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});