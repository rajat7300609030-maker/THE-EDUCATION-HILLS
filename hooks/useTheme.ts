import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

type Theme = 'light' | 'dark';

function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);

  return [theme, setTheme];
}

export default useTheme;