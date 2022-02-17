import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import { NavigationButton } from '../assets/styles/CommonStyles';
import OnboardingScreen from '../screens/Auth/Onboarding/OnboardingScreen';
import LoginScreen from '../screens/Auth/Login/LoginScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPassword/ForgotPasswordScreen';
import RegisterScreen from '../screens/Auth/Register/RegisterScreen';
import InputResetCodeScreen from '../screens/Auth/InputResetCode/InputResetCodeScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator initialRouteName="Onboarding">
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ header: () => null }}
      />
      <Stack.Screen name="Login" component={LoginScreen} options={{ header: () => {} }} />
      <Stack.Screen
        name="Signup"
        component={RegisterScreen}
        options={() => ({
          title: t('register.title', { ns: 'app' }),
          headerStyle: {
            height: 100,
            backgroundColor: '#f9fafd',
            shadowColor: '#f9fafd',
            elevation: 0,
          },
          headerLeft: () => <NavigationButton stack="Login" />,
        })}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={() => ({
          title: t('forgotPassword.title', { ns: 'app' }),
          headerLeft: () => <NavigationButton stack="Login" />,
        })}
      />
      <Stack.Screen
        name="InputResetCode"
        component={InputResetCodeScreen}
        options={() => ({
          title: t('resetPassword.title', { ns: 'app' }),
          headerLeft: () => <NavigationButton stack="ForgotPassword" />,
        })}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
