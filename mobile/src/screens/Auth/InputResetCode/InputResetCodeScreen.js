import React from 'react';
import { Text, View, Dimensions, StatusBar, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';

import CustomButton from '../../../components/CustomButton/CustomButton';
import CustomInput from '../../../components/CustomInput/CustomInput';
import useAuth from '../../../context/auth/UseAuth';
import { commonStyles } from '../../../assets/styles/CommonStyles';
import { getLocalStorageItem } from '../../../utils/LocalStorage';

const { width, height } = Dimensions.get('screen');

const InputResetCodeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();

  const [scrollEnabled, setScrollEnabled] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const RegisterSchema = Yup.object().shape({
    resetCode: Yup.string().required(t('common.validation.emptyPassword', { ns: 'app' })),
    newPassword: Yup.string()
      .min(8, t('common.validation.passwordFormat', { ns: 'app' }))
      .required(t('common.validation.emptyPassword', { ns: 'app' }))
      .matches(
        /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/,
        t('common.validation.passwordFormat', { ns: 'app' }),
      ),
    reNewPassword: Yup.string()
      .required(t('common.validation.emptyPassword', { ns: 'app' }))
      .oneOf([Yup.ref('newPassword')], t('common.validation.passwordsDontMatch', { ns: 'app' })),
  });

  const onSubmit = async (values) => {
    const email = await getLocalStorageItem('@email');

    resetPassword({
      email,
      resetCode: values.resetCode,
      newPassword: values.newPassword,
      reNewPassword: values.reNewPassword,
    });

    navigation.navigate('Login');
  };

  return (
    <View style={commonStyles.keyboardAwareScrollViewWrapper}>
      <StatusBar barStyle="dark-content" />
      <Formik
        validateOnMount
        initialValues={{ resetCode: '', newPassword: '', reNewPassword: '' }}
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
            extraScrollHeight={Platform.OS === 'ios' ? 50 : 10}
            contentContainerStyle={commonStyles.keyboardAwareScrollViewContainer}
            keyboardShouldPersistTaps='handled'
          >
            <View style={{ width: width * 0.8, alignItems: 'center', marginTop: 25 }}>
              <CustomInput
                style={commonStyles.inputField}
                label="resetPassword.form.resetCode.label"
                iconName="account-outline"
                iconValidationName={!errors.resetCode ? 'check' : null}
                name="resetCode"
                onChangeText={handleChange('resetCode')}
                onBlur={handleBlur('resetCode')}
                onFocus={() => setIsFocused(true)}
                onEndEditing={() => setIsFocused(false)}
                value={values.resetCode}
                placeholder={t('resetPassword.form.resetCode.placeholder', { ns: 'app' })}
              />
              {errors.resetCode && touched.resetCode ? (
                <Text style={commonStyles.inputFieldError}>{errors.resetCode}</Text>
              ) : null}

              <CustomInput
                style={commonStyles.inputField}
                label="resetPassword.form.newPassword.label"
                iconName="lock-outline"
                iconValidationName={!errors.newPassword ? 'check' : null}
                name="newPassword"
                onChangeText={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
                onFocus={() => setIsFocused(true)}
                onEndEditing={() => setIsFocused(false)}
                value={values.newPassword}
                secureTextEntry
                placeholder={t('resetPassword.form.newPassword.placeholder', { ns: 'app' })}
              />
              {errors.newPassword && touched.newPassword ? (
                <Text style={commonStyles.inputFieldError}>{errors.newPassword}</Text>
              ) : null}

              <CustomInput
                style={commonStyles.inputField}
                label="resetPassword.form.reNewPassword.label"
                iconName="lock-outline"
                iconValidationName={!errors.reNewPassword ? 'check' : null}
                name="reNewPassword"
                onChangeText={handleChange('reNewPassword')}
                onBlur={handleBlur('reNewPassword')}
                onFocus={() => setIsFocused(true)}
                onEndEditing={() => setIsFocused(false)}
                value={values.reNewPassword}
                secureTextEntry
                placeholder={t('resetPassword.form.reNewPassword.placeholder', { ns: 'app' })}
              />
              {errors.reNewPassword && touched.reNewPassword ? (
                <Text style={commonStyles.inputFieldError}>{errors.reNewPassword}</Text>
              ) : null}

              <View style={commonStyles.footerContainer}>
                <CustomButton
                  text="resetPassword.submit"
                  onPress={handleSubmit}
                  btnColor={!isValid ? 'grey' : null}
                  disabled={!isValid}
                />
              </View>
            </View>
          </KeyboardAwareScrollView>
        )}
      </Formik>
    </View>
  );
};

export default InputResetCodeScreen;
