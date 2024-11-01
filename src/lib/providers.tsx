import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { usePreferences } from '@/lib/hooks/use-preferences';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { theme } = usePreferences();
  return (
    <NextThemesProvider {...props} defaultTheme={theme}>
      {children}
    </NextThemesProvider>
  );
}