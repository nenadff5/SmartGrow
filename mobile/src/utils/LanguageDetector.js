import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

const LanguageDetectorPlugin = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async function (callback) {
    try {
      await AsyncStorage.getItem('@appLang').then((language) => {
        if (language) {
          return callback(language);
        } else {
          return callback(Localization.locale);
        }
      });
    } catch (error) {
      console.log('Error reading language', error);
    }
  },
  cacheUserLanguage: async function (language) {
    try {
      await AsyncStorage.setItem('@appLang', language);
    } catch (error) {
      console.log('Error caching language', error);
    }
  },
};

export default LanguageDetectorPlugin;
