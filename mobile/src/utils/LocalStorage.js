import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Returns value of the given key in the local storage
 * @param {string} key
 * @returns value in the local storage
 */
export async function getLocalStorageItem(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    // error reading value
  }
}

/**
 * Sets the value with the given key in the local storage
 * @param {string} key
 * @param {string} value
 */
export async function setLocalStorageItem(key, value) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // saving error
  }
}

/**
 * Removes the value with the given key from the local storage
 * @param {string} key
 */
export async function removeLocalStorageItem(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    // remove error
  }
}
