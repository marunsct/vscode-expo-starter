// filepath: /workspaces/vscode-expo-starter/expense-book/app/App.js

import { Provider as ReduxProvider } from 'react-redux';
import Index from './app/index'; // Adjust the path to your Friends component
import { store } from './app/store'; // Adjust the path to your Redux store
import { ThemeProvider } from './features/theme/ThemeContext'; // Adjust the path to your ThemeContext

//const Stack = createStackNavigator();

export default function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <Index/>
      </ThemeProvider>
    </ReduxProvider>
  );
}