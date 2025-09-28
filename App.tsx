import React, { useState, useEffect } from 'react';
import { NavigationProvider, NavigationState, NotificationProvider } from './contexts/NavigationContext';
import SplashScreen from './components/pages/SplashScreen';
import LoginPage from './components/pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import PageRenderer from './components/pages/PageRenderer';
import useLocalStorage from './hooks/useLocalStorage';
import { initDB } from './utils/db';
import { Page, UserProfile } from './types';
import useTheme from './hooks/useTheme';
import useUserProfile from './hooks/useUserProfile';
import NotificationContainer from './components/ui/NotificationContainer';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);
  const [initialNavigation, setInitialNavigation] = useState<NavigationState | null>(null);
  const [, setUserProfile] = useUserProfile();
  useTheme(); // Initialize and apply the current theme

  // --- Animation State ---
  // isRendered lags behind isLoggedIn to allow for exit animations
  const [isRendered, setIsRendered] = useState(isLoggedIn);
  const [animationClass, setAnimationClass] = useState(isLoggedIn ? '' : 'layout-transition-enter-active');

  useEffect(() => {
    // When the actual login state changes...
    if (isLoggedIn !== isRendered) {
      // ...start the exit animation on the current component.
      setAnimationClass('layout-transition-exit-active');
      
      const timer = setTimeout(() => {
        // After the animation, update the rendered component to match the new state...
        setIsRendered(isLoggedIn);
        // ...and apply the enter animation for the new component.
        setAnimationClass('layout-transition-enter-active');
      }, 400); // Duration must match the exit animation in CSS

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, isRendered]);

  const handleTransitionEnd = () => {
    // After the enter animation finishes, remove the animation class.
    // This removes the 'transform' property from the container,
    // which was preventing the sticky header from working correctly.
    if (animationClass === 'layout-transition-enter-active') {
      setAnimationClass('');
    }
  };
  // --- End Animation State ---

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    initDB().then(success => {
      if (!success) {
        console.error("Failed to initialize the database. Image storage will not work.");
      }
    });

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (user: UserProfile, page?: Page, data?: any) => {
    if (page) {
      setInitialNavigation({ page, data });
    }
    // Set user role and ID based on login form
    setUserProfile(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setInitialNavigation(null);
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <NotificationProvider>
      <NotificationContainer />
      <div className={animationClass} onTransitionEnd={handleTransitionEnd}>
        {isRendered ? (
          <NavigationProvider initialNavigation={initialNavigation}>
            <MainLayout onLogout={handleLogout}>
              <PageRenderer />
            </MainLayout>
          </NavigationProvider>
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </div>
    </NotificationProvider>
  );
}

export default App;