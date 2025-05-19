import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for icons
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../ThemeContext'; // Import the theme context

export default function TabLayout() {
  const theme = useTheme(); // Access the theme
  const user = useSelector((state:any) => state.context.user)
 // const dispatch = useDispatch()
  useEffect(() => {
    // This effect runs when the component mounts
    // You can perform any side effects here, such as fetching data or setting up subscriptions
    if(user.userId === undefined){
      console.log('USer not found in redux');
    }else{
      console.log('User found in redux:', user.userId);
    }
  }, [user.userId]);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: theme.colors.background }, // Tab bar background color
        tabBarActiveTintColor: theme.colors.primary, // Active tab icon color
        tabBarInactiveTintColor: theme.colors.textSecondary, // Inactive tab icon color
      }}
    >
      <Tabs.Screen
        name="personal"
        options={{
          headerShown: false,
          title: "Personal",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="accountant"
        options={{
          title: "Accountant",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}