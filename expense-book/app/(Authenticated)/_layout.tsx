import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { createDrawerNavigator, DrawerNavigationProp } from '@react-navigation/drawer';
import { Slot, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../ThemeContext'; // Import the theme context
import Account from './account';
import Settings from './settings';

//import  from '../../../features/backend/initialDataAPIFetch';
const Drawer = createDrawerNavigator();

export default function AuthenticatedLayout() {
  const theme = useTheme(); // Access the theme
  const user = useSelector((state: any) => state.context.user)
  const dispatch = useDispatch()
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Drawer.Navigator
        screenOptions={{
          drawerStyle: { backgroundColor: theme.colors.background }, // Drawer background color
          drawerActiveTintColor: theme.colors.primary, // Active item color
          drawerInactiveTintColor: theme.colors.textSecondary, // Inactive item color
          headerStyle: { backgroundColor: theme.colors.primary }, // Header background color
          headerTintColor: theme.colors.background, // Header text color
        }}
      >
        {/* Home Screen with Tabs */}
        <Drawer.Screen
          name="Home"
          options={{
            title: 'Home',
            headerLeft: () => <DrawerToggleButton />, // Add drawer toggle button
            headerTitle: 'Expense Book',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
          component={HomeWrapper} // Use a wrapper to render nested routes
        />
        {/* Settings Screen */}
        <Drawer.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerTitle: 'Expense Book',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" color={color} size={size} />
            ),
          }}
          component={Settings} // Load the settings screen
        />
        {/* Account Screen */}
        <Drawer.Screen
          name="account"
          options={{
            title: 'Account',
            headerTitle: 'Expense Book',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
          }}
          component={Account} // Load the account screen
        />
      </Drawer.Navigator>
      {/* Offline indicator below header */}
      {isOffline && (
        <View style={{
          backgroundColor: '#ffcc00',
          padding: 4,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: 56, // Adjust if your header height is different
          left: 0,
          right: 0,
          zIndex: 100,
        }}>
          <Text style={{ color: '#333', fontSize: 12 }}>Your device is offline</Text>
        </View>
      )}
    </>
  );
}

// Wrapper for the Home screen to render nested routes
function HomeWrapper() {
  return <Slot />;
}

// Drawer toggle button component
const DrawerToggleButton = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ marginLeft: 16 }}>
      <Ionicons name="menu" size={24} color="white" />
    </TouchableOpacity>
  );
};