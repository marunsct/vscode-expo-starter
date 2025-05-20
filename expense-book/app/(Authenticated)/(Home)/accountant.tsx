import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../features/theme/ThemeContext'; // Import the theme context

export default function Accountant() {
  const router = useRouter();
  const theme = useTheme(); // Access the theme

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token'); // Clear the token
    router.replace('/login'); // Redirect to login screen
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Accountant Screen</Text>
      <Button
        title="Logout"
        onPress={handleLogout}
        color={theme.colors.primary} // Apply theme color to the button
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});