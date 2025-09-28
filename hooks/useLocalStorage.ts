import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      // If no item, compute and set initial value in localStorage
      const valueToStore = initialValue instanceof Function ? initialValue() : initialValue;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    } catch (error) {
      console.error(`Error initializing localStorage key “${key}”:`, error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  });

  const setValue = useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (value) => {
      setStoredValue((currentValue) => {
        try {
          const valueToStore = value instanceof Function ? value(currentValue) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key } }));
          return valueToStore;
        } catch (error) {
          console.error(`Error setting localStorage key “${key}”:`, error);
          return currentValue;
        }
      });
    },
    [key]
  );

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      const eventKey = (event as StorageEvent).key ?? (event as CustomEvent).detail?.key;
      if (eventKey === key) {
        try {
          const item = window.localStorage.getItem(key);
          if (item !== null) {
            setStoredValue(JSON.parse(item));
          } else {
            const initial = initialValue instanceof Function ? initialValue() : initialValue;
            setStoredValue(initial);
          }
        } catch (error) {
          console.error(`Error handling storage change for key “${key}”:`, error);
        }
      }
    };

    // Listen for storage events from other tabs
    window.addEventListener('storage', handleStorageChange);
    // Listen for custom storage events from the same tab
    window.addEventListener('local-storage-update', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-update', handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
