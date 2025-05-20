import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import CountryPicker, { CountryCode } from 'react-native-country-picker-modal'; // Import country picker and CountryCode type
import { useTheme } from '../../features/theme/ThemeContext'; // Import the theme context

export default function Signup() {
  const router = useRouter();
  const theme = useTheme(); // Access the theme
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('US'); // Default country code with explicit type
  const [callingCode, setCallingCode] = useState('1'); // Default calling code
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    try {
      const fullPhoneNumber = `+${callingCode}${phoneNumber}`; // Concatenate country code and phone number
      const response = await fetch('https://expensebook-rea1.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, phoneNumber: fullPhoneNumber }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Account created successfully. Please log in.');
        router.replace('/login'); // Redirect to login
      } else {
        const data = await response.json();
        Alert.alert('Error', data.error || 'Failed to create account.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text
        style={[
          styles.title,
          { color: theme.colors.primary, fontSize: theme.typography.fontSize.heading },
        ]}
      >
        User Information
      </Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary },
        ]}
        placeholder="First Name"
        placeholderTextColor={theme.colors.textSecondary}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={[
          styles.input,
          { borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary },
        ]}
        placeholder="Last Name"
        placeholderTextColor={theme.colors.textSecondary}
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={[
          styles.input,
          { borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary },
        ]}
        placeholder="Email"
        placeholderTextColor={theme.colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[
          styles.input,
          { borderColor: theme.colors.inputBorder, color: theme.colors.textPrimary },
        ]}
        placeholder="Password"
        placeholderTextColor={theme.colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={[styles.phoneContainer, { borderColor: theme.colors.inputBorder }]}>
        <CountryPicker
          countryCode={countryCode}
          withFilter
          withFlag={true} // Disable flag display
          withCallingCode // Enable phone code display
          withCountryNameButton={false} // Disable country name display
          onSelect={(country) => {
            setCountryCode(country.cca2);
            setCallingCode(country.callingCode[0]);
          }}
        />
        <TextInput
          style={[
            styles.phoneInput,
            { color: theme.colors.textPrimary },
          ]}
          placeholder="Phone Number"
          placeholderTextColor={theme.colors.textSecondary}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
      </View>
      <Button
        title={loading ? 'Signing up...' : 'Sign Up'}
        onPress={handleSignup}
        disabled={loading}
        color={theme.colors.primary} // Apply theme color to the button
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontWeight: 'bold', // Keep bold styling
    marginBottom: 20,
    textAlign: 'center', // Center-align the title for better UI
  },
  input: {
    height: 40,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  phoneInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
  },
});