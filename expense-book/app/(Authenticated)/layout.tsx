import { LinearGradient } from 'expo-linear-gradient';
import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
import { ThemeProvider } from '../../features/theme/ThemeContext';
import { store } from '../store';

export default function AuthenticatedLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <LinearGradient colors={['#4CAF50', '#2196F3']} style={{ flex: 1 }}>
          <Slot />
        </LinearGradient>
      </ThemeProvider>
    </Provider>
  );
}
