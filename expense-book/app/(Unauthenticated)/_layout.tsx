import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for icons
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTheme } from '../ThemeContext'; // Import the theme context
import Login from './login';
import ResetPassword from './reset-password';
import Signup from './signup';

const Drawer = createDrawerNavigator();

export default function UnauthenticatedLayout() {
  const theme = useTheme(); // Access the theme

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: { backgroundColor: theme.colors.background }, // Apply background color
        drawerActiveTintColor: theme.colors.primary, // Active item color
        drawerInactiveTintColor: theme.colors.textSecondary, // Inactive item color
        headerStyle: { backgroundColor: theme.colors.primary }, // Header background
        headerTintColor: theme.colors.background, // Header text color
      }}
    >
      <Drawer.Screen
        name="login"
        options={{
          title: 'Login',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-in-outline" color={color} size={size} />
          ),
        }}
        component={Login} // Load the login screen
      />
      <Drawer.Screen
        name="signup"
        options={{
          title: 'Sign Up',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-add-outline" color={color} size={size} />
          ),
        }}
        component={Signup} // Load the sign-up screen
      />
      <Drawer.Screen
        name="reset-password"
        options={{
          title: 'Reset Password',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="key-outline" color={color} size={size} />
          ),
        }}
        component={ResetPassword} // Load the reset-password screen
      />
    </Drawer.Navigator>
  );
}