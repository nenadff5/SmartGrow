import React from 'react';
import { Text, View, Pressable, Dimensions, StatusBar, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';

import CustomButton from '../../../components/CustomButton/CustomButton';
import CustomInput from '../../../components/CustomInput/CustomInput';
import useAuth from '../../../context/auth/UseAuth';
import { commonStyles } from '../../../assets/styles/CommonStyles';

const { width, height } = Dimensions.get('screen');

const RegisterScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { register } = useAuth();

  const [scrollEnabled, setScrollEnabled] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const RegisterSchema = Yup.object().shape({
    name: Yup.string().required(t('register.form.name.required', { ns: 'app' })),
    email: Yup.string()
      .email(t('common.validation.invalidMail', { ns: 'app' }))
      .required(t('common.validation.emptyEmail', { ns: 'app' })),
    password: Yup.string()
      .min(8, t('common.validation.passwordFormat', { ns: 'app' }))
      .required(t('common.validation.emptyPassword', { ns: 'app' }))
      .matches(
        /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/,
        t('common.validation.passwordFormat', { ns: 'app' }),
      ),
    rePassword: Yup.string()
      .required(t('common.validation.emptyPassword', { ns: 'app' }))
      .oneOf([Yup.ref('password')], t('common.validation.passwordsDontMatch', { ns: 'app' })),
  });

  const onLoginPressed = () => {
    navigation.navigate('Login');
  };

  const onSubmit = (values) => {
    register({
      name: values.name,
      email: values.email,
      password: values.password,
      rePassword: values.rePassword,
    });
  };

  return (
    <View style={commonStyles.keyboardAwareScrollViewWrapper}>
      <StatusBar barStyle="dark-content" />
      <Formik
        validateOnMount
        initialValues={{ name: '', email: '', password: '', rePassword: '' }}
        validationSchema={RegisterSchema}
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
            extraScrollHeight={Platform.OS === 'ios' ? 175 : 125}
            contentContainerStyle={commonStyles.keyboardAwareScrollViewContainer}
            keyboardShouldPersistTaps='handled'
          >
            <View style={{ width: width * 0.8, alignItems: 'center' }}>
              <CustomInput
                style={commonStyles.inputField}
                label="register.form.name.label"
                iconName="account-outline"
                iconValidationName={!errors.name ? 'check' : null}
                name="name"
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                onFocus={() => setIsFocused(true)}
                onEndEditing={() => setIsFocused(false)}
                value={values.name}
                placeholder={t('register.form.name.placeholder', { ns: 'app' })}
              />
              {errors.name && touched.name ? (
                <Text style={commonStyles.inputFieldError}>{errors.name}</Text>
              ) : null}

              <CustomInput
                style={commonStyles.inputField}
                label="common.forms.email.label"
                iconName="email-outline"
                iconValidationName={!errors.email ? 'check' : null}
                name="email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                onFocus={() => setIsFocused(true)}
                onEndEditing={() => setIsFocused(false)}
                value={values.email}
                placeholder={t('common.forms.email.placeholder', { ns: 'app' })}
              />
              {errors.email && touched.email ? (
                <Text style={commonStyles.inputFieldError}>{errors.email}</Text>
              ) : null}

              <CustomInput
                style={commonStyles.inputField}
                label="common.forms.password.label"
                iconName="lock-outline"
                iconValidationName={!errors.password ? 'check' : null}
                name="password"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                onFocus={() => setIsFocused(true)}
                onEndEditing={() => setIsFocused(false)}
                value={values.password}
                secureTextEntry
                placeholder={t('common.forms.password.placeholder', { ns: 'app' })}
              />
              {errors.password && touched.password ? (
                <Text style={commonStyles.inputFieldError}>{errors.password}</Text>
              ) : null}

              <CustomInput
                style={commonStyles.inputField}
                label="common.forms.password.confirmLabel"
                iconName="lock-outline"
                iconValidationName={!errors.rePassword ? 'check' : null}
                name="rePassword"
                onChangeText={handleChange('rePassword')}
                onBlur={handleBlur('rePassword')}
                onFocus={() => setIsFocused(true)}
                onEndEditing={() => setIsFocused(false)}
                value={values.rePassword}
                secureTextEntry
                placeholder={t('common.forms.password.placeholder', { ns: 'app' })}
              />
              {errors.rePassword && touched.rePassword ? (
                <Text style={commonStyles.inputFieldError}>{errors.rePassword}</Text>
              ) : null}

              <View style={commonStyles.footerContainer}>
                <CustomButton
                  text="register.doRegister"
                  onPress={handleSubmit}
                  btnColor={!isValid ? 'grey' : null}
                  disabled={!isValid}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                  <Text style={{ alignSelf: 'center', color: 'grey' }}>
                    {t('register.alreadyHaveAnAccount', { ns: 'app' })}
                  </Text>
                  <Pressable onPress={onLoginPressed}>
                    <Text style={{ marginLeft: 5, color: 'rgb(44, 187, 116)' }}>
                      {t('register.login', { ns: 'app' })}
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

export default RegisterScreen;
