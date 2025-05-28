import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';
import { clearUserData } from '../../database/db'; // Adjust the import path as necessary
import { removeToken } from '../../features/context/authContext'; // Import the removeToken function
import { useTheme } from '../../features/theme/ThemeContext'; // Import the theme context

export default function Account() {
    const router = useRouter();
    const theme = useTheme(); // Access the theme
  const handleLogout = async () => {
    router.replace('/login'); // Redirect to login screen
   await removeToken(); // Clear the token
   await clearUserData(); // Clear user data from the database
   //await deleteAllTables(); // Delete all tables from the database
    // Redirect to login screen
  };
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Account Screen</Text>
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