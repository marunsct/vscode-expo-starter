import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { getUser, saveUser } from '../../database/db'; // Adjust the import path as necessary
import fetchApiData from '../../features/backend/initialDataAPIFetch';
import { fetchWithoutAuth, setToken } from '../../features/context/authContext';
import { setUser } from '../../features/context/contextSlice';
import { useTheme } from '../../features/theme/ThemeContext';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const dispatch = useDispatch()

  const handleLogin = async () => {
    setLoading(true);
    try {
      console.log('Logging in with:', { email, password });
      const response = await fetchWithoutAuth('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);
      // Check if the response is ok (status code 200-299)
      if (response.ok) {
        console.log('Login successful:');
        // Save token to AsyncStorage
        await setToken(data.token);
        let user = { ...data.user, token: data.token }; // Assuming the token is part of the user object 
        await saveUser(user); // Save user to the database
        user = await getUser(); // Fetch the user from the database
        console.log('User dispatched to redux:', user.userId);
        await dispatch(setUser(user)); // Update Redux store with user data
        console.log('User saved to redux:', user.userId);
        fetchApiData(dispatch, user); // Fetch initial data from the API
        // Check if biometric authentication is available
        const hasBiometricHardware = await LocalAuthentication.hasHardwareAsync();
        const isBiometricEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasBiometricHardware && isBiometricEnrolled) {
          const enableBiometric = await new Promise((resolve) => {
            Alert.alert(
              'Enable Biometric Authentication',
              'Would you like to enable biometric authentication for future logins?',
              [
                { text: 'No', onPress: () => resolve(false) },
                { text: 'Yes', onPress: () => resolve(true) },
              ]
            );
          });

          if (enableBiometric) {
            AsyncStorage.setItem('useBiometric', 'true');
            //Alert.alert('Biometric Authentication Enabled', 'You can now use biometrics to log in.');
          }
        }

        //Alert.alert('Login Successful', `Welcome!`);
        router.replace('/personal'); // Redirect to tabs
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.colors.primary, color: theme.colors.textPrimary },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Password</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.colors.primary, color: theme.colors.textPrimary },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {/* Row for Forgot Password and Sign Up */}
            <View style={styles.row}>
              <TouchableOpacity onPress={() => router.push('/reset-password')}>
                <Text style={[styles.link, { color: theme.colors.textSecondary }]}>Forgot Password?</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/signup')} style={styles.signupButton}>
                <Text style={[styles.signupText, { color: theme.colors.textPrimary }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
            <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} color={theme.colors.primary} />
          </View>
        </ScrollView>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  link: {
    textAlign: 'right',
    marginBottom: 16,
  },
  signupButton: {
    marginLeft: 'auto', // Push the Sign Up button to the right
  },
  signupText: {
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});