import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import { NavigationButton } from '../assets/styles/CommonStyles';

import ProfileScreen from '../screens/App/Profile/ProfileScreen';
import EditProfileScreen from '../screens/App/Profile/Edit/EditProfileScreen';
import ChangePasswordScreen from '../screens/App/Profile/ChangePassword/ChangePasswordScreen';
import ChangeLanguageScreen from '../screens/App/Profile/ChangeLanguage/ChangeLanguageScreen';

const ProfileStack = createStackNavigator();

function ProfileStackScreen() {
  const { t } = useTranslation();

  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          title: t('profile.title', { ns: 'app' }),
          headerTitleAlign: 'center',
          headerStatusBarHeight: Platform.OS === 'ios' ? 20 : null,
        }}
      />
      <ProfileStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={() => ({
          title: t('profile.changePassword.title', { ns: 'app' }),
          headerTitleAlign: 'center',
          headerStatusBarHeight: Platform.OS === 'ios' ? 20 : null,
          unmountOnBlur: true,
          tabBarButton: () => null,
          headerLeft: () => <NavigationButton stack="Profile" screen="ProfileScreen" />,
        })}
      />
      <ProfileStack.Screen
        name="ChangeLanguage"
        component={ChangeLanguageScreen}
        options={() => ({
          title: t('profile.changeLanguage.title', { ns: 'app' }),
          headerTitleAlign: 'center',
          unmountOnBlur: true,
          headerStatusBarHeight: Platform.OS === 'ios' ? 20 : null,
          tabBarButton: () => null,
          headerLeft: () => <NavigationButton stack="Profile" screen="ProfileScreen" />,
        })}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={() => ({
          title: t('profile.editProfile.title', { ns: 'app' }),
          headerTitleAlign: 'center',
          headerStatusBarHeight: Platform.OS === 'ios' ? 20 : null,
          unmountOnBlur: true,
          tabBarButton: () => null,
          headerLeft: () => <NavigationButton stack="Profile" screen="ProfileScreen" />,
        })}
      />
    </ProfileStack.Navigator>
  );
}

export default ProfileStackScreen;
