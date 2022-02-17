import React, { useState, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Linking,
  Platform,
  Alert,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';

import useAuth from '../../../context/auth/UseAuth';
import { pickImageFromCameraUtil, pickImageFromLibraryUtil } from '../../../utils/ImagePicker';
import {
  setLocalStorageItem,
  getLocalStorageItem,
  removeLocalStorageItem,
} from '../../../utils/LocalStorage';
import LoadingScreen from '../../../components/LoadingIndicator/LoadingIndicator';
import Card from './Card';
import { commonStyles } from '../../../assets/styles/CommonStyles';
import jwt_decode from 'jwt-decode';

const { height } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = React.useState();
  const [userName, setUserName] = React.useState('John Doe');

  const [scrollEnabled, setScrollEnabled] = React.useState(false);

  useEffect(async () => {
    const localStorageItem = await getLocalStorageItem('@profileImage');
    const localStorageToken = await getLocalStorageItem('@token');
    const decodedData = jwt_decode(localStorageToken);

    setUserName(decodedData.name);
    setProfileImage(localStorageItem);
    setLoading(false);
  });

  const pickImage = (handleChange) => {
    Alert.alert(
      t('profile.form.image.pickFromTitle', { ns: 'app' }),
      t('profile.form.image.pickFromText', { ns: 'app' }),
      [
        {
          text: t('common.modal.cancel', { ns: 'app' }),
        },
        {
          text: t('profile.form.image.pickFromGallery', { ns: 'app' }),
          onPress: () => {
            pickImageFromLibrary(handleChange('photo'));
          },
        },
        {
          text: t('profile.form.image.pickFromCamera', { ns: 'app' }),
          onPress: () => {
            pickImageFromCamera(handleChange('photo'));
          },
        },
      ],
      { cancelable: true },
    );
  };

  const pickImageFromLibrary = async (handleChange) => {
    let result = await pickImageFromLibraryUtil({ base64: true });

    if (result) {
      handleChange(result);
      setLocalStorageItem('@profileImage', result);
    }
  };

  const pickImageFromCamera = async (handleChange) => {
    let result = await pickImageFromCameraUtil({ base64: true });

    if (result) {
      handleChange(result);
      setLocalStorageItem('@profileImage', result);
    }
  };

  const removeImage = (handleChange) => {
    handleChange('');
    removeLocalStorageItem('@profileImage');
  };

  const onSubmit = async () => {
    navigation.reset({
      routes: [{ name: 'Profile', screen: 'ProfileScreen' }],
    });
  };

  const handleLogout = () => {
    logout();
  };

  const handleNotifications = () => {
    {
      Platform.OS === 'ios' ? Linking.openURL('app-settings://') : Linking.openSettings();
    }
  };

  return loading ? (
    <LoadingScreen />
  ) : (
    <View style={commonStyles.keyboardAwareScrollViewWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      <ScrollView
        scrollEnabled={scrollEnabled}
        onContentSizeChange={(contentWidth, contentHeight) => {
          const viewHeight = contentHeight + 110;

          viewHeight > height ? setScrollEnabled(true) : setScrollEnabled(false);
        }}
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        contentContainerStyle={commonStyles.keyboardAwareScrollViewContainer}>
        <Formik validateOnMount initialValues={{ photo: profileImage }} onSubmit={onSubmit}>
          {({ handleChange, values }) => (
            <View style={styles.imageUploadWrapper1}>
              {values.photo ? (
                <View style={styles.imageUploadWrapper2}>
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${values.photo}` }}
                    style={styles.profileImage}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      removeImage(handleChange('photo'));
                    }}
                    style={styles.imageUploadBtn}
                    activeOpacity={0.7}>
                    <MaterialIcons
                      name="remove"
                      size={15}
                      color="white"
                      style={Platform.OS === 'ios' ? { marginTop: 1, marginLeft: 1 } : null}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.imageUploadWrapper2}
                  activeOpacity={0.7}
                  onPress={() => pickImage(handleChange)}>
                  <FontAwesome5 name="user-alt" size={25} color="white" />
                  <View style={styles.imageUploadBtn}>
                    <MaterialIcons
                      name="camera-alt"
                      size={15}
                      color="white"
                      style={Platform.OS === 'ios' ? { marginTop: 1, marginLeft: 1 } : null}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Formik>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>{userName}</Text>
        <Card
          label={t('profile.editProfile.title', { ns: 'app' })}
          iconsLibrary="MaterialCommunityIcons"
          icon="pencil"
          onPress={() => navigation.navigate('Profile', { screen: 'EditProfile' })}
        />

        <Card
          label={t('profile.changePassword.title', { ns: 'app' })}
          iconsLibrary="MaterialCommunityIcons"
          icon="lock"
          onPress={() => navigation.navigate('Profile', { screen: 'ChangePassword' })}
        />

        <Card
          label={t('profile.changeLanguage.title', { ns: 'app' })}
          iconsLibrary="MaterialCommunityIcons"
          icon="web"
          onPress={() => navigation.navigate('Profile', { screen: 'ChangeLanguage' })}
        />

        <Card
          label={t('profile.notifications.title', { ns: 'app' })}
          iconsLibrary="MaterialCommunityIcons"
          icon="bell-ring"
          onPress={handleNotifications}
        />

        <Card
          label={t('profile.website.title', { ns: 'app' })}
          iconsLibrary="MaterialCommunityIcons"
          icon="search-web"
          onPress={() => Linking.openURL('https://www.google.com')}
        />

        <View style={styles.footer}>
          <Card
            label={t('profile.logout.title', { ns: 'app' })}
            iconsLibrary="MaterialIcon"
            icon="logout"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafd',
    alignItems: 'center',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 35,
    marginBottom: 15,
  },
  imageUploadWrapper1: {
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 100,
    height: 65,
    width: 65,
    borderColor: 'lightgray',
    borderStyle: 'solid',
    padding: 2.5,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploadWrapper2: {
    height: '100%',
    width: '100%',
    borderRadius: 100,
    backgroundColor: 'rgb(193, 193, 193)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploadBtn: {
    position: 'absolute',
    width: 25,
    height: 25,
    bottom: -5,
    right: -5,
    backgroundColor: 'rgb(44, 187, 116)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  profileImage: {
    borderRadius: 100,
    width: '95%',
    height: '95%',
    overflow: 'hidden',
    resizeMode: 'cover',
  },
});
