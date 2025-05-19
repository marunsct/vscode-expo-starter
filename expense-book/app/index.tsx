import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import ExpenseBookIcon from '../assets/images/expense-book-icon.svg'; // adjust path as needed
import { getUser, initializeDatabase } from '../database/db';
import fetchApiData from '../features/backend/initialDataAPIFetch';
import { syncPendingActions } from '../features/backend/syncDevicetoDB';
import { setUserAndGetState } from '../features/context/contextThunks';
import { getApiKey } from './authContext';
import { store } from './store';
import useDataSync from './useDataSync'; // <-- Add this import

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
      await initializeDatabase();
      const token = await AsyncStorage.getItem('token');
      const useBiometric = await AsyncStorage.getItem('useBiometric');
      if (token) {
        await getApiKey(token);
        await setUserInRedux();
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
              router.replace('/Authenticated/Home/personal');
              return;
            } else {
              Alert.alert('Authentication Failed', 'Please log in manually.');
              router.replace('/Unauthenticated/login');
              return;
            }
          } else {
            Alert.alert('Biometric Authentication Not Available', 'Please log in manually.');
            router.replace('/Unauthenticated/login');
            return;
          }
        } else {
          router.replace('/Unauthenticated/login');
        }
      } else {
        router.replace('/Unauthenticated/login');
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={styles.container}>
        <ExpenseBookIcon width={96} height={96} />
        <Text style={{ marginTop: 16, fontSize: 24, fontWeight: 'bold' }}>Expense Book</Text>
        <Text>Loading...</Text>
      </View>

    </View>
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
});