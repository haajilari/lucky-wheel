// src/utils/localStorage.ts

const APP_PREFIX = "luckyWheel_";

// Generic function to get an item from LocalStorage
export function getLocalStorageItem<T>(key: string): T | null {
  const prefixedKey = APP_PREFIX + key;
  const data = localStorage.getItem(prefixedKey);
  if (data) {
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error parsing LocalStorage item "${prefixedKey}":`, error);
      localStorage.removeItem(prefixedKey); // Clear corrupted data
      return null;
    }
  }
  return null;
}

// Generic function to set an item in LocalStorage
export function setLocalStorageItem<T>(key: string, value: T): void {
  const prefixedKey = APP_PREFIX + key;
  try {
    localStorage.setItem(prefixedKey, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting LocalStorage item "${prefixedKey}":`, error);
    // Potentially handle quota exceeded errors here
  }
}

// Function to remove an item from LocalStorage
export function removeLocalStorageItem(key: string): void {
  const prefixedKey = APP_PREFIX + key;
  localStorage.removeItem(prefixedKey);
}

// Specific key for our wheel data
export const WHEEL_DATA_KEY = "wheelData";
