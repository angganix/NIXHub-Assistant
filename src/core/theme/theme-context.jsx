import { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { resolveTheme } from './theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('system');
  const systemScheme = useColorScheme() || 'light';
  const theme = useMemo(() => resolveTheme(mode, systemScheme), [mode, systemScheme]);
  const value = useMemo(() => ({ ...theme, mode, setMode }), [theme, mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
