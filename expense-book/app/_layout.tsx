import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { ThemeProvider } from '../features/theme/ThemeContext'; // adjust path if needed
import { store } from './store'; // adjust path if needed

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}/>
      </ThemeProvider>
    </Provider>
  );
}