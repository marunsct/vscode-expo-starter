import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../../features/theme/ThemeContext'; // Import the theme context

export default function HomeLayout() {
  const theme = useTheme(); // Access the theme
  const user = useSelector((state: any) => state.context.user)
  // const dispatch = useDispatch()
  useEffect(() => {
    // This effect runs when the component mounts
    // You can perform any side effects here, such as fetching data or setting up subscriptions
    if (user.userId === undefined) {
      console.log('USer not found in redux');
    } else {
      console.log('User found in redux:', user.userId);
    }
  }, [user.userId]);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >

      <Tabs.Screen
        name="friends"
        options={{
          headerShown: false,
          title: 'Friends',
          //href: "/friends",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          headerShown: false,
          title: 'Groups',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="personal"
        options={{
          headerShown: false,
          title: 'Personal',
          //href: "/personal",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="accountant"
        options={{
          headerShown: false,
          title: 'Accountant',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator-outline" color={color} size={size} />
          ),
        }}
      />
      {/* Removed _add-expense modal tab. Use (modals)/add-expense for modal navigation. */}
    </Tabs>
  );
}