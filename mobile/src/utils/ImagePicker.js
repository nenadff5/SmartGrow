import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

import { translateWithoutHook } from '../utils/i18n';

/**
 * Returns either base64 or uri of the image picked from the library
 * @param {{base64: boolean}} options
 */
export async function pickImageFromLibraryUtil({ base64 = false }) {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === 'granted') {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 1],
        quality: 0.5,
        base64: base64 ?? true,
      });

      if (!result.cancelled) {
        return base64 ? result.base64 : result.uri;
      }
    } else {
      Alert.alert(
        translateWithoutHook('common.permissions.gallery.title', 'app'),
        translateWithoutHook('common.permissions.gallery.text', 'app'),
        [
          {
            text: translateWithoutHook('common.modal.close', 'app'),
          },
          {
            text: translateWithoutHook('common.modal.goToSettings', 'app'),
            onPress: () => Linking.openSettings(),
          },
        ],
      );
    }
  } catch (e) {
    console.log(e);
  }
}

/**
 * Returns either base64 or uri of the image picked from the camera
 * @param {{base64: boolean}} options
 */
export async function pickImageFromCameraUtil({ base64 = false }) {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status === 'granted') {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 1],
        quality: 0.5,
        base64: base64 ?? true,
      });

      if (!result.cancelled) {
        return base64 ? result.base64 : result.uri;
      }
    } else {
      Alert.alert(
        translateWithoutHook('common.permissions.camera.title', 'app'),
        translateWithoutHook('common.permissions.camera.text', 'app'),
        [
          {
            text: translateWithoutHook('common.modal.close', 'app'),
          },
          {
            text: translateWithoutHook('common.modal.goToSettings', 'app'),
            onPress: () => Linking.openSettings(),
          },
        ],
      );
    }
  } catch (e) {
    console.log(e);
  }
}
