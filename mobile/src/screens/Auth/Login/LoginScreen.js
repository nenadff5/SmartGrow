import React from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';

import CustomButton from '../../../components/CustomButton/CustomButton';
import CustomInput from '../../../components/CustomInput/CustomInput';

import useAuth from '../../../context/auth/UseAuth';
import { commonStyles } from '../../../assets/styles/CommonStyles';

const { width, height } = Dimensions.get('screen');

const ForgotPasswordScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { login } = useAuth();

  const [scrollEnabled, setScrollEnabled] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [extraScrollHeight, setExtraScrollHeight] = React.useState(0);

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('common.validation.invalidMail', { ns: 'app' }))
      .required(t('common.validation.emptyEmail', { ns: 'app' })),
    password: Yup.string().required(t('common.validation.emptyPassword', { ns: 'app' })),
  });

  const onSubmit = (values) => {
    login({ email: values.email, password: values.password });
  };

  const onForgotPasswordPressed = () => {
    navigation.navigate('ForgotPassword');
  };

  const onRegisterPressed = () => {
    navigation.navigate('Signup');
  };

  return (
    <View style={commonStyles.keyboardAwareScrollViewWrapper}>
      <StatusBar barStyle="light-content" translucent={true} backgroundColor={'transparent'} />
      <Formik
        validateOnMount
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={onSubmit}>
        {({ handleChange, handleSubmit, handleBlur, values, errors, touched, isValid }) => (
          <KeyboardAwareScrollView
            scrollEnabled={scrollEnabled}
            onContentSizeChange={(contentWidth, contentHeight) => {
              const viewHeight = contentHeight + 115;

              viewHeight > height && !isFocused ? setScrollEnabled(true) : setScrollEnabled(false);
            }}
            enableOnAndroid
            bounces={false}
            showsVerticalScrollIndicator={false}
            extraScrollHeight={Platform.OS === 'ios' ? 45 : extraScrollHeight}
            contentContainerStyle={commonStyles.keyboardAwareScrollViewContainer}
            keyboardShouldPersistTaps='handled'  
          >
            <Image
              style={styles.image}
              source={require('../../../assets/images/login/loginImage.png')}
              resizeMode="stretch"
            />
            <View style={styles.welcomeTextContainer}>
              <Text style={{ fontSize: 25, marginBottom: 5 }}>
                {t('login.welcome', { ns: 'app' })}
              </Text>
              <Text style={{ fontSize: 15, color: 'grey' }}>
                {t('login.signToContinue', { ns: 'app' })}
              </Text>
            </View>
            <View style={{ width: width * 0.8, alignItems: 'center' }}>
              <CustomInput
                name="email"
                label="common.forms.email.label"
                iconName="email-outline"
                iconValidationName={!errors.email ? 'check-square' : null}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                onEndEditing={() => {
                  setIsFocused(false);
                }}
                onFocus={() => {
                  setIsFocused(true);
                  setScrollEnabled(false);
                }}
                value={values.email}
                placeholder={t('common.forms.email.placeholder', { ns: 'app' })}
              />
              {errors.email && touched.email ? (
                <Text style={commonStyles.inputFieldError}>{errors.email}</Text>
              ) : null}
              <CustomInput
                label="common.forms.password.label"
                iconName="lock-outline"
                name="password"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('email')}
                onEndEditing={() => {
                  setIsFocused(false);
                  setExtraScrollHeight(0);
                }}
                onFocus={() => {
                  setIsFocused(true);
                  setScrollEnabled(false);
                  setExtraScrollHeight(75);
                }}
                value={values.password}
                secureTextEntry
                placeholder={t('common.forms.password.placeholder', { ns: 'app' })}
              />

              <View style={{ flexDirection: 'row' }}>
                {errors.password && touched.password ? (
                  <Text style={commonStyles.inputFieldError}>{errors.password}</Text>
                ) : null}
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <Pressable onPress={onForgotPasswordPressed}>
                    <Text>{t('login.forgotPassword', { ns: 'app' })}</Text>
                  </Pressable>
                </View>
              </View>
              <View style={commonStyles.footerContainer}>
                <CustomButton
                  text="login.signIn"
                  btnColor={!isValid ? 'grey' : null}
                  disabled={!isValid}
                  onPress={handleSubmit}
                />
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ color: 'grey' }}>{t('login.dontHaveAccount', { ns: 'app' })}</Text>
                  <Pressable onPress={onRegisterPressed}>
                    <Text style={{ marginLeft: 5, color: 'rgb(44, 187, 116)' }}>
                      {t('login.goRegister', { ns: 'app' })}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </KeyboardAwareScrollView>
        )}
      </Formik>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafd',
  },
  image: {
    width: '100%',
    height: height * 0.35,
    resizeMode: 'cover',
  },
  welcomeTextContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
});
