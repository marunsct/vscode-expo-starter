import React, { createContext, useContext } from 'react';
import { theme } from './theme';

const ThemeContext = createContext(theme);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  danger: string;
  background: string;
  textPrimary: string;
  textSecondary: string;
  inputBorder: string;
  input: { borderColor: string };
  // Add any other color properties you might have, e.g., success, warning, buttonText
  error?: string; // Optional, as seen in ImagePickerModal
  buttonText?: string; // Optional, as seen in ImagePickerModal
};

export type ThemeTypographyFontSizes = {
  heading: number;
  body: number;
  label: number;
};

export type ThemeTypography = {
  fontFamily: string;
  fontSize: ThemeTypographyFontSizes;
};

export type ThemeComponentsStyles = {
  borderRadius: number;
  padding?: number; // Optional for button
  borderColor?: string; // Optional for input
  shadowColor?: string; // Optional for card
  shadowOpacity?: number; // Optional for card
  shadowRadius?: number; // Optional for card
};

export type ThemeComponents = {
  button: ThemeComponentsStyles;
  input: ThemeComponentsStyles;
  card: ThemeComponentsStyles;
};

export type Theme = {
  colors: ThemeColors;
  typography: ThemeTypography;
  components: ThemeComponents;
};
